import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

import { deleteMyAccount } from "@/features/settings/api";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { ApiError } from "@/lib/apiError";

type DeleteAccountDialogProps = {
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getDeleteAccountErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.code === "ACTIVE_SUBSCRIPTION") {
      // Handled as a dedicated inline notice instead of a toast - see below.
      return null;
    }

    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "Your session has expired. Please sign in again.";
    }

    return error.message || "Couldn't delete your account.";
  }

  return "Couldn't delete your account. Please try again.";
}

export function DeleteAccountDialog({
  userEmail,
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  const [confirmation, setConfirmation] = useState("");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,

    onSuccess: () => {
      /*
       * BACKEND_API_REFERENCE.md §8.1/P16: 202 does NOT mean immediate
       * deletion - the account enters a 30-day grace period, and signing
       * back in during that window reactivates it automatically. Still log
       * out and leave the authenticated app (the account is scheduled for
       * removal and shouldn't keep behaving as a normal session), but say
       * so accurately rather than "has been deleted".
       */
      logout();
      queryClient.clear();

      setConfirmation("");
      onOpenChange(false);

      toast.success("Your account is scheduled for deletion.", {
        description:
          "Sign in again within 30 days to cancel and keep your account.",
        duration: 8000,
      });
      navigate("/login", { replace: true });
    },

    onError: (error) => {
      if (error instanceof ApiError && error.code === "ACTIVE_SUBSCRIPTION") {
        setHasActiveSubscription(true);
        return;
      }

      const message = getDeleteAccountErrorMessage(error);

      if (message) {
        toast.error(message);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      setConfirmation("");
      setHasActiveSubscription(false);
      deleteAccountMutation.reset();
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    /*
     * Keep the destructive confirmation focused while the request is active.
     */
    if (!nextOpen && deleteAccountMutation.isPending) {
      return;
    }

    onOpenChange(nextOpen);
  };

  const canDelete =
    confirmation.trim().toLowerCase() === userEmail.toLowerCase();

  const handleDelete = () => {
    if (!canDelete || deleteAccountMutation.isPending) {
      return;
    }

    setHasActiveSubscription(false);
    deleteAccountMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-5" />
            Delete your account?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This schedules your heyHi account for deletion after a 30-day
            grace period, during which your conversation history, Spaces,
            uploaded documents, and access remain intact. Signing back in
            during that window cancels the deletion automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasActiveSubscription && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <p className="font-medium">
              Cancel your paid subscription before deleting your account.
            </p>
            <Link
              to="/settings/billing"
              className="mt-1 inline-block underline underline-offset-2 hover:no-underline"
            >
              Go to billing
            </Link>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="delete-account-confirmation"
            className="text-sm font-medium"
          >
            Type{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {userEmail}
            </span>{" "}
            to confirm
          </label>

          <Input
            id="delete-account-confirmation"
            value={confirmation}
            autoFocus
            autoComplete="off"
            disabled={deleteAccountMutation.isPending}
            placeholder={userEmail}
            onChange={(event) => setConfirmation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canDelete) {
                event.preventDefault();
                handleDelete();
              }
            }}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={!canDelete || deleteAccountMutation.isPending}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteAccountMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
