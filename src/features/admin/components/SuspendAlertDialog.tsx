import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

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

import type { AdminUserView } from "@/features/admin/types";

type SuspendAlertDialogProps = {
  user: AdminUserView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => void;
  isPending: boolean;
};

export function SuspendAlertDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: SuspendAlertDialogProps) {
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmation("");
    }
  }, [open]);

  if (!user) {
    return null;
  }

  const canSuspend =
    confirmation.trim().toLowerCase() === user.email.toLowerCase();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) {
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (!canSuspend || isPending) {
      return;
    }

    onConfirm(user.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-5" />
            Suspend this user?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Suspending this account silently invalidates the user&apos;s active
            access across heyHi. The user will receive normal unauthorized
            behavior and no suspension-specific explanation.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="suspend-user-confirmation"
            className="text-sm font-medium"
          >
            Type{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {user.email}
            </span>{" "}
            to confirm
          </label>

          <Input
            id="suspend-user-confirmation"
            value={confirmation}
            autoFocus
            autoComplete="off"
            disabled={isPending}
            placeholder={user.email}
            onChange={(event) => setConfirmation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSuspend) {
                event.preventDefault();
                handleConfirm();
              }
            }}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={!canSuspend || isPending}
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Suspend user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
