import { Navigate, Outlet } from "react-router-dom";

import { useAdminCheck } from "@/features/auth/useAdminCheck";
import { PageLoadingState } from "@/components/shared/PageLoadingState";

/*
 * The backend does not expose is_admin in GET /users/me, and every
 * /admin/** route returns 404 (not 401/403) for a non-admin caller,
 * deliberately indistinguishable from a nonexistent route (see
 * 01-backend-reference.md, Authorization / Roles).
 *
 * The only way to know if the current user is an admin is to attempt a real
 * admin endpoint and see whether it succeeds - useAdminCheck does exactly
 * that (probing GET /admin/audit-log) and caches the result in the auth
 * store. This guard just reads that result rather than assuming a fixed
 * value, so it never diverges from what the sidebar's "Admin console" link
 * itself uses to decide whether to render.
 */
export function AdminRoute() {
  const { isAdmin, isChecking } = useAdminCheck();

  if (isChecking) {
    return <PageLoadingState />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
