import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { NewSpaceDialog } from "@/features/spaces/components/NewSpaceDialog";
import { SpaceCard } from "@/features/spaces/components/SpaceCard";
import { useSpacesQuery } from "@/features/spaces/useSpacesQuery";

export default function SpacesListPage() {
  const spacesQuery = useSpacesQuery();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const spaces = spacesQuery.data ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <FolderKanban className="size-5 text-muted-foreground" />
              Spaces
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Organize reusable instructions and documents for focused research.
            </p>
          </div>

          <Button
            type="button"
            className="gap-2"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="size-4" />
            New Space
          </Button>
        </header>

        {spacesQuery.isLoading && <SpacesGridSkeleton />}

        {spacesQuery.isError && (
          <PageErrorState
            message="Couldn't load your Spaces."
            onRetry={() => spacesQuery.refetch()}
          />
        )}

        {!spacesQuery.isLoading &&
          !spacesQuery.isError &&
          spaces.length === 0 && (
            <EmptyState
              title="No Spaces yet"
              description="Create a Space to keep related documents and answer instructions together."
              icon={<FolderKanban className="size-5" />}
              action={
                <Button type="button" onClick={() => setCreateDialogOpen(true)}>
                  Create your first Space
                </Button>
              }
            />
          )}

        {!spacesQuery.isLoading &&
          !spacesQuery.isError &&
          spaces.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          )}
      </div>

      <NewSpaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

function SpacesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}
