import { Link, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";

import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  const [searchParams] = useSearchParams();

  const sessionExpired = searchParams.get("sessionExpired") === "1";

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <LogIn className="size-5 text-muted-foreground" />

          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sign in to access your saved conversations, Spaces, and research
          workflow.
        </p>
      </header>

      {sessionExpired ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-200"
        >
          Your session expired. Please sign in again.
        </div>
      ) : null}

      <LoginForm />

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-muted-foreground">
        New to heyHi?{" "}
        <Link
          to="/signup"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
