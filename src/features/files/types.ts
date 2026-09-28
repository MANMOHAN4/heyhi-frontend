/*
 * DocumentResponse (BACKEND_API_REFERENCE.md §8.3): { id, filename, status }.
 * No size/mime/hash/createdAt exposed - the backend genuinely doesn't return
 * them, this isn't an incomplete mapping.
 */
export type DocumentStatus =
  | "UPLOADING"
  | "PROCESSING"
  | "READY"
  | "FAILED"
  | "DELETING";

export interface UploadedDocument {
  id: string;
  filename: string;
  status: DocumentStatus;
}

export interface UploadingDocument extends UploadedDocument {
  upload_progress?: number;
  error_message?: string;
}
