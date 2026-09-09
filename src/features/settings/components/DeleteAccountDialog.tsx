/**
 * features/settings/components/DeleteAccountDialog.tsx
 * Per 03-pages-and-features.md §7 "Danger zone": strongly-worded Alert
 * Dialog. Typing the email to confirm is a reasonable extra safeguard (not
 * required by the API, but good practice for a destructive, irreversible
 * action). On success (202, see 02-api-reference.md "DELETE /users/me"),
 * immediately clear local auth state and redirect to /login.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { deleteMe } from "../../auth/api";
import { useAuthStore } from "../../auth/useAuthStore";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
  userEmail: string;
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({
  userEmail,
  open,
  onClose,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      logout();
      navigate("/login", { replace: true });
    },
    onError: () =>
      toast.error("Couldn't delete your account. Please try again."),
  });

  if (!open) return null;

  const canConfirm = confirmText === userEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg border bg-popover p-4 shadow-lg">
        <h2 className="font-semibold text-destructive">Delete your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This permanently deletes your account, threads, Spaces, and uploaded
          files. This action cannot be undone.
        </p>
        <p className="mt-3 text-xs font-medium">
          Type <span className="font-mono">{userEmail}</span> to confirm.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          autoComplete="off"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canConfirm || mutation.isPending}
            className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground disabled:opacity-50"
          >
            {mutation.isPending ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}
