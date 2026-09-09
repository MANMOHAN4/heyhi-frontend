/**
 * features/admin/components/AuditLogTable.tsx
 * Per 03-pages-and-features.md §9 "Audit Log": columns admin, action
 * Badge, target user, timestamp. Most recent first (backend-guaranteed
 * order per 02-api-reference.md "GET /admin/audit-log").
 */
import { useAuditLogQuery } from "../useAdminQueries";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { formatDate } from "../../../../lib/utils";

export function AuditLogTable() {
  const { data, isLoading, isError, refetch } = useAuditLogQuery();

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
        message="Couldn't load the audit log."
        onRetry={() => refetch()}
      />
    );
  }

  if (data?.length === 0) {
    return <EmptyState message="No audit entries yet" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Admin</th>
            <th className="px-3 py-2 text-left">Action</th>
            <th className="px-3 py-2 text-left">Target user</th>
            <th className="px-3 py-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((entry, i) => (
            <tr key={i} className="border-t">
              <td
                className="max-w-[10rem] truncate px-3 py-2"
                title={entry.admin_user_id}
              >
                {entry.admin_user_id}
              </td>
              <td className="px-3 py-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {entry.action}
                </span>
              </td>
              <td className="max-w-[10rem] truncate px-3 py-2 text-muted-foreground">
                {entry.target_user_id ?? "—"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {formatDate(entry.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
