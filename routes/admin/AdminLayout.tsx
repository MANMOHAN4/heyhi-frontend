/**
 * routes/admin/AdminLayout.tsx (default export - matches router.tsx's
 * lazy(() => import("./admin/AdminLayout")) expectation)
 * Per 03-pages-and-features.md §9: Tabs for the four sub-sections. This is
 * only ever reached via AdminRoute (components/shared/ProtectedRoute.tsx),
 * which already gates on a successful admin-check - no further admin
 * verification needed here.
 */
import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/admin", label: "Users", end: true },
  { to: "/admin/moderation", label: "Moderation Queue", end: false },
  { to: "/admin/audit-log", label: "Audit Log", end: false },
  { to: "/admin/health", label: "Health", end: false },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-lg font-semibold">Admin Console</h1>

      <div className="mb-4 flex gap-1 border-b">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium ${
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
