import { useMutation } from "@tanstack/react-query";

import { ApiError, parseApiError } from "@/lib/apiError";
import {
  getAccessToken,
  getApiBaseUrl,
  handleUnauthorizedResponse,
} from "@/lib/apiClient";
import { getFile } from "@/features/files/api";
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

const TERMINAL_STATUSES: ReadonlySet<UploadedDocument["status"]> = new Set([
  "READY",
  "FAILED",
]);

const POLL_INTERVAL_MS = 2000;
/*
 * BACKEND_API_REFERENCE.md P11 calls this "rare, since processing is
 * synchronous" - a generous ceiling here just bounds the worst case (a
 * stuck or abandoned file) rather than reflecting a normal wait time.
 */
const POLL_TIMEOUT_MS = 60_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/*
 * The POST /files response is "usually READY" per the reference doc, but
 * can come back UPLOADING/PROCESSING if the backend hasn't finished
 * extracting/chunking the document yet. Without this, a file stuck in that
 * state would show "Processing document..." in the composer forever -
 * nothing re-checks it, so it would never flip to READY (attachable) or
 * FAILED (removable) on its own.
 *
 * Resolves with the latest known status: READY or FAILED if the backend
 * reached a terminal state in time, otherwise whatever non-terminal status
 * was last observed when the timeout elapsed (the caller's own UI already
 * renders PROCESSING/UPLOADING indefinitely in that case, which is an
 * honest reflection of "still not done").
 */
async function pollUntilTerminal(
  document: UploadedDocument,
): Promise<UploadedDocument> {
  if (TERMINAL_STATUSES.has(document.status)) {
    return document;
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let latest = document;

  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);

    try {
      latest = await getFile(document.id);
    } catch {
      // A transient failure to check status shouldn't surface as the
      // upload itself failing - just try again next interval.
      continue;
    }

    if (TERMINAL_STATUSES.has(latest.status)) {
      return latest;
    }
  }

  return latest;
}

export function useFileUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadFile(file);
      return pollUntilTerminal(uploaded);
    },
  });
}
