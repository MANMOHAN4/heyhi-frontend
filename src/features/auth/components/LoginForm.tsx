import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/apiError";

import { login } from "../api";
import { useAuthStore } from "../useAuthStore";

export function LoginForm() {
  const navigate = useNavigate();

  const storeLogin = useAuthStore((state) => state.storeLogin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (tokens) => {
      /*
       * Your store accepts only the access token.
       *
       * The backend login response provides:
       * access_token, refresh_token, expires_in.
       */
      storeLogin(tokens.access_token);

      navigate("/", { replace: true });
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
