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

  const canDelete = confirmation.trim() === spaceName;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!deleteMutation.isPending && !nextOpen) {
      setConfirmation("");
      onOpenChange(false);
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleDelete = () => {
    deleteMutation.mutate(spaceId, {
      onSuccess: () => {
        setConfirmation("");
        onOpenChange(false);
        navigate("/spaces", { replace: true });
      },
    });
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
