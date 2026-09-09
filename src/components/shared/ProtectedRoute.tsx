import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/useAuthStore";

export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const location = useLocation();

  if (!accessToken) {
    const redirectTarget = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
