import { ArrowLeft, CreditCard, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageErrorState } from "@/components/shared/PageErrorState";
import { InvoiceTable } from "@/features/billing/components/InvoiceTable";
import { PlanCard } from "@/features/billing/components/PlanCard";
import { UpgradeButton } from "@/features/billing/components/UpgradeButton";
import { useSubscriptionQuery } from "@/features/billing/useSubscriptionQuery";

export default function BillingPage() {
  const subscriptionQuery = useSubscriptionQuery();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2 gap-1.5 text-muted-foreground"
              render={<Link to="/settings" />}
            >
              <ArrowLeft className="size-3.5" />
              Settings
            </Button>

            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <CreditCard className="size-5 text-muted-foreground" />
              Billing
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your plan, subscription status, and invoice history.
            </p>
          </div>

          {subscriptionQuery.data?.plan === "FREE" && (
            <UpgradeButton className="mt-1" />
          )}
        </header>

        <section aria-label="Current subscription">
          {subscriptionQuery.isLoading && <PlanCardSkeleton />}

          {subscriptionQuery.isError && (
            <PageErrorState
              message="Couldn't load your subscription."
              onRetry={() => subscriptionQuery.refetch()}
            />
          )}

          {subscriptionQuery.data && (
            <div className="space-y-4">
              <PlanCard subscription={subscriptionQuery.data} />

              {subscriptionQuery.data.plan === "FREE" && (
                <div className="flex flex-col gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="size-4 text-violet-500" />
                      Unlock heyHi Pro
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose premium AI models and run deeper Pro Search
                      workflows.
                    </p>
                  </div>

                  <UpgradeButton className="shrink-0" />
                </div>
              )}
            </div>
          )}
        </section>

        <section aria-label="Invoices">
          <InvoiceTable />
        </section>
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/80 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>

      <Skeleton className="mt-6 h-px w-full" />

      <div className="mt-4 flex justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
    </div>
  );
}
