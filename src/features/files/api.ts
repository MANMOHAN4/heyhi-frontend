import { apiFetch } from "@/lib/apiClient";
import type { UploadedDocument } from "./types";

export function uploadFile(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<UploadedDocument>("/files", {
    method: "POST",
    body: formData,
  });
}

export function getFile(fileId: string): Promise<UploadedDocument> {
  return apiFetch<UploadedDocument>(`/files/${fileId}`, {
    method: "GET",
  });
}
