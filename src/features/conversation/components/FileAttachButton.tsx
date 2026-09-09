import { useRef, useState } from "react";
import { FileText, Paperclip, Trash2, UploadCloud } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { UploadedDocument } from "@/features/files/types";
import { useFileUpload } from "@/features/files/useFileUpload";

type ComposerAttachment = UploadedDocument & {
  clientId: string;
  uploadProgress: number;
};

type FileAttachButtonProps = {
  disabled?: boolean;
  onFileIdsChange: (fileIds: string[]) => void;
};

function getAttachmentState(
  status: UploadedDocument["status"],
): "uploading" | "processing" | "error" | "done" {
  switch (status) {
    case "UPLOADING":
      return "uploading";
    case "PROCESSING":
      return "processing";
    case "FAILED":
      return "error";
    case "READY":
    default:
      return "done";
  }
}

function getStatusLabel(status: UploadedDocument["status"]): string {
  switch (status) {
    case "UPLOADING":
      return "Uploading…";
    case "PROCESSING":
      return "Processing document…";
    case "FAILED":
      return "Upload failed";
    case "READY":
      return "Ready to use";
    default:
      return "Preparing file…";
  }
}

export function FileAttachButton({
  disabled = false,
  onFileIdsChange,
}: FileAttachButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const uploadFile = useFileUpload();

  const updateAttachments = (
    updater: (current: ComposerAttachment[]) => ComposerAttachment[],
  ) => {
    setAttachments((current) => {
      const next = updater(current);

      /*
       * Only READY file IDs should be sent in POST /threads.
       * PROCESSING/FAILED files must never be included in file_ids.
       */
      onFileIdsChange(
        next
          .filter((attachment) => attachment.status === "READY")
          .map((attachment) => attachment.id),
      );

      return next;
    });
  };

  const openPicker = () => {
    if (!disabled && !uploadFile.isPending) {
      inputRef.current?.click();
    }
  };

  const removeAttachment = (clientId: string) => {
    updateAttachments((current) =>
      current.filter((attachment) => attachment.clientId !== clientId),
    );
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    /*
     * Reset immediately so selecting the same file again after removal
     * still triggers the input change event.
     */
    event.target.value = "";

    if (!selectedFile || disabled) {
      return;
    }

    const clientId = crypto.randomUUID();

    /*
     * The backend creates the real ID. Until the request returns, use a
     * temporary client ID as the React key and keep id empty because empty
     * IDs are filtered out through status !== READY before submission.
     */
    updateAttachments((current) => [
      ...current,
      {
        id: "",
        filename: selectedFile.name,
        status: "UPLOADING",
        clientId,
        uploadProgress: 20,
      },
    ]);

    try {
      const uploadedDocument = await uploadFile.mutateAsync(selectedFile);

      updateAttachments((current) =>
        current.map((attachment) =>
          attachment.clientId === clientId
            ? {
                ...uploadedDocument,
                clientId,
                uploadProgress: 100,
              }
            : attachment,
        ),
      );
    } catch {
      /*
       * useFileUpload already shows the backend/API error through Sonner.
       * Preserve the failed attachment visibly so the user understands which
       * document failed and can remove it or choose a different document.
       */
      updateAttachments((current) =>
        current.map((attachment) =>
          attachment.clientId === clientId
            ? {
                ...attachment,
                status: "FAILED",
                uploadProgress: 0,
              }
            : attachment,
        ),
      );
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        disabled={disabled || uploadFile.isPending}
        onChange={handleFileChange}
        aria-label="Attach a PDF, DOCX, or text file"
      />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled || uploadFile.isPending}
              onClick={openPicker}
              aria-label="Attach a file"
            >
              <Paperclip className="size-4" />
            </Button>
          }
        />

        <TooltipContent side="top">
          Attach PDF, DOCX, or TXT file
        </TooltipContent>
      </Tooltip>

      {attachments.length > 0 && (
        <AttachmentGroup className="max-w-72 sm:max-w-96">
          {attachments.map((attachment) => {
            const attachmentState = getAttachmentState(attachment.status);

            return (
              <Attachment
                key={attachment.clientId}
                state={attachmentState}
                size="xs"
                className="max-w-56"
              >
                <AttachmentMedia variant="icon">
                  {attachment.status === "UPLOADING" ||
                  attachment.status === "PROCESSING" ? (
                    <UploadCloud className="size-3.5 animate-pulse" />
                  ) : (
                    <FileText className="size-3.5" />
                  )}
                </AttachmentMedia>

                <AttachmentContent>
                  <AttachmentTitle className="max-w-28 truncate">
                    {attachment.filename}
                  </AttachmentTitle>

                  <AttachmentDescription>
                    {getStatusLabel(attachment.status)}
                  </AttachmentDescription>

                  {(attachment.status === "UPLOADING" ||
                    attachment.status === "PROCESSING") && (
                    <Progress
                      value={attachment.uploadProgress}
                      className="mt-1 h-1"
                      aria-label={`${attachment.filename} upload progress`}
                    />
                  )}
                </AttachmentContent>

                <AttachmentActions>
                  <AttachmentAction
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${attachment.filename}`}
                    onClick={() => removeAttachment(attachment.clientId)}
                  >
                    <Trash2 className="size-3" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            );
          })}
        </AttachmentGroup>
      )}
    </div>
  );
}
