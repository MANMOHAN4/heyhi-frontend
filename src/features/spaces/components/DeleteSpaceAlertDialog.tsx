import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
import { useDeleteSpace } from "@/features/spaces/useSpaceMutations";
import type { DeleteSpaceThreadsAction } from "@/features/spaces/api";
import { cn } from "@/lib/utils";

type DeleteSpaceAlertDialogProps = {
  spaceId: string;
  spaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteSpaceAlertDialog({
  spaceId,
  spaceName,
  open,
  onOpenChange,
}: DeleteSpaceAlertDialogProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteSpace();
  const [confirmation, setConfirmation] = useState("");
  /*
   * BACKEND_API_REFERENCE.md §8.5: DELETE /spaces/{id} requires ?threads=
   * (delete|detach) - there's no default, missing it is a 400. No radio is
   * pre-selected here on purpose: which outcome someone wants for their
   * threads (gone along with the Space, or kept as personal threads) isn't
   * something to guess on their behalf for an irreversible action.
   */
  const [threadsAction, setThreadsAction] =
    useState<DeleteSpaceThreadsAction | null>(null);

  const canDelete = confirmation.trim() === spaceName && threadsAction !== null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!deleteMutation.isPending && !nextOpen) {
      setConfirmation("");
      setThreadsAction(null);
      onOpenChange(false);
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleDelete = () => {
    if (!threadsAction) {
      return;
    }

    deleteMutation.mutate(
      { spaceId, threadsAction },
      {
        onSuccess: () => {
          setConfirmation("");
          setThreadsAction(null);
          onOpenChange(false);
          navigate("/spaces", { replace: true });
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            Delete this Space?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes <strong>{spaceName}</strong>, its shared
            files, and collaborator access. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <fieldset className="space-y-2" disabled={deleteMutation.isPending}>
          <legend className="text-sm font-medium">
            What should happen to this Space&apos;s conversations?
          </legend>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors",
              threadsAction === "detach"
                ? "border-primary/60 bg-primary/5"
                : "border-border/70 hover:bg-muted/40",
            )}
          >
            <input
              type="radio"
              name="delete-space-threads-action"
              value="detach"
              checked={threadsAction === "detach"}
              onChange={() => setThreadsAction("detach")}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="block font-medium">Keep the conversations</span>
              <span className="block text-muted-foreground">
                They become personal, space-less threads you can still open
                from your history.
              </span>
            </span>
          </label>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors",
              threadsAction === "delete"
                ? "border-destructive/60 bg-destructive/5"
                : "border-border/70 hover:bg-muted/40",
            )}
          >
            <input
              type="radio"
              name="delete-space-threads-action"
              value="delete"
              checked={threadsAction === "delete"}
              onChange={() => setThreadsAction("delete")}
              className="mt-0.5 size-4 accent-destructive"
            />
            <span>
              <span className="block font-medium">
                Delete the conversations too
              </span>
              <span className="block text-muted-foreground">
                Every thread created in this Space is permanently deleted
                along with it.
              </span>
            </span>
          </label>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="delete-space-confirm" className="text-sm font-medium">
            Type <span className="font-mono">{spaceName}</span> to confirm
          </label>
          <Input
            id="delete-space-confirm"
            value={confirmation}
            autoFocus
            disabled={deleteMutation.isPending}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canDelete || deleteMutation.isPending}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete Space
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
