/**
 * features/sidebar/components/UserMenu.tsx
 * Avatar/email, link to /settings, log out, and - only if the admin-check
 * succeeded - a link to /admin (see 01-backend-reference.md "Authorization
 * / Roles": never render any admin-hinting UI for a non-admin user).
 */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings, LogOut, ShieldCheck, ChevronUp } from "lucide-react";
import { useAuthStore } from "../../auth/useAuthStore";
import { useAdminCheck } from "../../auth/useAdminCheck";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAdminCheck();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative border-t p-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {(user.display_name ?? user.email)[0]?.toUpperCase()}
        </div>
        <span className="flex-1 truncate text-left">{user.display_name ?? user.email}</span>
        <ChevronUp className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-2 mb-1 w-52 rounded-md border bg-popover p-1 text-sm shadow-md">
          <NavLink
            to="/settings"
            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin console
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-destructive hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
