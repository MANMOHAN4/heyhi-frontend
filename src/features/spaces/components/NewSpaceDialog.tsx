import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSpace } from "@/features/spaces/useSpaceMutations";
import { SPACE_INSTRUCTIONS_MAX_LENGTH } from "@/lib/constants";

type NewSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewSpaceDialog({ open, onOpenChange }: NewSpaceDialogProps) {
  const createSpaceMutation = useCreateSpace();
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setInstructions("");
      setNameError(null);
      createSpaceMutation.reset();
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Space name is required.");
      return;
    }

    setNameError(null);

    createSpaceMutation.mutate(
      {
        name: trimmedName,
        ...(instructions.trim()
          ? { custom_instructions: instructions.trim() }
          : {}),
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Space</DialogTitle>
          <DialogDescription>
            Organize documents and instructions for focused, repeatable
            research.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field data-invalid={Boolean(nameError)}>
            <FieldLabel htmlFor="new-space-name">Name</FieldLabel>
            <Input
              id="new-space-name"
              value={name}
              autoFocus
              placeholder="e.g. Final-year project research"
              aria-invalid={Boolean(nameError)}
              onChange={(event) => setName(event.target.value)}
            />
            {nameError && <FieldError>{nameError}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="new-space-instructions">
              Custom instructions
            </FieldLabel>
            <Textarea
              id="new-space-instructions"
              value={instructions}
              maxLength={SPACE_INSTRUCTIONS_MAX_LENGTH}
              rows={6}
              placeholder="Tell heyHi how answers in this Space should be researched and written…"
              onChange={(event) => setInstructions(event.target.value)}
            />
            <FieldDescription className="flex justify-between">
              <span>Optional. Applied to every thread in this Space.</span>
              <span>
                {instructions.length}/{SPACE_INSTRUCTIONS_MAX_LENGTH}
              </span>
            </FieldDescription>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createSpaceMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSpaceMutation.isPending}>
              {createSpaceMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Create Space
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
