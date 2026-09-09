/**
 * features/auth/components/SignupForm.tsx
 * Per 03-pages-and-features.md "/signup":
 *  - email, password (client-side validate >= 10 chars to match backend,
 *    but backend validation is the source of truth).
 *  - On 201 success: does NOT return tokens - show "check your email to
 *    verify" state, then let the parent page redirect to /login.
 *  - 409 -> inline "an account with this email already exists"
 *  - 422 -> field-level message from the backend's `message`
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { signup } from "../api";
import { ApiError } from "../../../../lib/apiError";
import { PASSWORD_MIN_LENGTH } from "../../../../lib/constants";

interface SignupFormValues {
  email: string;
  password: string;
}

interface SignupFormProps {
  onVerificationPending: () => void;
}

export function SignupForm({ onVerificationPending }: SignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>();

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      setServerError(null);
      onVerificationPending();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_ALREADY_REGISTERED") {
          setServerError("An account with this email already exists.");
          return;
        }
        setServerError(err.message);
        return;
      }
      setServerError("Something went wrong. Please try again.");
    },
  });

  const onSubmit = (values: SignupFormValues) => mutation.mutate(values);

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
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
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
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2 text-sm"
          aria-invalid={!!errors.password}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: PASSWORD_MIN_LENGTH,
              message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
            },
          })}
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
        {mutation.isPending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
