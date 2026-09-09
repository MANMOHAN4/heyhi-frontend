export type DocumentStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export interface UploadedDocument {
  id: string;
  filename: string;
  status: DocumentStatus;
}

export interface UploadingDocument extends UploadedDocument {
  upload_progress?: number;
  error_message?: string;
}
