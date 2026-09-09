/**
 * routes/AuthLayout.tsx
 * Minimal centered layout for the four public auth pages
 * (/signup, /login, /verify-email, /oauth-complete).
 */
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
