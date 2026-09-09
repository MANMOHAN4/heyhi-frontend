/**
 * features/spaces/components/CollaboratorsList.tsx
 * Per 03-pages-and-features.md §6: role >= VIEWER to see, OWNER only to
 * manage. Shows email/role/accepted_at (always set immediately - invites
 * auto-accept, no pending/decline state - see 01-backend-reference.md
 * "SpaceCollaborator").
 *
 * NOTE: the API returns user_id, not email, per SpaceCollaborator's real
 * shape (01-backend-reference.md) - there is no user-lookup-by-id endpoint
 * documented, so email cannot be resolved/displayed for existing
 * collaborators without a further backend endpoint. Displaying user_id as
 * a fallback identifier here, flagged inline, rather than fabricating an
 * email field the API doesn't return.
 */
import { useCollaboratorsQuery } from "../useSpaceQuery";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";

interface CollaboratorsListProps {
  spaceId: string;
}

export function CollaboratorsList({ spaceId }: CollaboratorsListProps) {
  const { data, isLoading, isError, refetch } = useCollaboratorsQuery(spaceId);

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <PageErrorState
        message="Couldn't load collaborators."
        onRetry={() => refetch()}
      />
    );
  }

  if (data?.length === 0) {
    return <EmptyState message="No collaborators yet" />;
  }

  return (
    <ul className="space-y-1">
      {data?.map((collaborator) => (
        <li
          key={collaborator.user_id}
          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
        >
          <span
            className="truncate text-xs text-muted-foreground"
            title={collaborator.user_id}
          >
            {collaborator.user_id}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
            {collaborator.role}
          </span>
        </li>
      ))}
    </ul>
  );
}
