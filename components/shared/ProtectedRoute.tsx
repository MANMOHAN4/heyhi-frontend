/**
 * components/shared/ProtectedRoute.tsx
 * Route guards. ProtectedRoute: requires a token (redirects to /login).
 * AdminRoute: requires the admin-check to have resolved true; while
 * unresolved (null), shows a brief loading state rather than flashing
 * a redirect - per the "404 indistinguishable from not-admin" pattern,
 * a non-admin should never even see this route attempt to render.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/useAuthStore";
import { useAdminCheck } from "../../../features/auth/useAdminCheck";

export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAdmin = useAdminCheck();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin === null) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (isAdmin === false) {
    // Deliberately the same neutral treatment as a nonexistent route -
    // never reveal that /admin exists to a non-admin user.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
