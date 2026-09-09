/*
 * Admin-only backend response shapes.
 *
 * Every endpoint below requires an administrator JWT. The backend returns
 * 404 for non-admin callers deliberately, rather than 401/403.
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
  action: string;
  target_user_id: string | null;
  created_at: string;
}

export interface FlaggedQuery {
  id: string;
  user_id: string | null;
  query_text: string;
  reason: string;
  flagged_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
}

export interface HealthComponent {
  status: string;
  details?: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  components?: Record<string, HealthComponent>;
}
