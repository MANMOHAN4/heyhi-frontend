/**
 * features/spaces/components/AddFileDialog.tsx
 *
 * Per 03-pages-and-features.md §6: "pick from the user's own already-
 * uploaded files - note there's no dedicated 'list my files' endpoint
 * confirmed in the API; flagged as a real gap." Workaround implemented
 * here: upload a NEW file directly into the Space (upload -> then
 * POST /spaces/{id}/files with the returned file_id), since that's the
 * only reliable path available without a file-listing endpoint. If/when
 * a "list my files" endpoint ships, replace this with a real picker.
 */
import { useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { useFileUpload } from "../../files/useFileUpload";
import { useAddFileToSpace } from "../useSpaceMutations";

interface AddFileDialogProps {
  spaceId: string;
  open: boolean;
  onClose: () => void;
}

export function AddFileDialog({ spaceId, open, onClose }: AddFileDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useFileUpload();
  const addFileToSpace = useAddFileToSpace(spaceId);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await upload.mutateAsync(file);
      await addFileToSpace.mutateAsync(uploaded.id);
      onClose();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg border bg-popover p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Add a file to this Space</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">
          Upload a PDF, DOCX, or plain text file (up to 25MB). It will be shared
          with everyone in this Space.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          disabled={busy}
          onChange={handleFileSelect}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {busy ? "Uploading…" : "Choose file"}
        </button>
      </div>
    </div>
  );
}
