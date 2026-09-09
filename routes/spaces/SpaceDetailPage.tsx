/**
 * routes/spaces/SpaceDetailPage.tsx
 * Per 03-pages-and-features.md §6 "Detail (/spaces/:spaceId)".
 *
 * Role tracking: since GET /spaces/{id} succeeding only proves >= VIEWER
 * (see 01-backend-reference.md), and GET /spaces (owner-only per its
 * documented gap) is how OWNER is usually already known from the sidebar/
 * list navigation - on direct load here we only confirm VIEWER-or-above
 * for certain. If no stronger role was already recorded (e.g. via
 * NewSpaceDialog or the Spaces list), owner/editor-only controls stay
 * hidden until a write action's success/failure reveals more, per the
 * spec's "gracefully handle any 404 as no-permission" guidance.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, UserPlus, Trash2 } from "lucide-react";
import { useSpaceQuery } from "../../src/features/spaces/useSpaceQuery";
import { useSpaceRole } from "../../src/features/spaces/useSpaceRole";
import { SpaceHeader } from "../../src/features/spaces/components/SpaceHeader";
import { SpaceFilesList } from "../../src/features/spaces/components/SpaceFilesList";
import { AddFileDialog } from "../../src/features/spaces/components/AddFileDialog";
import { CollaboratorsList } from "../../src/features/spaces/components/CollaboratorsList";
import { InviteCollaboratorDialog } from "../../src/features/spaces/components/InviteCollaboratorDialog";
import { DeleteSpaceAlertDialog } from "../../src/features/spaces/components/DeleteSpaceAlertDialog";
import { PageErrorState } from "../../components/shared/PageErrorState";
import type { UploadedDocument } from "../../src/features/files/types";

export default function SpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { data: space, isLoading, isError, refetch } = useSpaceQuery(spaceId!);
  const { isOwner, isEditorOrAbove, isViewerOrAbove } = useSpaceRole(spaceId!);

  const [addFileOpen, setAddFileOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filesAddedThisSession, setFilesAddedThisSession] = useState<
    UploadedDocument[]
  >([]);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading Space…</div>
    );
  }

  if (isError || !space) {
    return (
      <div className="p-6">
        <PageErrorState
          message="This Space doesn't exist, or you don't have access to it."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <SpaceHeader space={space} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate("/", { state: { spaceId: space.id } })}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Start a thread in this Space
        </button>
        {(isEditorOrAbove || isOwner) && (
          <button
            type="button"
            onClick={() => setAddFileOpen(true)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Add file
          </button>
        )}
        {isOwner && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite
          </button>
        )}
        {isOwner && (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Space
          </button>
        )}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Shared files</h2>
        <SpaceFilesList filesAddedThisSession={filesAddedThisSession} />
      </section>

      {isViewerOrAbove && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Collaborators</h2>
          <CollaboratorsList spaceId={space.id} />
        </section>
      )}

      <AddFileDialog
        spaceId={space.id}
        open={addFileOpen}
        onClose={() => setAddFileOpen(false)}
      />
      <InviteCollaboratorDialog
        spaceId={space.id}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
      <DeleteSpaceAlertDialog
        spaceId={space.id}
        spaceName={space.name}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
