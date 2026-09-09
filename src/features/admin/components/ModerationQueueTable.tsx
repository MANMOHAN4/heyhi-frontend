import { Flag, ShieldAlert, UserRound } from "lucide-react";

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
import { useModerationQueueQuery } from "@/features/admin/useAdminQueries";

function formatFlaggedDate(isoDate: string): string {
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

export function ModerationQueueTable() {
  const moderationQuery = useModerationQueueQuery();
  const entries = moderationQuery.data ?? [];

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="size-4 text-muted-foreground" />
          Moderation queue
        </CardTitle>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Queries flagged by trust and safety rules. This view is read-only
          because the current backend does not provide an endpoint to mark an
          entry reviewed.
        </p>
      </CardHeader>

      <CardContent>
        {moderationQuery.isLoading && <ModerationSkeleton />}

        {moderationQuery.isError && (
          <PageErrorState
            message="Couldn't load the moderation queue."
            onRetry={() => moderationQuery.refetch()}
          />
        )}

        {!moderationQuery.isLoading &&
          !moderationQuery.isError &&
          entries.length === 0 && (
            <EmptyState message="Nothing flagged — all clear." />
          )}

        {!moderationQuery.isLoading &&
          !moderationQuery.isError &&
          entries.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="min-w-72 max-w-xl">
                        <p className="line-clamp-2 text-sm leading-relaxed">
                          {entry.query_text}
                        </p>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="gap-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        >
                          <ShieldAlert className="size-3.5" />
                          {entry.reason}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {entry.user_id ? (
                          <span
                            className="block max-w-40 truncate font-mono text-xs text-muted-foreground"
                            title={entry.user_id}
                          >
                            {entry.user_id}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <UserRound className="size-3.5" />
                            Guest
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatFlaggedDate(entry.flagged_at)}
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

function ModerationSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
