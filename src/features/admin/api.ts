/**
 * features/admin/api.ts
 * Per 02-api-reference.md "Admin (/admin/**, /actuator/**)". Every one of
 * these returns 404 (not 401/403) for a non-admin caller, deliberately
 * indistinguishable from a nonexistent route - already gated at the route
 * level by AdminRoute (components/shared/ProtectedRoute.tsx), so any 404
 * reaching these calls in practice would mean admin status changed
 * mid-session (rare) rather than a normal expected path.
 */
import { apiFetch } from "../../../lib/apiClient";
import type {
  AdminUserView,
  AuditLogEntry,
  FlaggedQuery,
  HealthResponse,
} from "./types";

export function getAdminUsers(): Promise<AdminUserView[]> {
  return apiFetch<AdminUserView[]>("/admin/users", { method: "GET" });
}

export function suspendUser(userId: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${userId}/suspend`, { method: "POST" });
}

export function unsuspendUser(userId: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${userId}/unsuspend`, { method: "POST" });
}

export function getAuditLog(): Promise<AuditLogEntry[]> {
  return apiFetch<AuditLogEntry[]>("/admin/audit-log", { method: "GET" });
}

export function getModerationQueue(): Promise<FlaggedQuery[]> {
  // Unreviewed entries only - no "mark reviewed" endpoint exists (flagged gap).
  return apiFetch<FlaggedQuery[]>("/admin/moderation-queue", { method: "GET" });
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/actuator/health", { method: "GET" });
}
