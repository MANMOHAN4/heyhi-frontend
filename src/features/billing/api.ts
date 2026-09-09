/**
 * features/billing/api.ts
 */
import { apiFetch } from "../../../lib/apiClient";
import type { Subscription, Invoice, CheckoutOrderResponse } from "./types";

export function getSubscription(): Promise<Subscription> {
  // Always returns 200 - every user implicitly has a FREE/ACTIVE
  // subscription even with zero DB rows, never 404s for "no subscription".
  return apiFetch<Subscription>("/billing/subscription", { method: "GET" });
}

export function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>("/billing/invoices", { method: "GET" });
}

export function createCheckoutOrder(): Promise<CheckoutOrderResponse> {
  return apiFetch<CheckoutOrderResponse>("/billing/checkout-order", {
    method: "POST",
  });
}
