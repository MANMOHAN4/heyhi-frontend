/**
 * features/spaces/components/NewSpaceDialog.tsx
 * Per 03-pages-and-features.md §6: name + custom_instructions (Textarea,
 * show remaining chars toward the 4000 limit) -> POST /spaces.
 * On success, the caller is always OWNER - recorded via useSpaceRole.
 *
 * NOTE: swap the plain modal below for shadcn's real `Dialog`
 * (`npx shadcn@latest add dialog`) once installed.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSpace } from "../useSpaceMutations";
import { useSpaceRoleStore } from "../useSpaceRole";
import { SPACE_INSTRUCTIONS_MAX_LENGTH } from "../../../../lib/constants";
import { X } from "lucide-react";

interface NewSpaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewSpaceDialog({ open, onClose }: NewSpaceDialogProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const createSpace = useCreateSpace();
  const setRole = useSpaceRoleStore((s) => s.setRole);
  const navigate = useNavigate();

  if (!open) return null;

  const remaining = SPACE_INSTRUCTIONS_MAX_LENGTH - instructions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createSpace.mutate(
      {
        name: name.trim(),
        custom_instructions: instructions.trim() || undefined,
      },
      {
        onSuccess: (space) => {
          setRole(space.id, "OWNER"); // creator is always OWNER
          onClose();
          navigate(`/spaces/${space.id}`);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border bg-popover p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">New Space</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="space-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="space-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="space-instructions" className="text-sm font-medium">
              Custom instructions (optional)
            </label>
            <textarea
              id="space-instructions"
              value={instructions}
              onChange={(e) =>
                setInstructions(
                  e.target.value.slice(0, SPACE_INSTRUCTIONS_MAX_LENGTH),
                )
              }
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <p className="text-right text-xs text-muted-foreground">
              {remaining} left
            </p>
          </div>

          <button
            type="submit"
            disabled={createSpace.isPending || !name.trim()}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {createSpace.isPending ? "Creating…" : "Create Space"}
          </button>
        </form>
      </div>
    </div>
  );
}
