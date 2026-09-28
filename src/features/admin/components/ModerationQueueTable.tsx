import { CheckCircle2, Flag, Loader2, ShieldAlert, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useReviewModerationEntry } from "@/features/admin/useAdminMutations";
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
  const entries = moderationQuery.entries;
  const reviewMutation = useReviewModerationEntry();

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="size-4 text-muted-foreground" />
          Moderation queue
        </CardTitle>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Queries flagged by trust and safety rules. The queue lists
          unreviewed entries by default - mark an entry reviewed once you've
          looked into it.
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {entries.map((entry) => {
                    const isReviewing =
                      reviewMutation.isPending &&
                      reviewMutation.variables === entry.id;

                    return (
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

                        <TableCell className="text-right">
                          {entry.reviewed_at ? (
                            <Badge
                              variant="secondary"
                              className="gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Reviewed
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={reviewMutation.isPending}
                              onClick={() => reviewMutation.mutate(entry.id)}
                            >
                              {isReviewing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                "Mark reviewed"
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

        {moderationQuery.hasNextPage && (
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={moderationQuery.isFetchingNextPage}
              onClick={() => moderationQuery.fetchNextPage()}
            >
              {moderationQuery.isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
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
