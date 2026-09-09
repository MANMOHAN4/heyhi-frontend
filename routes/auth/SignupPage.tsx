/**
 * routes/auth/SignupPage.tsx
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupForm } from "../../src/features/auth/components/SignupForm";
import { GoogleAuthButton } from "../../src/features/auth/components/GoogleAuthButton";

export function SignupPage() {
  const [verificationPending, setVerificationPending] = useState(false);
  const navigate = useNavigate();

  if (verificationPending) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your inbox. Click it to activate your
          account, then log in.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go to login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <h1 className="text-xl font-semibold">Create your account</h1>
      <SignupForm onVerificationPending={() => setVerificationPending(true)} />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleAuthButton />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
