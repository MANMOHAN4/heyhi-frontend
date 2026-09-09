/**
 * features/admin/components/SuspendAlertDialog.tsx
 * Only suspend (not unsuspend) is gated behind this confirmation, per
 * 03-pages-and-features.md §9 - unsuspend is a corrective/reversible-in-
 * spirit action, suspend is the impactful one warranting friction.
 */
interface SuspendAlertDialogProps {
  userEmail: string;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export function SuspendAlertDialog({
  userEmail,
  open,
  onConfirm,
  onClose,
  isPending,
}: SuspendAlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-lg border bg-popover p-4 shadow-lg">
        <h2 className="font-semibold">Suspend {userEmail}?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This user's access will be immediately and silently revoked
          everywhere. They can be unsuspended later.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground disabled:opacity-50"
          >
            {isPending ? "Suspending…" : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
}
