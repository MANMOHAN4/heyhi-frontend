import { FileCheck2, FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { UploadedDocument } from "@/features/files/types";

type SpaceFilesListProps = {
  filesAddedThisSession: UploadedDocument[];
};

export function SpaceFilesList({ filesAddedThisSession }: SpaceFilesListProps) {
  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Shared documents</CardTitle>
        <p className="text-sm text-muted-foreground">
          Documents added in this browser session are shown here.
        </p>
      </CardHeader>
      <CardContent>
        {filesAddedThisSession.length === 0 ? (
          <EmptyState message="No documents added in this session." />
        ) : (
          <div className="space-y-2">
            {filesAddedThisSession.map((file) => (
              <div
                key={file.id}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {file.status === "PROCESSING" ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : file.status === "READY" ? (
                    <FileCheck2 className="size-4 text-emerald-400" />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {file.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">{file.status}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {file.status === "READY" ? "Ready" : file.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
