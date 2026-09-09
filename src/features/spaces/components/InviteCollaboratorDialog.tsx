/**
 * features/spaces/components/InviteCollaboratorDialog.tsx
 * Per 03-pages-and-features.md §6: OWNER only. email + role Select
 * (editor/viewer, LOWERCASE in the request per the documented casing
 * quirk - see 02-api-reference.md "POST /spaces/{id}/collaborators").
 * Handles 404 USER_NOT_FOUND inline via useInviteCollaborator's shared
 * error-message mapping.
 */
import { useState } from "react";
import { X } from "lucide-react";
import { useInviteCollaborator } from "../useSpaceMutations";

interface InviteCollaboratorDialogProps {
  spaceId: string;
  open: boolean;
  onClose: () => void;
}

export function InviteCollaboratorDialog({
  spaceId,
  open,
  onClose,
}: InviteCollaboratorDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const invite = useInviteCollaborator(spaceId);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    invite.mutate(
      { email: email.trim(), role },
      {
        onSuccess: () => {
          setEmail("");
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg border bg-popover p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Invite a collaborator</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={invite.isPending || !email.trim()}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {invite.isPending ? "Inviting…" : "Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
