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
