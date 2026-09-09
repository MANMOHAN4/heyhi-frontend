import { apiFetch } from "@/lib/apiClient";
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

export function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>("/billing/invoices", {
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
