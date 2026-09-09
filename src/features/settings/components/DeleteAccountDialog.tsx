import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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

function getDeleteAccountErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
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

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,

    onSuccess: () => {
      /*
       * The backend returns 202 Accepted. The specification says to treat
       * this as immediate deletion on the frontend: clear in-memory tokens,
       * clear account-scoped cache, then leave the authenticated app.
       */
      logout();
      queryClient.clear();

      setConfirmation("");
      onOpenChange(false);

      toast.success("Your account has been deleted.");
      navigate("/login", { replace: true });
    },

    onError: (error) => {
      toast.error(getDeleteAccountErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!open) {
      setConfirmation("");
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
            This permanently deletes your heyHi account and removes your
            conversation history, Spaces, uploaded documents, billing data, and
            associated access. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

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
