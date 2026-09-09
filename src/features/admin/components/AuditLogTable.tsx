import { ClipboardList, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { useAuditLogQuery } from "@/features/admin/useAdminQueries";

function formatAuditDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getActionBadgeClass(action: string): string {
  const normalizedAction = action.toUpperCase();

  if (normalizedAction.includes("SUSPEND")) {
    return "bg-destructive/10 text-destructive";
  }

  if (
    normalizedAction.includes("UNSUSPEND") ||
    normalizedAction.includes("RESTORE")
  ) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-muted text-muted-foreground";
}

export function AuditLogTable() {
  const auditLogQuery = useAuditLogQuery();
  const entries = auditLogQuery.data ?? [];

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-4 text-muted-foreground" />
          Audit log
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Administrative actions, most recent first.
        </p>
      </CardHeader>

      <CardContent>
        {auditLogQuery.isLoading && <AuditLogSkeleton />}

        {auditLogQuery.isError && (
          <PageErrorState
            message="Couldn't load the audit log."
            onRetry={() => auditLogQuery.refetch()}
          />
        )}

        {!auditLogQuery.isLoading &&
          !auditLogQuery.isError &&
          entries.length === 0 && (
            <EmptyState message="No audit entries yet." />
          )}

        {!auditLogQuery.isLoading &&
          !auditLogQuery.isError &&
          entries.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrator</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target user</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow
                      key={`${entry.created_at}-${entry.admin_user_id}-${index}`}
                    >
                      <TableCell>
                        <span
                          className="block max-w-48 truncate font-mono text-xs text-muted-foreground"
                          title={entry.admin_user_id}
                        >
                          {entry.admin_user_id}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`gap-1 rounded-md ${getActionBadgeClass(
                            entry.action,
                          )}`}
                        >
                          <ShieldCheck className="size-3.5" />
                          {entry.action}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {entry.target_user_id ? (
                          <span
                            className="block max-w-48 truncate font-mono text-xs text-muted-foreground"
                            title={entry.target_user_id}
                          >
                            {entry.target_user_id}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatAuditDate(entry.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

function AuditLogSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
