/**
 * features/spaces/components/DeleteSpaceAlertDialog.tsx
 * Per 03-pages-and-features.md §6: OWNER role SPECIFICALLY (an EDITOR
 * cannot delete a Space, even though they can modify it) - see
 * 02-api-reference.md "DELETE /spaces/{spaceId}".
 */
import { useNavigate } from "react-router-dom";
import { useDeleteSpace } from "../useSpaceMutations";

interface DeleteSpaceAlertDialogProps {
  spaceId: string;
  spaceName: string;
  open: boolean;
  onClose: () => void;
}

export function DeleteSpaceAlertDialog({
  spaceId,
  spaceName,
  open,
  onClose,
}: DeleteSpaceAlertDialogProps) {
  const deleteSpace = useDeleteSpace();
  const navigate = useNavigate();

  if (!open) return null;

  const handleConfirm = () => {
    deleteSpace.mutate(spaceId, {
      onSuccess: () => {
        onClose();
        navigate("/spaces", { replace: true });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-lg border bg-popover p-4 shadow-lg">
        <h2 className="font-semibold">Delete "{spaceName}"?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This permanently deletes the Space, its shared files, and collaborator
          access. This can't be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleteSpace.isPending}
            className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground disabled:opacity-50"
          >
            {deleteSpace.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
