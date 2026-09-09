import { useQuery } from "@tanstack/react-query";

import {
  getAdminUsers,
  getAuditLog,
  getHealth,
  getModerationQueue,
} from "@/features/admin/api";

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

export function useAuditLogQuery() {
  return useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: getAuditLog,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useModerationQueueQuery() {
  return useQuery({
    queryKey: ["admin", "moderation-queue"],
    queryFn: getModerationQueue,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
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
