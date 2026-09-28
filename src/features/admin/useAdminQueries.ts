import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  getAdminUsers,
  getAuditLog,
  getHealth,
  getModerationQueue,
} from "@/features/admin/api";

const ADMIN_LIST_PAGE_SIZE = 20;

/*
 * These hooks deliberately do not perform their own isAdmin check.
 *
 * The AdminRoute guard must verify admin eligibility before these components
 * are mounted. This avoids sending admin-route probes repeatedly and avoids
 * revealing any admin feature through the normal UI.
 */

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

/*
 * GET /admin/audit-log is cursor-paginated (BACKEND_API_REFERENCE.md §8.6).
 */
export function useAuditLogQuery() {
  const query = useInfiniteQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: ({ pageParam }) =>
      getAuditLog(pageParam ?? undefined, ADMIN_LIST_PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return { ...query, entries };
}

/*
 * GET /admin/moderation-queue is cursor-paginated
 * (BACKEND_API_REFERENCE.md §8.7).
 */
export function useModerationQueueQuery() {
  const query = useInfiniteQuery({
    queryKey: ["admin", "moderation-queue"],
    queryFn: ({ pageParam }) =>
      getModerationQueue(pageParam ?? undefined, ADMIN_LIST_PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return { ...query, entries };
}

export function useHealthQuery() {
  return useQuery({
    queryKey: ["admin", "health"],
    queryFn: getHealth,

    /*
     * Health is intentionally a point-in-time snapshot:
     * - No WebSocket/SSE health stream exists.
     * - No polling is required.
     * - This refetches when the route/tab remounts or the user manually retries.
     */
    staleTime: 0,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
