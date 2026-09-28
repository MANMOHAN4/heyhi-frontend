import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/apiError";

import { getCurrentUser, login } from "../api";
import { useAuthStore } from "../useAuthStore";

type LoginFormProps = {
  redirectTo?: string | null;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const navigate = useNavigate();

  const storeLogin = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: async (tokens) => {
      /*
       * BACKEND_API_REFERENCE.md §4: refresh_token is real and rotates on
       * every use (POST /auth/refresh). Store the full pair plus the
       * access-token deadline so apiClient can refresh proactively/on 401.
       */
      storeLogin(tokens.access_token, tokens.refresh_token, tokens.expires_in);

      /*
       * The sidebar UserMenu (and anything else keying off
       * useAuthStore.user) needs a populated profile to show the
       * authenticated menu instead of "Log in / Create account". A plain
       * email/password login only returns tokens, not a profile, so fetch
       * it explicitly right after storing the token.
       *
       * This is best-effort: if it fails, the user is still logged in
       * (accessToken is set and ProtectedRoute/route guards work off that),
       * they'll just briefly see "Guest session" in the menu until the next
       * successful /users/me call (e.g. from visiting Settings).
       */
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        // Non-fatal - see comment above.
      }

      navigate(redirectTo || "/", { replace: true });
    },

    onError: (error: unknown) => {
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        setServerError("Invalid email or password.");
        return;
      }

      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setServerError("Enter your email and password.");
      return;
    }

    setServerError(null);

    loginMutation.mutate({
      email: normalizedEmail,
      password,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          disabled={loginMutation.isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          disabled={loginMutation.isPending}
          required
        />
      </div>

      {serverError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {serverError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
