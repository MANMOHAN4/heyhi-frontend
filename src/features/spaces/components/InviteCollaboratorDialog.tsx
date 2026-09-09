import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteCollaborator } from "@/features/spaces/useSpaceMutations";

export type InviteCollaboratorDialogProps = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteCollaboratorDialog({
  spaceId,
  open,
  onOpenChange,
}: InviteCollaboratorDialogProps) {
  const inviteMutation = useInviteCollaborator(spaceId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError(null);

    inviteMutation.mutate(
      { email: trimmedEmail, role },
      {
        onSuccess: () => {
          setEmail("");
          setRole("viewer");
          onOpenChange(false);
        },
      },
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (inviteMutation.isPending && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Invite collaborator
          </DialogTitle>
          <DialogDescription>
            Invites are accepted immediately. The collaborator will be able to
            access this Space according to the selected role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="collaborator-email">Email address</FieldLabel>
            <Input
              id="collaborator-email"
              type="email"
              value={email}
              autoFocus
              placeholder="person@example.com"
              aria-invalid={Boolean(emailError)}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError ? (
              <FieldError>{emailError}</FieldError>
            ) : (
              <FieldDescription>
                The account must already exist.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="collaborator-role">Role</FieldLabel>
            <Select
              value={role}
              disabled={inviteMutation.isPending}
              onValueChange={(value) => setRole(value as "editor" | "viewer")}
            >
              <SelectTrigger id="collaborator-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — can read</SelectItem>
                <SelectItem value="editor">Editor — can modify</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={inviteMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Invite collaborator
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
