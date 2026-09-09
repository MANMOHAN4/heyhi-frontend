/**
 * features/admin/useAdminQueries.ts
 * All four admin read hooks in one file - each is a thin, single-purpose
 * TanStack Query wrapper, no shared logic beyond the query key convention.
 * `enabled` deliberately does NOT re-check isAdmin here - that's already
 * enforced at the route level by AdminRoute, so these hooks assume they're
 * only ever mounted within an already-admin-gated tree.
 */
import { useQuery } from "@tanstack/react-query";
import {
  getAdminUsers,
  getAuditLog,
  getModerationQueue,
  getHealth,
} from "./api";

export function useAdminUsersQuery() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: getAdminUsers });
}

export function useAuditLogQuery() {
  return useQuery({ queryKey: ["admin", "audit-log"], queryFn: getAuditLog });
}

export function useModerationQueueQuery() {
  return useQuery({
    queryKey: ["admin", "moderation-queue"],
    queryFn: getModerationQueue,
  });
}

export function useHealthQuery() {
  return useQuery({
    queryKey: ["admin", "health"],
    queryFn: getHealth,
    // Point-in-time snapshot each time the tab is viewed/refreshed, not a
    // live-updating dashboard (see 03-pages-and-features.md §9 "Health") -
    // no polling interval set deliberately.
    staleTime: 0,
  });
}
