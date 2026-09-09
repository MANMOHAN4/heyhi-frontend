import { useMemo, useState } from "react";
import {
  CheckCircle2,
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { SuspendAlertDialog } from "@/features/admin/components/SuspendAlertDialog";
import {
  useSuspendUser,
  useUnsuspendUser,
} from "@/features/admin/useAdminMutations";
import { useAdminUsersQuery } from "@/features/admin/useAdminQueries";
import type { AdminUserView } from "@/features/admin/types";

function formatJoinedDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function UsersTable() {
  const usersQuery = useAdminUsersQuery();
  const suspendMutation = useSuspendUser();
  const unsuspendMutation = useUnsuspendUser();

  const [userToSuspend, setUserToSuspend] = useState<AdminUserView | null>(
    null,
  );

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const handleSuspend = (userId: string) => {
    suspendMutation.mutate(userId, {
      onSuccess: () => {
        setUserToSuspend(null);
      },
    });
  };

  const handleUnsuspend = (userId: string) => {
    unsuspendMutation.mutate(userId);
  };

  return (
    <>
      <Card className="border-border/80 bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4 text-muted-foreground" />
              Users
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Review account access and suspension status.
            </p>
          </div>

          {!usersQuery.isLoading && !usersQuery.isError && (
            <Badge variant="secondary" className="rounded-md">
              {users.length} {users.length === 1 ? "user" : "users"}
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {usersQuery.isLoading && <UsersTableSkeleton />}

          {usersQuery.isError && (
            <PageErrorState
              message="Couldn't load users."
              onRetry={() => usersQuery.refetch()}
            />
          )}

          {!usersQuery.isLoading &&
            !usersQuery.isError &&
            users.length === 0 && <EmptyState message="No users found." />}

          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="min-w-48">
                          <p className="truncate font-medium">{user.email}</p>
                          <p
                            className="mt-0.5 truncate font-mono text-xs text-muted-foreground"
                            title={user.id}
                          >
                            {user.id}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {user.is_admin ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300"
                          >
                            <ShieldCheck className="size-3.5" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-md">
                            User
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {user.is_suspended ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 rounded-md bg-destructive/10 text-destructive"
                          >
                            <ShieldOff className="size-3.5" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Active
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatJoinedDate(user.created_at)}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${user.email}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />

                          <DropdownMenuContent align="end">
                            {user.is_suspended ? (
                              <DropdownMenuItem
                                disabled={unsuspendMutation.isPending}
                                onClick={() => handleUnsuspend(user.id)}
                              >
                                <CheckCircle2 className="size-4" />
                                {unsuspendMutation.isPending
                                  ? "Restoring access…"
                                  : "Unsuspend user"}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={suspendMutation.isPending}
                                onClick={() => setUserToSuspend(user)}
                              >
                                <ShieldOff className="size-4" />
                                Suspend user
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SuspendAlertDialog
        user={userToSuspend}
        open={Boolean(userToSuspend)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToSuspend(null);
          }
        }}
        onConfirm={handleSuspend}
        isPending={suspendMutation.isPending}
      />
    </>
  );
}

function UsersTableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
