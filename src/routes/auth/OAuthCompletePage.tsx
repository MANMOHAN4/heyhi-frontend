import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { getCurrentUser } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/useAuthStore";

type Status = "loading" | "success" | "error";

export default function OAuthCompletePage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Completing your Google sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth(): Promise<void> {
      const fragment = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );

      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");
      const expiresInRaw = fragment.get("expires_in");

      /*
       * Strip the hash immediately, regardless of outcome: tokens sit in
       * the fragment specifically so they're never sent to a server or
       * logged (BACKEND_API_REFERENCE.md §4), but they'd still linger
       * visibly in the address bar / browser history / any screen share
       * until we remove them.
       */
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

      if (!accessToken || !refreshToken || !expiresInRaw) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "We could not find a complete sign-in response from Google.",
          );
        }

        return;
      }

      const expiresIn = Number(expiresInRaw);

      login(
        accessToken,
        refreshToken,
        Number.isFinite(expiresIn) ? expiresIn : 900,
      );

      try {
        const user = await getCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(user);
        setStatus("success");
        setMessage("You are signed in. Redirecting…");

        window.setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } catch {
        if (cancelled) {
          return;
        }

        setStatus("success");
        setMessage("You are signed in. Redirecting…");

        window.setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      }
    }

    void completeOAuth();

    return () => {
      cancelled = true;
    };
  }, [login, navigate, setUser]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          {status === "loading" ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : null}

          {status === "success" ? (
            <CheckCircle2 className="size-8 text-emerald-500" />
          ) : null}

          {status === "error" ? (
            <XCircle className="size-8 text-destructive" />
          ) : null}

          <h1 className="mt-4 text-xl font-semibold">
            {status === "error" ? "Google sign-in failed" : "Signing you in"}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>

          {status === "error" ? (
            <Link
              to="/login"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to sign in
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
