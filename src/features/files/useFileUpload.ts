/**
 * features/files/useFileUpload.ts
 * Per 01-backend-reference.md "File Uploads": PDF/DOCX/plain text only,
 * 25MB max, both limits enforced server-side (413/415) before any
 * processing occurs. Client-side pre-checks here are a courtesy, not the
 * source of truth - always surface the backend's own error message too.
 */
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "./api";
import { ApiError } from "../../../lib/apiError";
import {
  FILE_MAX_SIZE_BYTES,
  SUPPORTED_FILE_TYPES,
} from "../../../lib/constants";
import { toast } from "sonner";

export function useFileUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      if (file.size > FILE_MAX_SIZE_BYTES) {
        throw new ApiError(413, {
          code: "FILE_TOO_LARGE",
          message: "This file is larger than the 25MB limit.",
          request_id: "",
        });
      }
      if (
        !SUPPORTED_FILE_TYPES.includes(
          file.type as (typeof SUPPORTED_FILE_TYPES)[number],
        )
      ) {
        throw new ApiError(415, {
          code: "UNSUPPORTED_FILE_TYPE",
          message: "Only PDF, DOCX, and plain text files are supported.",
          request_id: "",
        });
      }
      return uploadFile(file);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : "Upload failed. Please try again.";
      toast.error(message);
    },
  });
}
