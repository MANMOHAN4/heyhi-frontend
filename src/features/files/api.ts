/**
 * features/files/api.ts
 * Per 02-api-reference.md "Knowledge - Files & Spaces":
 *  - POST /files: multipart/form-data, field name "file", auth required.
 *    Returns 202 immediately - in practice `status` is almost always
 *    already READY/FAILED by the time the response returns, since the
 *    backend processes files synchronously within the upload request.
 *  - GET /files/{id}: same shape, reflects current status. Rarely needed -
 *    only poll if you want extra certainty before referencing the file
 *    elsewhere (e.g. attaching it to a thread or a Space).
 *  - 413 FILE_TOO_LARGE (>25MB), 415 UNSUPPORTED_FILE_TYPE (not PDF/DOCX/
 *    plain text) - both returned immediately, no partial upload occurs.
 */
import { apiFetch } from "../../../lib/apiClient";
import type { UploadedDocument } from "./types";

export function uploadFile(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("file", file);
  // apiFetch detects FormData and skips JSON.stringify / Content-Type
  // header (the browser sets the correct multipart boundary automatically).
  return apiFetch<UploadedDocument>("/files", {
    method: "POST",
    body: formData,
  });
}

export function getFile(fileId: string): Promise<UploadedDocument> {
  return apiFetch<UploadedDocument>(`/files/${fileId}`, { method: "GET" });
}
