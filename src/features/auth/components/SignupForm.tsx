import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/apiError";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

import { signup, type SignupRequest } from "../api";

type SignupFormValues = SignupRequest;

type SignupFormProps = {
  onVerificationPending: () => void;
};

export function SignupForm({ onVerificationPending }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (values: SignupFormValues) => signup(values),

    onSuccess: () => {
      onVerificationPending();
    },

    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_ALREADY_REGISTERED") {
          setServerError("An account with this email already exists.");
          return;
        }

        setServerError(err.message);
        return;
      }

      setServerError("Unable to create your account. Please try again.");
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setServerError("Enter your email address.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setServerError(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
      return;
    }

    setServerError(null);

    mutation.mutate({
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
          onChange={(event) => setEmail(event.target.value)}
          disabled={mutation.isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={mutation.isPending}
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

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
