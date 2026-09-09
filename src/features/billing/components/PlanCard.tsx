/**
 * features/billing/components/PlanCard.tsx
 * Per 03-pages-and-features.md §8: plan Badge (FREE/PRO/ENTERPRISE),
 * status, current_period_end if present. GET /billing/subscription always
 * returns 200 (implicit FREE default - see 01-backend-reference.md).
 */
import type { Subscription } from "../types";
import { formatDate } from "../../../../lib/utils";

interface PlanCardProps {
  subscription: Subscription;
}

const PLAN_STYLES: Record<Subscription["plan"], string> = {
  FREE: "bg-muted text-muted-foreground",
  PRO: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  ENTERPRISE:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function PlanCard({ subscription }: PlanCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${PLAN_STYLES[subscription.plan]}`}
        >
          {subscription.plan}
        </span>
        <span className="text-sm text-muted-foreground">
          {subscription.status}
        </span>
      </div>
      {subscription.current_period_end && (
        <p className="mt-2 text-xs text-muted-foreground">
          Renews/expires {formatDate(subscription.current_period_end)}
        </p>
      )}
    </div>
  );
}
