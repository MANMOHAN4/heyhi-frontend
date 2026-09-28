import { useRef, useState } from "react";
import { CheckCircle2, FileText, FilePlus2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { useFileUpload } from "@/features/files/useFileUpload";
import { useFilesQuery } from "@/features/files/useFilesQuery";
import { useSpaceFilesQuery } from "@/features/spaces/useSpaceFilesQuery";
import { useAddFileToSpace } from "@/features/spaces/useSpaceMutations";

const ACCEPTED_TYPES =
  ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export type AddFileDialogProps = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddFileDialog({
  spaceId,
  open,
  onOpenChange,
}: AddFileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a document</DialogTitle>
          <DialogDescription>
            Upload a new document, or add one you&apos;ve already uploaded
            elsewhere to this Space.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload new</TabsTrigger>
            <TabsTrigger value="existing">Choose existing</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-1">
            <UploadNewFileTab spaceId={spaceId} onDone={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="existing" className="pt-1">
            <ChooseExistingFileTab
              spaceId={spaceId}
              onDone={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadNewFileTab({
  spaceId,
  onDone,
}: {
  spaceId: string;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useFileUpload();
  const addFileMutation = useAddFileToSpace(spaceId);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const isBusy = uploadMutation.isPending || addFileMutation.isPending;

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setProgress(20);

    try {
      const uploaded = await uploadMutation.mutateAsync(file);
      setProgress(70);
      await addFileMutation.mutateAsync({ file_id: uploaded.id });
      setProgress(100);
      onDone();
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      window.setTimeout(() => {
        setProgress(0);
        setFileName(null);
      }, 250);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        disabled={isBusy}
        onChange={handleSelect}
      />

      <FilePlus2 className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">
        {fileName ?? "Choose a document to upload"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF, DOCX, or TXT · max 25 MB
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={isBusy}
        onClick={() => inputRef.current?.click()}
      >
        {isBusy && <Loader2 className="size-4 animate-spin" />}
        {isBusy ? "Uploading…" : "Choose file"}
      </Button>

      {isBusy && (
        <div className="mt-5 space-y-2 text-left">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {addFileMutation.isPending ? "Adding to Space" : "Uploading"}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}
    </div>
  );
}

/*
 * GET /files (BACKEND_API_REFERENCE.md §8.3) lists every document the
 * caller has ever uploaded across the whole account, not just this Space -
 * this tab lets them reuse one instead of re-uploading the same file twice.
 * Files already shared into this Space are filtered out and files that
 * failed processing can't be added (the backend would reject them for RAG
 * anyway).
 */
function ChooseExistingFileTab({
  spaceId,
  onDone,
}: {
  spaceId: string;
  onDone: () => void;
}) {
  const filesQuery = useFilesQuery();
  const spaceFilesQuery = useSpaceFilesQuery(spaceId);
  const addFileMutation = useAddFileToSpace(spaceId);
  const [addingFileId, setAddingFileId] = useState<string | null>(null);

  const alreadyAddedIds = new Set(
    spaceFilesQuery.data?.map((file) => file.file_id) ?? [],
  );

  const availableFiles = (filesQuery.data ?? []).filter(
    (file) => !alreadyAddedIds.has(file.id),
  );

  const handleAdd = async (fileId: string) => {
    setAddingFileId(fileId);

    try {
      await addFileMutation.mutateAsync({ file_id: fileId });
      onDone();
    } finally {
      setAddingFileId(null);
    }
  };

  if (filesQuery.isLoading || spaceFilesQuery.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (filesQuery.isError) {
    return (
      <PageErrorState
        message="Couldn't load your uploaded documents."
        onRetry={() => filesQuery.refetch()}
      />
    );
  }

  if (availableFiles.length === 0) {
    return (
      <EmptyState
        message={
          (filesQuery.data?.length ?? 0) === 0
            ? "You haven't uploaded any documents yet."
            : "Every document you've uploaded is already in this Space."
        }
      />
    );
  }

  return (
    <div className="max-h-72 space-y-1.5 overflow-y-auto">
      {availableFiles.map((file) => {
        const isAdding = addingFileId === file.id;
        const isReady = file.status === "READY";

        return (
          <div
            key={file.id}
            className="flex min-w-0 items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-2.5"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{file.filename}</p>
              {!isReady && (
                <p className="text-xs text-muted-foreground">
                  {file.status === "FAILED"
                    ? "Failed to process"
                    : "Still processing…"}
                </p>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!isReady || addFileMutation.isPending}
              onClick={() => handleAdd(file.id)}
            >
              {isAdding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Add
            </Button>
          </div>
        );
      })}
    </div>
  );
}
