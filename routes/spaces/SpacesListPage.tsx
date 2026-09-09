/**
 * routes/spaces/SpacesListPage.tsx
 * Per 03-pages-and-features.md §6 "List (/spaces)": cards, GET /spaces,
 * "New Space" -> Dialog. NOTE the flagged gap: GET /spaces currently only
 * returns Spaces the caller OWNS, not ones they've been invited to as a
 * collaborator (see 01-backend-reference.md consolidated gaps) - this page
 * is titled/scoped accordingly rather than implying it shows "all my Spaces".
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import { useSpacesQuery } from "../../src/features/spaces/useSpacesQuery";
import { SpaceCard } from "../../src/features/spaces/components/SpaceCard";
import { NewSpaceDialog } from "../../src/features/spaces/components/NewSpaceDialog";
import { PageErrorState } from "../../src/components/shared/PageErrorState";
import { EmptyState } from "../../src/components/shared/EmptyState";

export default function SpacesListPage() {
  const { data, isLoading, isError, refetch } = useSpacesQuery();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Spaces you own</h1>
          <p className="text-xs text-muted-foreground">
            Collections of shared files and custom instructions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New Space
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {isError && (
        <PageErrorState
          message="Couldn't load your Spaces."
          onRetry={() => refetch()}
        />
      )}

      {data?.length === 0 && (
        <EmptyState
          message="Create your first Space"
          actionLabel="New Space"
          onAction={() => setDialogOpen(true)}
        />
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}

      <NewSpaceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
