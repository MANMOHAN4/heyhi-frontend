/**
 * features/billing/types.ts
 * Per 01-backend-reference.md "Database Schema / Entity Models".
 */
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../lib/constants";

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null; // ISO 8601
}

export interface Invoice {
  amount_cents: number; // smallest currency unit (paise, for INR)
  currency: string; // "INR"
  status: string;
  issued_at: string;
}

export interface CheckoutOrderResponse {
  order_id: string;
  key_id: string;
  amount_paise: number;
  currency: string;
}
