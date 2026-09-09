import { useEffect, useState } from "react";
import { Check, Edit3, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpaceMutations } from "@/features/spaces/useSpaceMutations";
import { useSpaceRole } from "@/features/spaces/useSpaceRole";
import { SPACE_INSTRUCTIONS_MAX_LENGTH } from "@/lib/constants";
import type { Space } from "@/features/spaces/types";

type SpaceHeaderProps = {
  space: Space;
};

export function SpaceHeader({ space }: SpaceHeaderProps) {
  const { isEditorOrAbove } = useSpaceRole(space.id);
  const updateSpaceMutation = useSpaceMutations(space.id).update;

  const [editingName, setEditingName] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [name, setName] = useState(space.name);
  const [instructions, setInstructions] = useState(
    space.custom_instructions ?? "",
  );

  useEffect(() => {
    setName(space.name);
    setInstructions(space.custom_instructions ?? "");
  }, [space.name, space.custom_instructions]);

  const saveName = () => {
    const nextName = name.trim();

    if (!nextName || nextName === space.name) {
      setName(space.name);
      setEditingName(false);
      return;
    }

    updateSpaceMutation.mutate(
      { name: nextName },
      {
        onSuccess: () => setEditingName(false),
      },
    );
  };

  const saveInstructions = () => {
    const nextInstructions = instructions.trim();

    updateSpaceMutation.mutate(
      { custom_instructions: nextInstructions },
      {
        onSuccess: () => setEditingInstructions(false),
      },
    );
  };

  return (
    <header className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                autoFocus
                disabled={updateSpaceMutation.isPending}
                className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveName();
                  }
                  if (event.key === "Escape") {
                    setName(space.name);
                    setEditingName(false);
                  }
                }}
              />
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={saveName}
              >
                <Check className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  setName(space.name);
                  setEditingName(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {space.name}
              </h1>
              {isEditorOrAbove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingName(true)}
                  aria-label="Edit Space name"
                >
                  <Edit3 className="size-4" />
                </Button>
              )}
            </div>
          )}

          <p className="mt-1 text-sm text-muted-foreground">
            Shared research context and documents
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/50 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Custom instructions</p>
          {isEditorOrAbove && !editingInstructions && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setEditingInstructions(true)}
            >
              <Edit3 className="size-3.5" />
              Edit
            </Button>
          )}
        </div>

        {editingInstructions ? (
          <div className="space-y-2">
            <Textarea
              value={instructions}
              rows={5}
              maxLength={SPACE_INSTRUCTIONS_MAX_LENGTH}
              autoFocus
              onChange={(event) => setInstructions(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {instructions.length}/{SPACE_INSTRUCTIONS_MAX_LENGTH}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInstructions(space.custom_instructions ?? "");
                    setEditingInstructions(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={updateSpaceMutation.isPending}
                  onClick={saveInstructions}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {space.custom_instructions ||
              "No custom instructions have been added."}
          </p>
        )}
      </div>
    </header>
  );
}
