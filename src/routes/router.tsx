import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import { AppShellLayout } from "@/routes/AppShellLayout";
import { AdminRoute } from "@/components/shared/AdminRoute";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

import { LoginPage } from "@/routes/auth/LoginPage";
import OAuthCompletePage from "@/routes/auth/OAuthCompletePage";
import SignupPage from "@/routes/auth/SignupPage";
import VerifyEmailPage from "@/routes/auth/VerifyEmailPage";

import ThreadPage from "@/routes/conversation/ThreadPage";
import SharedThreadPage from "@/routes/shared/SharedThreadPage";

import SettingsPage from "@/routes/settings/SettingsPage";

import SpaceDetailPage from "@/routes/spaces/SpaceDetailPage";
import SpacesListPage from "@/routes/spaces/SpacesListPage";

function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Outlet />
      </section>
    </main>
  );
}

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

function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Admin</h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Admin controls will appear here after the backend admin check is
        implemented.
      </p>
    </div>
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
    path: "/oauth-complete",
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
        path: "/t/:threadId",
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
            element: <AdminRoute />,
            children: [
              {
                path: "/admin",
                element: <AdminPage />,
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
