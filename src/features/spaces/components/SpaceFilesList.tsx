import { FileCheck2, FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpaceFilesQuery } from "@/features/spaces/useSpaceFilesQuery";

type SpaceFilesListProps = {
  spaceId: string;
};

const STATUS_LABELS: Record<string, string> = {
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
  DELETING: "Removing",
};

export function SpaceFilesList({ spaceId }: SpaceFilesListProps) {
  const filesQuery = useSpaceFilesQuery(spaceId);

  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Shared documents</CardTitle>
        <p className="text-sm text-muted-foreground">
          Documents shared with everyone who has access to this Space.
        </p>
      </CardHeader>
      <CardContent>
        {filesQuery.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        )}

        {filesQuery.isError && (
          <PageErrorState
            message="Couldn't load this Space's documents."
            onRetry={() => filesQuery.refetch()}
          />
        )}

        {!filesQuery.isLoading &&
          !filesQuery.isError &&
          (filesQuery.data?.length ?? 0) === 0 && (
            <EmptyState message="No documents shared in this Space yet." />
          )}

        {!filesQuery.isLoading &&
          !filesQuery.isError &&
          filesQuery.data &&
          filesQuery.data.length > 0 && (
            <div className="space-y-2">
              {filesQuery.data.map((file) => (
                <div
                  key={file.file_id}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {file.status === "PROCESSING" ||
                    file.status === "UPLOADING" ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : file.status === "READY" ? (
                      <FileCheck2 className="size-4 text-emerald-400" />
                    ) : (
                      <FileText className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {file.display_name}
                    </p>
                    {file.display_name !== file.filename && (
                      <p className="truncate text-xs text-muted-foreground">
                        {file.filename}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px]"
                  >
                    {STATUS_LABELS[file.status] ?? file.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
