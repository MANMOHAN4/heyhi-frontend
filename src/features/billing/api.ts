import { apiFetch } from "@/lib/apiClient";
import type { Page } from "@/lib/pagination";
import type {
  CheckoutOrderResponse,
  Invoice,
  Subscription,
} from "@/features/billing/types";

/*
 * GET /billing/subscription always returns a subscription object.
 *
 * Every user has an implicit:
 * {
 *   plan: "FREE",
 *   status: "ACTIVE",
 *   current_period_end: null
 * }
 *
 * Therefore, frontend code must not handle "subscription not found" as a
 * normal state. The endpoint returns 200 rather than 404.
 */

export function getSubscription(): Promise<Subscription> {
  return apiFetch<Subscription>("/billing/subscription", {
    method: "GET",
  });
}

/*
 * GET /billing/invoices is cursor-paginated
 * (BACKEND_API_REFERENCE.md §8.4): Page<InvoiceResponse> = { items,
 * next_cursor }. Currently returns an empty page for every user regardless
 * of plan - there is no production code path that writes invoice rows yet
 * (Appendix A #6) - but the shape itself is real once that's wired up.
 */
export function getInvoices(after?: string, size = 20): Promise<Page<Invoice>> {
  const params = new URLSearchParams();

  if (after) {
    params.set("after", after);
  }

  params.set("size", String(size));

  return apiFetch<Page<Invoice>>(`/billing/invoices?${params.toString()}`, {
    method: "GET",
  });
}

/*
 * Backend returns a Razorpay Order, not a hosted checkout URL.
 *
 * The response must be passed into the Razorpay checkout.js client widget:
 * - key_id -> options.key
 * - order_id -> options.order_id
 * - amount_paise -> options.amount
 * - currency -> options.currency
 */
export function createCheckoutOrder(): Promise<CheckoutOrderResponse> {
  return apiFetch<CheckoutOrderResponse>("/billing/checkout-order", {
    method: "POST",
  });
}
