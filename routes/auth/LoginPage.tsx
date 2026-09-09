/**
 * routes/auth/LoginPage.tsx
 * Reads ?sessionExpired=1 (set by App.tsx's registerSessionExpiredHandler,
 * which does a hard window.location redirect from outside the router tree
 * after any 401 UNAUTHORIZED - see lib/apiClient.ts) to show a
 * "your session expired" message, per 04-nonfunctional-and-deployment.md
 * "Auth State Management".
 */
import { Link, useSearchParams } from "react-router-dom";
import { LoginForm } from "../../src/features/auth/components/LoginForm";
import { GoogleAuthButton } from "../../src/features/auth/components/GoogleAuthButton";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("sessionExpired") === "1";

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <h1 className="text-xl font-semibold">Log in</h1>

      {sessionExpired && (
        <p role="alert" className="rounded-md bg-muted px-3 py-2 text-sm">
          Your session expired, please log in again.
        </p>
      )}

      <LoginForm />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleAuthButton />
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
