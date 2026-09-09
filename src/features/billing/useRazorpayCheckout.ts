/**
 * features/billing/useRazorpayCheckout.ts
 *
 * Per 02-api-reference.md "POST /billing/checkout-order": our backend
 * returns a Razorpay ORDER (order_id, key_id, amount_paise, currency), NOT
 * a hosted checkout URL. The frontend must load Razorpay's own checkout.js
 * widget and open it with those values.
 *
 * Widget integration shape below is confirmed directly against Razorpay's
 * current own documentation (razorpay.com/docs - Standard Checkout /
 * Integration Steps), per this spec's explicit instruction to fetch
 * Razorpay's own docs rather than guess:
 *   <script src="https://checkout.razorpay.com/v1/checkout.js">
 *   const options = { key, amount, currency, order_id, handler, modal:{ondismiss} }
 *   new Razorpay(options).open()
 *
 * The actual payment confirmation and subscription upgrade happens
 * server-to-server via a webhook (see 02-api-reference.md) - this hook's
 * only real job after the widget's success callback fires is to re-fetch
 * GET /billing/subscription after a short delay, since the webhook may
 * arrive slightly after the client-side callback.
 */
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCheckoutOrder } from "./api";

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const queryClient = useQueryClient();
  const isOpeningRef = useRef(false);

  const openCheckout = useCallback(async () => {
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    try {
      await loadRazorpayScript();
      const order = await createCheckoutOrder();

      const options = {
        key: order.key_id,
        amount: order.amount_paise,
        currency: order.currency,
        order_id: order.order_id,
        name: "heyHi",
        description: "Upgrade to Pro",
        handler: () => {
          // Client-side success callback. The webhook that actually
          // confirms payment and upgrades the subscription may lag
          // slightly behind this - re-fetch after a short delay rather
          // than assuming the plan is already upgraded synchronously.
          toast.success("Payment received - confirming your upgrade…");
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: ["billing", "subscription"],
            });
          }, 3000);
        },
        modal: {
          ondismiss: () => {
            isOpeningRef.current = false;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
    } finally {
      isOpeningRef.current = false;
    }
  }, [queryClient]);

  return { openCheckout };
}
