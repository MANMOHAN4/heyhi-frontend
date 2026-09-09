import { useMutation } from "@tanstack/react-query";

import { ApiError, parseApiError } from "@/lib/apiError";
import {
  getAccessToken,
  getApiBaseUrl,
  handleUnauthorizedResponse,
} from "@/lib/apiClient";

type UploadedFile = {
  id: string;
  filename: string;
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

async function uploadFile(file: File): Promise<UploadedFile> {
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

  const headers = new Headers();
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}/files`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw await parseApiError(response);
  }

  return (await response.json()) as UploadedFile;
}

export function useFileUpload() {
  return useMutation({
    mutationFn: uploadFile,
  });
}
