import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, UserPlus } from "lucide-react";

import { SignupForm } from "@/features/auth/components/SignupForm";
import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [verificationPending, setVerificationPending] = useState(false);

  if (verificationPending) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-6" />
        </div>

        <header>
          <h1 className="text-xl font-semibold tracking-tight">
            Check your email
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to your inbox. Verify your email, then
            sign in to start using heyHi.
          </p>
        </header>

        <Button className="w-full" render={<Link to="/login" />}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <UserPlus className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold tracking-tight">
            Create your account
          </h1>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Save your research, upload documents, and organize knowledge in
          Spaces.
        </p>
      </header>

      <SignupForm onVerificationPending={() => setVerificationPending(true)} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
