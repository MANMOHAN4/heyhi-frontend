/**
 * routes/settings/BillingPage.tsx
 * Per 03-pages-and-features.md §8.
 */
import { useSubscriptionQuery } from "../../src/features/billing/useSubscriptionQuery";
import { PlanCard } from "../../src/features/billing/components/PlanCard";
import { UpgradeButton } from "../../src/features/billing/components/UpgradeButton";
import { InvoiceTable } from "../../src/features/billing/components/InvoiceTable";
import { PageErrorState } from "../../components/shared/PageErrorState";

export default function BillingPage() {
  const {
    data: subscription,
    isLoading,
    isError,
    refetch,
  } = useSubscriptionQuery();

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-lg font-semibold">Billing</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Current plan</h2>
        {isLoading && (
          <div className="h-16 animate-pulse rounded-lg border bg-muted" />
        )}
        {isError && (
          <PageErrorState
            message="Couldn't load your subscription."
            onRetry={() => refetch()}
          />
        )}
        {subscription && (
          <div className="flex items-center gap-3">
            <PlanCard subscription={subscription} />
            {subscription.plan === "FREE" && <UpgradeButton />}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Invoice history</h2>
        <InvoiceTable />
      </section>
    </div>
  );
}
