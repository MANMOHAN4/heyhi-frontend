import { useMutation } from "@tanstack/react-query";

import { ApiError, parseApiError } from "@/lib/apiError";
import {
  getAccessToken,
  getApiBaseUrl,
  handleUnauthorizedResponse,
} from "@/lib/apiClient";
import type { UploadedDocument } from "@/features/files/types";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

async function uploadFile(file: File): Promise<UploadedDocument> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(
      "FILE_TOO_LARGE",
      "Files must be 25 MB or smaller.",
      413,
    );
  }

  if (!SUPPORTED_TYPES.has(file.type)) {
    throw new ApiError(
      "UNSUPPORTED_FILE_TYPE",
      "Only PDF, DOCX, and TXT files are supported.",
      415,
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  const buildHeaders = (accessToken: string | null) => {
    const headers = new Headers();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
  };

  const accessToken = await getAccessToken();

  let response = await fetch(`${getApiBaseUrl()}/files`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: formData,
  });

  if (response.status === 401) {
    const refreshedAccessToken = await handleUnauthorizedResponse(response);

    if (refreshedAccessToken) {
      response = await fetch(`${getApiBaseUrl()}/files`, {
        method: "POST",
        headers: buildHeaders(refreshedAccessToken),
        body: formData,
      });
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as UploadedDocument;
}

export function useFileUpload() {
  return useMutation({
    mutationFn: uploadFile,
  });
}
