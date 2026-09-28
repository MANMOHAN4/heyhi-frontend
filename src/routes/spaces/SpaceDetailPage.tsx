import { useState } from "react";
import {
  ArrowLeft,
  FilePlus2,
  MessageSquarePlus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageErrorState } from "@/components/shared/PageErrorState";
import { AddFileDialog } from "@/features/spaces/components/AddFileDialog";
import { CollaboratorsList } from "@/features/spaces/components/CollaboratorsList";
import { DeleteSpaceAlertDialog } from "@/features/spaces/components/DeleteSpaceAlertDialog";
import { InviteCollaboratorDialog } from "@/features/spaces/components/InviteCollaboratorDialog";
import { SpaceFilesList } from "@/features/spaces/components/SpaceFilesList";
import { SpaceHeader } from "@/features/spaces/components/SpaceHeader";
import { useSpaceRole } from "@/features/spaces/useSpaceRole";
import { useSpaceQuery } from "@/features/spaces/useSpaceQuery";

export default function SpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  const spaceQuery = useSpaceQuery(spaceId);
  const { isOwner, isEditorOrAbove, isViewerOrAbove } = useSpaceRole(spaceId);

  const [addFileOpen, setAddFileOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (spaceQuery.isLoading) {
    return <SpaceDetailSkeleton />;
  }

  if (spaceQuery.isError || !spaceQuery.data) {
    return (
      <div className="p-6">
        <PageErrorState
          message="This Space is unavailable or you don't have access to it."
          onRetry={() => spaceQuery.refetch()}
        />
      </div>
    );
  }

  const space = spaceQuery.data;

  const startSpaceThread = () => {
    navigate("/", {
      state: {
        spaceId: space.id,
        spaceName: space.name,
      },
    });
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 text-muted-foreground"
          render={<Link to="/spaces" />}
        >
          <ArrowLeft className="size-3.5" />
          All Spaces
        </Button>

        <SpaceHeader space={space} />

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="gap-2" onClick={startSpaceThread}>
            <MessageSquarePlus className="size-4" />
            Start a Space thread
          </Button>

          {isEditorOrAbove && (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setAddFileOpen(true)}
            >
              <FilePlus2 className="size-4" />
              Add document
            </Button>
          )}

          {isOwner && (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-4" />
              Invite
            </Button>
          )}

          {isOwner && (
            <Button
              type="button"
              variant="outline"
              className="ml-auto gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete Space
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.9fr)]">
          <SpaceFilesList spaceId={space.id} />

          {isViewerOrAbove && <CollaboratorsList spaceId={space.id} />}
        </div>
      </div>

      <AddFileDialog
        spaceId={space.id}
        open={addFileOpen}
        onOpenChange={setAddFileOpen}
      />

      <InviteCollaboratorDialog
        spaceId={space.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <DeleteSpaceAlertDialog
        spaceId={space.id}
        spaceName={space.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}

function SpaceDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}
