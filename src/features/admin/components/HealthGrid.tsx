/**
 * features/admin/components/HealthGrid.tsx
 * Per 03-pages-and-features.md §9 "Health": each dependency's status as a
 * Badge (green/red by "UP"/"DOWN") in a simple grid. Point-in-time
 * snapshot each time the tab is viewed/refreshed - no live-updating
 * dashboard. Per 04-nonfunctional-and-deployment.md "Accessibility":
 * color alone is never the only signal - paired with text/icon here.
 */
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { useHealthQuery } from "../useAdminQueries";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";

export function HealthGrid() {
  const { data, isLoading, isError, refetch } = useHealthQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <PageErrorState
        message="Couldn't load health status."
        onRetry={() => refetch()}
      />
    );
  }

  const components = data?.components ?? {};
  const entries = Object.entries(components);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-lg border p-3">
        <p className="text-xs font-medium text-muted-foreground">Overall</p>
        <StatusBadge status={data?.status ?? "UNKNOWN"} />
      </div>
      {entries.map(([name, dep]) => (
        <div key={name} className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground">{name}</p>
          <StatusBadge status={dep.status} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "UP") {
    return (
      <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" /> UP
      </span>
    );
  }
  if (status === "DOWN") {
    return (
      <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-red-700 dark:text-red-400">
        <XCircle className="h-4 w-4" /> DOWN
      </span>
    );
  }
  return (
    <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-muted-foreground">
      <HelpCircle className="h-4 w-4" /> {status}
    </span>
  );
}
