/**
 * features/conversation/components/FileAttachButton.tsx
 * Only usable by authenticated users acting on their own files (see
 * 02-api-reference.md "POST /threads" file_ids note). Disabled for guests.
 * Shows per-file upload state (uploading / ready / failed) as an
 * Attachment-style chip list.
 */
import { useRef, useState } from "react";
import { useFileUpload } from "../../files/useFileUpload";
import type { UploadedDocument } from "../../files/types";
import { Paperclip, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FileAttachButtonProps {
  attachedFiles: UploadedDocument[];
  onFilesChange: (files: UploadedDocument[]) => void;
  disabled?: boolean;
}

export function FileAttachButton({ attachedFiles, onFilesChange, disabled }: FileAttachButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useFileUpload();
  const [pendingNames, setPendingNames] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingNames((prev) => [...prev, file.name]);
    try {
      const uploaded = await upload.mutateAsync(file);
      onFilesChange([...attachedFiles, uploaded]);
    } finally {
      setPendingNames((prev) => prev.filter((n) => n !== file.name));
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(attachedFiles.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        disabled={disabled}
        onChange={handleFileSelect}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        title="Attach a file (PDF, DOCX, or plain text, up to 25MB)"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-50"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      {pendingNames.map((name) => (
        <span key={name} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" /> {name}
        </span>
      ))}

      {attachedFiles.map((file) => (
        <span key={file.id} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
          {file.status === "READY" && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          {file.status === "FAILED" && <AlertCircle className="h-3 w-3 text-destructive" />}
          {file.status === "PROCESSING" && <Loader2 className="h-3 w-3 animate-spin" />}
          {file.filename}
          <button type="button" onClick={() => removeFile(file.id)} aria-label={`Remove ${file.filename}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
