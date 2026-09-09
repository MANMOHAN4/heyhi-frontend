import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCheckoutOrder } from "@/features/billing/api";
import type {
  CheckoutOrderResponse,
  RazorpayPaymentSuccess,
} from "@/features/billing/types";
import { ApiError } from "@/lib/apiError";

const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (
        eventName: "payment.failed",
        callback: (response: RazorpayPaymentFailure) => void,
      ) => void;
    };
  }
}

type RazorpayPaymentFailure = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    source?: string;
    step?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccess) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
};

function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => reject(new Error("Razorpay checkout could not be loaded.")),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.async = true;

    script.onload = () => resolve();

    script.onerror = () => {
      reject(new Error("Razorpay checkout could not be loaded."));
    };

    document.body.appendChild(script);
  });
}

function getCheckoutErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "Your session has expired. Please sign in again.";
    }

    return error.message || "Couldn't start checkout.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Couldn't start checkout. Please try again.";
}

function createRazorpayOptions(
  order: CheckoutOrderResponse,
  onSuccess: () => void,
  onDismiss: () => void,
): RazorpayCheckoutOptions {
  return {
    key: order.key_id,
    order_id: order.order_id,
    amount: order.amount_paise,
    currency: order.currency,

    name: "heyHi",
    description: "heyHi Pro subscription",

    /*
     * This callback confirms the payment interaction on the client.
     * It does NOT itself upgrade the backend subscription.
     *
     * The actual upgrade is confirmed by the signed Razorpay webhook sent
     * server-to-server to the backend. We refetch the subscription after
     * a short delay in onSuccess(), allowing webhook processing to finish.
     */
    handler: (_payment: RazorpayPaymentSuccess) => {
      onSuccess();
    },

    modal: {
      ondismiss: onDismiss,
    },

    /*
     * Keep the Razorpay modal visually aligned with the premium
     * dark/zinc heyHi theme. This is only the accent color; Razorpay
     * controls the rest of its hosted widget appearance.
     */
    theme: {
      color: "#a1a1aa",
    },
  };
}

export function useRazorpayCheckout() {
  const queryClient = useQueryClient();
  const [isOpening, setIsOpening] = useState(false);
  const checkoutOpenRef = useRef(false);

  const refreshSubscriptionAfterWebhook = useCallback(async () => {
    /*
     * Razorpay handler runs as soon as the client payment succeeds.
     * The backend webhook can arrive shortly afterwards. Refetch twice:
     *
     * - after ~2 seconds: normal fast-path
     * - after ~5 seconds: fallback for a slightly delayed webhook
     *
     * This remains conservative: it does not pretend payment upgraded the
     * account before GET /billing/subscription confirms it.
     */
    window.setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: ["billing", "subscription"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["billing", "invoices"],
      });
    }, 2_000);

    window.setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: ["billing", "subscription"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["billing", "invoices"],
      });
    }, 5_000);
  }, [queryClient]);

  const openCheckout = useCallback(async () => {
    if (checkoutOpenRef.current || isOpening) {
      return false;
    }

    checkoutOpenRef.current = true;
    setIsOpening(true);

    try {
      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const order = await createCheckoutOrder();

      const checkout = new window.Razorpay(
        createRazorpayOptions(
          order,
          () => {
            toast.success(
              "Payment received. Confirming your Pro subscription…",
            );

            void refreshSubscriptionAfterWebhook();

            checkoutOpenRef.current = false;
            setIsOpening(false);
          },
          () => {
            checkoutOpenRef.current = false;
            setIsOpening(false);
          },
        ),
      );

      checkout.on("payment.failed", (response) => {
        const message =
          response.error?.description ||
          "Payment was not completed. No charge should be made.";

        toast.error(message);

        checkoutOpenRef.current = false;
        setIsOpening(false);
      });

      checkout.open();

      /*
       * Keep isOpening true while Razorpay is visible, preventing accidental
       * double-clicks that could create multiple backend checkout orders.
       */
      return true;
    } catch (error) {
      toast.error(getCheckoutErrorMessage(error));

      checkoutOpenRef.current = false;
      setIsOpening(false);

      return false;
    }
  }, [isOpening, refreshSubscriptionAfterWebhook]);

  return {
    isOpening,
    openCheckout,
  };
}
