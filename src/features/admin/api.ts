import { apiFetch } from "@/lib/apiClient";
import type { Page } from "@/lib/pagination";
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

function buildCursorParams(after?: string, size?: number): string {
  const params = new URLSearchParams();

  if (after) {
    params.set("after", after);
  }

  if (size) {
    params.set("size", String(size));
  }

  const search = params.toString();

  return search ? `?${search}` : "";
}

/*
 * GET /admin/audit-log is cursor-paginated (BACKEND_API_REFERENCE.md §8.6):
 * Page<AuditLogEntryResponse> = { items, next_cursor }.
 */
export function getAuditLog(
  after?: string,
  size = 20,
): Promise<Page<AuditLogEntry>> {
  return apiFetch<Page<AuditLogEntry>>(
    `/admin/audit-log${buildCursorParams(after, size)}`,
    { method: "GET" },
  );
}

/*
 * GET /admin/moderation-queue is cursor-paginated
 * (BACKEND_API_REFERENCE.md §8.7): Page<FlaggedQueryResponse> = { items,
 * next_cursor }. Backend returns only unreviewed entries by default.
 */
export function getModerationQueue(
  after?: string,
  size = 20,
): Promise<Page<FlaggedQuery>> {
  return apiFetch<Page<FlaggedQuery>>(
    `/admin/moderation-queue${buildCursorParams(after, size)}`,
    { method: "GET" },
  );
}

/*
 * POST /admin/moderation-queue/{id}/review (BACKEND_API_REFERENCE.md §8.7)
 * marks a flagged entry as reviewed. Previously absent from the backend -
 * the queue was read-only. Now real; ModerationQueueTable should offer a
 * "Mark reviewed" row action instead of showing every entry as permanent.
 */
export function reviewModerationEntry(entryId: string): Promise<void> {
  return apiFetch<void>(
    `/admin/moderation-queue/${encodeURIComponent(entryId)}/review`,
    { method: "POST" },
  );
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/actuator/health", {
    method: "GET",
  });
}
