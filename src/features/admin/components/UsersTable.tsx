/**
 * features/admin/components/UsersTable.tsx
 * Per 03-pages-and-features.md §9 "Users": Table from GET /admin/users -
 * columns email, admin badge, suspended badge, joined date. Row action
 * (Dropdown Menu): Suspend/Unsuspend.
 */
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useAdminUsersQuery } from "../useAdminQueries";
import { useSuspendUser, useUnsuspendUser } from "../useAdminMutations";
import { SuspendAlertDialog } from "./SuspendAlertDialog";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { formatDate } from "../../../../lib/utils";
import type { AdminUserView } from "../types";

export function UsersTable() {
  const { data, isLoading, isError, refetch } = useAdminUsersQuery();
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [confirmingSuspend, setConfirmingSuspend] =
    useState<AdminUserView | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <PageErrorState
        message="Couldn't load users."
        onRetry={() => refetch()}
      />
    );
  }

  if (data?.length === 0) {
    return <EmptyState message="No users found" />;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Admin</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Joined</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {data?.map((user) => (
              <tr key={user.id} className="relative border-t">
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">
                  {user.is_admin && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
                      user.is_suspended
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                    }`}
                  >
                    {user.is_suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDate(user.created_at)}
                </td>
                <td className="relative px-3 py-2">
                  <button
                    onClick={() =>
                      setMenuOpenFor(menuOpenFor === user.id ? null : user.id)
                    }
                    aria-label="User actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpenFor === user.id && (
                    <div className="absolute right-3 top-full z-10 w-36 rounded-md border bg-popover p-1 text-sm shadow-md">
                      {user.is_suspended ? (
                        <button
                          onClick={() => {
                            unsuspend.mutate(user.id);
                            setMenuOpenFor(null);
                          }}
                          className="w-full rounded px-2 py-1 text-left hover:bg-accent"
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmingSuspend(user);
                            setMenuOpenFor(null);
                          }}
                          className="w-full rounded px-2 py-1 text-left text-destructive hover:bg-accent"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SuspendAlertDialog
        userEmail={confirmingSuspend?.email ?? ""}
        open={!!confirmingSuspend}
        isPending={suspend.isPending}
        onClose={() => setConfirmingSuspend(null)}
        onConfirm={() => {
          if (confirmingSuspend) suspend.mutate(confirmingSuspend.id);
          setConfirmingSuspend(null);
        }}
      />
    </>
  );
}
