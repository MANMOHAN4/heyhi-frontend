import { Navigate, createBrowserRouter } from "react-router-dom";

import { AppShellLayout } from "@/routes/AppShellLayout";
import { AuthLayout } from "@/routes/AuthLayout";
import { AdminRoute } from "@/components/shared/AdminRoute";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

import { LoginPage } from "@/routes/auth/LoginPage";
import OAuthCompletePage from "@/routes/auth/OAuthCompletePage";
import SignupPage from "@/routes/auth/SignupPage";
import VerifyEmailPage from "@/routes/auth/VerifyEmailPage";

import ThreadPage from "@/routes/conversation/ThreadPage";
import SharedThreadPage from "@/routes/shared/SharedThreadPage";

import SettingsPage from "@/routes/settings/SettingsPage";
import BillingPage from "@/routes/settings/BillingPage";

import SpaceDetailPage from "@/routes/spaces/SpaceDetailPage";
import SpacesListPage from "@/routes/spaces/SpacesListPage";

import AdminLayout from "@/routes/admin/AdminLayout";
import AdminUsersTab from "@/routes/admin/AdminUsersTab";
import AdminModerationTab from "@/routes/admin/AdminModerationTab";
import AdminAuditLogTab from "@/routes/admin/AdminAuditLogTab";
import AdminHealthTab from "@/routes/admin/AdminHealthTab";

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          The page you requested does not exist or is no longer available.
        </p>
      </div>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
    ],
  },

  {
    /*
     * Must match the backend's frontend-callback-url exactly
     * (application.yml default: http://localhost:5173/auth/callback).
     * If that config changes, this path needs to change with it.
     */
    path: "/auth/callback",
    element: <OAuthCompletePage />,
  },

  {
    path: "/shared/:token",
    element: <SharedThreadPage />,
  },

  {
    element: <AppShellLayout />,
    children: [
      {
        index: true,
        element: <ThreadPage />,
      },
      {
        path: "/threads/:threadId",
        element: <ThreadPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/spaces",
            element: <SpacesListPage />,
          },
          {
            path: "/spaces/:spaceId",
            element: <SpaceDetailPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/settings/billing",
            element: <BillingPage />,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  {
                    path: "/admin",
                    element: <AdminUsersTab />,
                  },
                  {
                    path: "/admin/moderation",
                    element: <AdminModerationTab />,
                  },
                  {
                    path: "/admin/audit-log",
                    element: <AdminAuditLogTab />,
                  },
                  {
                    path: "/admin/health",
                    element: <AdminHealthTab />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "/404",
    element: <NotFoundPage />,
  },

  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
]);
