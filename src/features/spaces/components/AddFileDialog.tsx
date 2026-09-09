import { useRef, useState } from "react";
import { FilePlus2, Loader2 } from "lucide-react";

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
import { useFileUpload } from "@/features/files/useFileUpload";
import { useAddFileToSpace } from "@/features/spaces/useSpaceMutations";

const ACCEPTED_TYPES =
  ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export type AddFileDialogProps = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: (
    file: Awaited<ReturnType<ReturnType<typeof useFileUpload>["mutateAsync"]>>,
  ) => void;
};

export function AddFileDialog({
  spaceId,
  open,
  onOpenChange,
  onUploaded,
}: AddFileDialogProps) {
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
      await addFileMutation.mutateAsync(uploaded.id);
      setProgress(100);
      onUploaded?.(uploaded);
      onOpenChange(false);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      window.setTimeout(() => {
        setProgress(0);
        setFileName(null);
      }, 250);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isBusy && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a document</DialogTitle>
          <DialogDescription>
            Upload a PDF, DOCX, or plain text document up to 25 MB. It will be
            available to this Space.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          disabled={isBusy}
          onChange={handleSelect}
        />

        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
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

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
