import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/apiError";
import { resendVerificationEmail, verifyEmail } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/useAuthStore";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const accessToken = useAuthStore((state) => state.accessToken);

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email address…");
  const [resendSent, setResendSent] = useState(false);

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: () => {
      setResendSent(true);
      toast.success("Verification email sent");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError && error.message
          ? error.message
          : "Couldn't send the verification email. Please try again.",
      );
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function runVerification(): Promise<void> {
      if (!token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("This verification link is missing a token.");
        }

        return;
      }

      try {
        await verifyEmail(token);

        if (!cancelled) {
          setStatus("success");
          setMessage("Your email is verified.");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (
          error instanceof ApiError &&
          error.code === "INVALID_VERIFICATION_TOKEN"
        ) {
          setStatus("error");
          setMessage("This link is invalid or expired.");
          return;
        }

        setStatus("error");
        setMessage("We couldn't verify your email. Please try again.");
      }
    }

    void runVerification();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-6 text-center">
      {status === "loading" ? (
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
      ) : null}

      {status === "success" ? (
        <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
      ) : null}

      {status === "error" ? (
        <XCircle className="mx-auto size-8 text-destructive" />
      ) : null}

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {status === "success"
            ? "Email verified"
            : status === "error"
              ? "Verification failed"
              : "Verifying email"}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>

      {status === "error" && accessToken && (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resendMutation.isPending || resendSent}
            onClick={() => resendMutation.mutate()}
          >
            {resendMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {resendSent ? "Email sent" : "Resend verification email"}
          </Button>

          {resendSent && (
            <p className="mt-2 text-xs text-muted-foreground">
              Check your inbox for a new link.
            </p>
          )}
        </div>
      )}

      {status === "error" && !accessToken && (
        <p className="text-xs text-muted-foreground">
          Sign in, then resend the verification email from Settings.
        </p>
      )}

      <Link
        to="/login"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to login
      </Link>
    </div>
  );
}
