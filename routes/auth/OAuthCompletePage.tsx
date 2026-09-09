/**
 * routes/auth/OAuthCompletePage.tsx
 *
 * Per 01-backend-reference.md "Google OAuth" and 03-pages-and-features.md
 * "/oauth-complete": the CURRENT backend behavior is that
 * /auth/google/callback returns raw JSON directly to the browser (not a
 * redirect to a frontend route) - so this page is not cleanly reachable
 * today. It is built anyway, assuming the recommended backend follow-up
 * lands (redirect to e.g. /oauth-complete#access_token=...&refresh_token=...),
 * so the frontend is ready the moment that change ships.
 *
 * Reads tokens from the URL fragment (never the query string - fragments
 * are not sent to the server, which matters for tokens), stores them,
 * fetches the profile, and redirects to "/".
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { getMe } from "../../src/features/auth/api";

export function OAuthCompletePage() {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((s) => s.login);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const accessToken = fragment.get("access_token");

    if (!accessToken) {
      setError(true);
      return;
    }

    storeLogin(accessToken, {
      id: "",
      email: "",
      display_name: null,
      email_verified: false,
      created_at: "",
    });

    getMe()
      .then((user) => {
        storeLogin(accessToken, user);
        navigate("/", { replace: true });
      })
      .catch(() => {
        navigate("/", { replace: true });
      });
  }, [navigate, storeLogin]);

  if (error) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign-in incomplete</h1>
        <p className="text-sm text-muted-foreground">
          We couldn't complete Google sign-in. Please try again from the login
          page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-16 text-center text-sm text-muted-foreground">
      Completing sign-in…
    </div>
  );
}
