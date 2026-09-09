import { Navigate, Outlet } from "react-router-dom";

/*
 * The backend does not expose is_admin in GET /users/me.
 *
 * Do not infer admin privilege from the normal user profile. A real
 * implementation should set this flag only after an admin endpoint succeeds,
 * such as GET /admin/audit-log. Until that admin probe exists, this route
 * safely denies access.
 */
export function AdminRoute() {
  const isAdmin = false;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
