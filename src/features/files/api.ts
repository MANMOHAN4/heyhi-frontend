import { apiFetch } from "@/lib/apiClient";
import type { UploadedDocument } from "@/features/files/types";

/*
 * GET /files (BACKEND_API_REFERENCE.md §8.3): List<DocumentResponse>, the
 * caller's own files, no paging. This is the "pick an existing file" source
 * for Spaces (previously an absent-endpoint gap - see the old flagged note
 * in AddFileDialog's history). File upload itself goes through
 * useFileUpload's raw fetch (needs the 202-with-body handling + proactive
 * token refresh), not this apiFetch-based module.
 */
export function getFiles(): Promise<UploadedDocument[]> {
  return apiFetch<UploadedDocument[]>("/files", { method: "GET" });
}

/*
 * GET /files/{fileId} (BACKEND_API_REFERENCE.md §8.3, P11): returns the same
 * { id, filename, status } shape as the upload response. P11 calls out
 * polling this while a file is PROCESSING - rare in practice since
 * processing is synchronous, but the 202 upload response can occasionally
 * come back non-terminal, and there's otherwise no way to learn it later
 * finished (or failed) without this call.
 *
 * Note (same doc, §8.3): this endpoint has no owner check - any
 * authenticated caller who knows a file's id can read its status. That's a
 * backend property, not something to work around here; just don't treat a
 * successful call as proof the caller owns the file.
 */
export function getFile(fileId: string): Promise<UploadedDocument> {
  return apiFetch<UploadedDocument>(`/files/${encodeURIComponent(fileId)}`, {
    method: "GET",
  });
}
