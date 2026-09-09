/**
 * features/spaces/components/SpaceHeader.tsx
 * Per 03-pages-and-features.md §6 "Detail": name + custom instructions,
 * inline-editable only if role >= EDITOR (see useSpaceRole).
 */
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useUpdateSpace } from "../useSpaceMutations";
import { useSpaceRole } from "../useSpaceRole";
import { SPACE_INSTRUCTIONS_MAX_LENGTH } from "../../../../lib/constants";
import type { Space } from "../types";

interface SpaceHeaderProps {
  space: Space;
}

export function SpaceHeader({ space }: SpaceHeaderProps) {
  const { isEditorOrAbove } = useSpaceRole(space.id);
  const updateSpace = useUpdateSpace(space.id);

  const [editingName, setEditingName] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [nameDraft, setNameDraft] = useState(space.name);
  const [instructionsDraft, setInstructionsDraft] = useState(
    space.custom_instructions ?? "",
  );

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== space.name) {
      updateSpace.mutate({ name: trimmed });
    }
    setEditingName(false);
  };

  const saveInstructions = () => {
    if (instructionsDraft !== (space.custom_instructions ?? "")) {
      updateSpace.mutate({ custom_instructions: instructionsDraft });
    }
    setEditingInstructions(false);
  };

  return (
    <div className="space-y-3 border-b pb-4">
      <div className="flex items-center gap-2">
        {editingName ? (
          <>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="rounded-md border px-2 py-1 text-lg font-semibold"
            />
            <button onClick={saveName} aria-label="Save name">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditingName(false)} aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold">{space.name}</h1>
            {isEditorOrAbove && (
              <button
                onClick={() => setEditingName(true)}
                aria-label="Edit name"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </>
        )}
      </div>

      <div>
        {editingInstructions ? (
          <div className="space-y-1">
            <textarea
              autoFocus
              value={instructionsDraft}
              onChange={(e) =>
                setInstructionsDraft(
                  e.target.value.slice(0, SPACE_INSTRUCTIONS_MAX_LENGTH),
                )
              }
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {SPACE_INSTRUCTIONS_MAX_LENGTH - instructionsDraft.length} left
              </p>
              <div className="flex gap-2">
                <button
                  onClick={saveInstructions}
                  className="text-xs font-medium text-primary"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingInstructions(false)}
                  className="text-xs text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm text-muted-foreground">
              {space.custom_instructions || "No custom instructions set."}
            </p>
            {isEditorOrAbove && (
              <button
                onClick={() => setEditingInstructions(true)}
                aria-label="Edit instructions"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
