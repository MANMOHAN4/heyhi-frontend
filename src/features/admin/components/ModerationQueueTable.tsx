/**
 * features/admin/components/ModerationQueueTable.tsx
 * Per 03-pages-and-features.md §9 "Moderation Queue": columns query text,
 * reason Badge, user (or "guest"), flagged date. NO "mark reviewed" action
 * exists in the API (flagged gap) - display as read-only for v1.
 */
import { useModerationQueueQuery } from "../useAdminQueries";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { formatDate } from "../../../../lib/utils";

export function ModerationQueueTable() {
  const { data, isLoading, isError, refetch } = useModerationQueueQuery();

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <PageErrorState
        message="Couldn't load the moderation queue."
        onRetry={() => refetch()}
      />
    );
  }

  if (data?.length === 0) {
    return <EmptyState message="Nothing flagged — all clear" />;
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        Read-only for now — there is currently no API action to mark an entry as
        reviewed (a known backend gap).
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Query</th>
              <th className="px-3 py-2 text-left">Reason</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Flagged</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="max-w-xs truncate px-3 py-2">
                  {entry.query_text}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
                    {entry.reason}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {entry.user_id ?? "Guest"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDate(entry.flagged_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
