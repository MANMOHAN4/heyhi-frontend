/**
 * routes/router.tsx
 * Full route map per 03-pages-and-features.md. Routes for features not yet
 * built (Spaces, Settings, Billing, Admin, Sharing - Phases 3-5) are wired
 * as lazy imports now so App.tsx / AppShellLayout are complete and
 * runnable today; each lazy() call will resolve once that phase's files
 * are added at the referenced path - no changes needed here later.
 *
 * IMPORTANT: ProtectedRoute and AdminRoute (components/shared/ProtectedRoute.tsx)
 * are LAYOUT route elements - each renders <Outlet/> internally once
 * authorized, and must be used as the `element` of a wrapping route whose
 * `children` are the actual pages, NOT passed React children directly.
 */
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShellLayout } from "./AppShellLayout";
import { PublicLayout } from "./PublicLayout";
import { AuthLayout } from "./AuthLayout";
import {
  ProtectedRoute,
  AdminRoute,
} from "../components/shared/ProtectedRoute";
import { SignupPage } from "./auth/SignupPage";
import { LoginPage } from "./auth/LoginPage";
import { VerifyEmailPage } from "./auth/VerifyEmailPage";
import { OAuthCompletePage } from "./auth/OAuthCompletePage";
import { ThreadPage } from "./conversation/ThreadPage";

// Phase 3+ - lazy, built in upcoming phases at these exact paths.
const SpacesListPage = lazy(() => import("./spaces/SpacesListPage"));
const SpaceDetailPage = lazy(() => import("./spaces/SpaceDetailPage"));
const SharedThreadPage = lazy(() => import("./shared/SharedThreadPage"));
const SettingsPage = lazy(() => import("./settings/SettingsPage"));
const BillingPage = lazy(() => import("./settings/BillingPage"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminUsersTab = lazy(() => import("./admin/AdminUsersTab"));
const AdminModerationTab = lazy(() => import("./admin/AdminModerationTab"));
const AdminAuditLogTab = lazy(() => import("./admin/AdminAuditLogTab"));
const AdminHealthTab = lazy(() => import("./admin/AdminHealthTab"));

const withSuspense = (node: React.ReactNode) => (
  <Suspense
    fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}
  >
    {node}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/signup", element: <SignupPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/oauth-complete", element: <OAuthCompletePage /> },
    ],
  },
  {
    path: "/shared/:token",
    element: <PublicLayout />,
    children: [{ index: true, element: withSuspense(<SharedThreadPage />) }],
  },
  {
    element: <AppShellLayout />,
    children: [
      // Guest-accessible conversation routes (no ProtectedRoute wrapper -
      // per 02-api-reference.md, POST /threads is Optional auth).
      { path: "/", element: <ThreadPage /> },
      { path: "/t/:threadId", element: <ThreadPage /> },

      {
        element: <ProtectedRoute />, // renders <Outlet/> only if a token exists
        children: [
          { path: "/spaces", element: withSuspense(<SpacesListPage />) },
          {
            path: "/spaces/:spaceId",
            element: withSuspense(<SpaceDetailPage />),
          },
          { path: "/settings", element: withSuspense(<SettingsPage />) },
          { path: "/settings/billing", element: withSuspense(<BillingPage />) },
        ],
      },
      {
        element: <AdminRoute />, // renders <Outlet/> only if the admin-check succeeded
        children: [
          {
            path: "/admin",
            element: withSuspense(<AdminLayout />),
            children: [
              { index: true, element: withSuspense(<AdminUsersTab />) },
              {
                path: "moderation",
                element: withSuspense(<AdminModerationTab />),
              },
              {
                path: "audit-log",
                element: withSuspense(<AdminAuditLogTab />),
              },
              { path: "health", element: withSuspense(<AdminHealthTab />) },
            ],
          },
        ],
      },
    ],
  },
]);
