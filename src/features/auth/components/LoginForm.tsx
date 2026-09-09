/**
 * features/auth/components/LoginForm.tsx
 * Per 03-pages-and-features.md "/login":
 *  - 401 -> single generic "Invalid email or password" - never attempt to
 *    distinguish wrong-password from nonexistent-email (backend is
 *    deliberately identical for both, see 01-backend-reference.md).
 *  - On success: store tokens + user, redirect to "/".
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../api";
import { useAuthStore } from "../useAuthStore";
import { ApiError } from "../../../../lib/apiError";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const storeLogin = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (tokens) => {
      setServerError(null);
      // apiFetch reads the token from the auth store, so we must set the
      // access token before calling getMe(). Store a temporary token first,
      // then replace with the full {token, user} once profile is fetched.
      storeLogin(tokens.access_token, {
        id: "",
        email: "",
        display_name: null,
        email_verified: false,
        created_at: "",
      });
      try {
        const user = await getMe();
        storeLogin(tokens.access_token, user);
        navigate("/", { replace: true });
      } catch {
        // If /users/me somehow fails right after a successful login,
        // still proceed - the app shell will refetch profile data as needed.
        navigate("/", { replace: true });
      }
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "INVALID_CREDENTIALS") {
        setServerError("Invalid email or password.");
        return;
      }
      setServerError("Something went wrong. Please try again.");
    },
  });

  const onSubmit = (values: LoginFormValues) => mutation.mutate(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border px-3 py-2 text-sm"
          aria-invalid={!!errors.email}
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border px-3 py-2 text-sm"
          aria-invalid={!!errors.password}
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {mutation.isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
