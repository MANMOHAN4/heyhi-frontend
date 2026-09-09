/**
 * routes/auth/VerifyEmailPage.tsx
 * Per 03-pages-and-features.md "/verify-email":
 *  - Reads ?token= from URL on mount, calls verify automatically.
 *  - Success (200): "Your email is verified" + link to log in.
 *  - 422 INVALID_VERIFICATION_TOKEN: "This link has expired or already been
 *    used" + link to login. No resend-email option exists (flagged gap).
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../src/features/auth/api";
import { ApiError } from "../../../lib/apiError";

type VerifyState = "verifying" | "success" | "expired" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>("verifying");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (!cancelled) setState("success");
      })
      .catch((err) => {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          err.code === "INVALID_VERIFICATION_TOKEN"
        ) {
          setState("expired");
        } else {
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
      {state === "verifying" && (
        <p className="text-sm text-muted-foreground">Verifying your email…</p>
      )}

      {state === "success" && (
        <>
          <h1 className="text-xl font-semibold">Your email is verified</h1>
          <Link
            to="/login"
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Log in
          </Link>
        </>
      )}

      {state === "expired" && (
        <>
          <h1 className="text-xl font-semibold">Link no longer valid</h1>
          <p className="text-sm text-muted-foreground">
            This link has expired or already been used.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-medium underline"
          >
            Go to login
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We couldn't verify this link. Please try again from the email we
            sent you.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-medium underline"
          >
            Go to login
          </Link>
        </>
      )}
    </div>
  );
}
