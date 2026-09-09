import { apiFetch } from "@/lib/apiClient";
import type {
  AdminUserView,
  AuditLogEntry,
  FlaggedQuery,
  HealthResponse,
} from "@/features/admin/types";

/*
 * All admin endpoints:
 * - Require an admin JWT.
 * - Return 404 for non-admin users deliberately.
 * - Must never be linked or rendered for users where useAdminCheck() is false.
 */

export function getAdminUsers(): Promise<AdminUserView[]> {
  return apiFetch<AdminUserView[]>("/admin/users", {
    method: "GET",
  });
}

export function suspendUser(userId: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${encodeURIComponent(userId)}/suspend`, {
    method: "POST",
  });
}

export function unsuspendUser(userId: string): Promise<void> {
  return apiFetch<void>(
    `/admin/users/${encodeURIComponent(userId)}/unsuspend`,
    {
      method: "POST",
    },
  );
}

export function getAuditLog(): Promise<AuditLogEntry[]> {
  return apiFetch<AuditLogEntry[]>("/admin/audit-log", {
    method: "GET",
  });
}

export function getModerationQueue(): Promise<FlaggedQuery[]> {
  /*
   * Backend returns only unreviewed entries.
   *
   * Known backend gap:
   * There is no endpoint to mark a flagged entry reviewed, dismissed,
   * or resolved. The frontend must treat this as read-only.
   */
  return apiFetch<FlaggedQuery[]>("/admin/moderation-queue", {
    method: "GET",
  });
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/actuator/health", {
    method: "GET",
  });
}
