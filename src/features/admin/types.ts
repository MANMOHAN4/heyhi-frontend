/**
 * features/admin/types.ts
 * Per 01-backend-reference.md "AdminUserView" / "AuditLogEntry" /
 * "FlaggedQuery", admin-only shapes.
 */

export interface AdminUserView {
  id: string;
  email: string;
  is_admin: boolean;
  is_suspended: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  admin_user_id: string;
  action: string; // e.g. "SUSPEND_USER", "UNSUSPEND_USER"
  target_user_id: string | null;
  created_at: string;
}

export interface FlaggedQuery {
  id: string;
  user_id: string | null; // null for a guest's flagged query
  query_text: string;
  reason: string; // e.g. "blocklist_match"
  flagged_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
}

export interface DependencyHealth {
  status: "UP" | "DOWN" | string;
  [key: string]: unknown;
}

export interface HealthResponse {
  status: "UP" | "DOWN" | string;
  components?: Record<string, DependencyHealth>;
}
