import { UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { useCollaboratorsQuery } from "@/features/spaces/useSpaceQuery";

type CollaboratorsListProps = {
  spaceId: string;
};

export function CollaboratorsList({ spaceId }: CollaboratorsListProps) {
  const collaboratorsQuery = useCollaboratorsQuery(spaceId);

  if (collaboratorsQuery.isLoading) {
    return (
      <Card className="border-border/70 bg-card/70">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (collaboratorsQuery.isError) {
    return (
      <PageErrorState
        message="Couldn't load collaborators."
        onRetry={() => collaboratorsQuery.refetch()}
      />
    );
  }

  const collaborators = collaboratorsQuery.data ?? [];

  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UsersRound className="size-4 text-muted-foreground" />
          Collaborators
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <EmptyState message="No collaborators yet." />
        ) : (
          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.user_id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {collaborator.user_id}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added{" "}
                    {new Date(collaborator.accepted_at).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {collaborator.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
