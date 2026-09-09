/**
 * features/files/types.ts
 * Per 01-backend-reference.md "UploadedDocument / File" (heyhi-knowledge).
 */

export type FileStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export interface UploadedDocument {
  id: string;
  filename: string;
  status: FileStatus;
}
