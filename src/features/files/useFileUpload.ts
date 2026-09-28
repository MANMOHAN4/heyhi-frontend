import { useMutation } from "@tanstack/react-query";

import { ApiError, parseApiError } from "@/lib/apiError";
import {
  getAccessToken,
  getApiBaseUrl,
  handleUnauthorizedResponse,
} from "@/lib/apiClient";
import type { UploadedDocument } from "@/features/files/types";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/*
 * BACKEND_API_REFERENCE.md §10: the code-level limit is 25MB, but
 * spring.servlet.multipart.max-file-size isn't configured, so Spring's
 * 1MB default applies first. A file between 1MB and 25MB currently fails
 * at the servlet layer with an unhandled 500, not a clean 413. Warn before
 * it hits the backend rather than let it surface as an opaque server error.
 * Remove this once the backend raises its multipart cap to match (Appendix
 * A #4) - MAX_FILE_SIZE_BYTES above already reflects the intended limit.
 */
const KNOWN_WORKING_UPLOAD_LIMIT_BYTES = 1 * 1024 * 1024;

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

  if (file.size > KNOWN_WORKING_UPLOAD_LIMIT_BYTES) {
    throw new ApiError(
      "FILE_TOO_LARGE",
      "Files over 1 MB currently fail to upload due to a known server " +
        "configuration limit, even though the app allows up to 25 MB. " +
        "Please use a smaller file for now.",
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
