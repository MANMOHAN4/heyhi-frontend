import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/constants";

/*
 * Backend contract:
 *
 * GET /billing/subscription:
 * {
 *   plan: "FREE" | "PRO" | "ENTERPRISE",
 *   status: "ACTIVE" | "CANCELED" | "PAST_DUE",
 *   current_period_end: ISO timestamp | null
 * }
 *
 * GET /billing/invoices:
 * [
 *   {
 *     amount_cents: number,
 *     currency: "INR",
 *     status: string,
 *     issued_at: ISO timestamp
 *   }
 * ]
 *
 * POST /billing/checkout-order:
 * {
 *   order_id: "order_...",
 *   key_id: "rzp_...",
 *   amount_paise: number,
 *   currency: "INR"
 * }
 */

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
}

export interface Invoice {
  amount_cents: number;
  currency: string;
  status: string;
  issued_at: string;
}

export interface CheckoutOrderResponse {
  order_id: string;
  key_id: string;
  amount_paise: number;
  currency: string;
}

export type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
