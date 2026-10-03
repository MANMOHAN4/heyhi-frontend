import {
  apiFetch,
  getAccessToken,
  getApiBaseUrl,
  handleUnauthorizedResponse,
} from "@/lib/apiClient";
import { parseApiError } from "@/lib/apiError";
import type { Page } from "@/lib/pagination";

import type {
  CreateThreadRequest,
  ProSearchRequest,
  ShareThreadResponse,
  Thread,
  ThreadSummary,
} from "./types";

/*
 * GET /threads is cursor-paginated (BACKEND_API_REFERENCE.md §8.2):
 * Page<ThreadSummaryResponse> = { items, next_cursor }, always sorted
 * updated_at DESC, not client-configurable. Pass the previous page's
 * next_cursor back as `after` to fetch the next page; null means no more.
 */
export function getThreads(options?: {
  query?: string;
  after?: string;
  size?: number;
}): Promise<Page<ThreadSummary>> {
  const params = new URLSearchParams();

  if (options?.query?.trim()) {
    params.set("q", options.query.trim());
  }

  if (options?.after) {
    params.set("after", options.after);
  }

  if (options?.size) {
    params.set("size", String(options.size));
  }

  const search = params.toString();

  return apiFetch<Page<ThreadSummary>>(`/threads${search ? `?${search}` : ""}`);
}

/*
 * GET /threads/{threadId} - auth-required, owner-scoped. Returns the full
 * Thread including its turn history (02-api-reference.md §8.2). A thread that
 * doesn't exist OR isn't owned by the caller both return 404 (the backend
 * deliberately doesn't distinguish, to avoid leaking thread existence across
 * accounts), surfaced here as an ApiError the caller can treat as not-found.
 */
export function getThread(threadId: string): Promise<Thread> {
  return apiFetch<Thread>(`/threads/${encodeURIComponent(threadId)}`);
}
/*
 * GET /models - public, no auth required (BACKEND_API_REFERENCE.md §8.2,
 * P6): [{ id: string }]. No display metadata is returned - label by id.
 * FREE-plan gating (only "auto" works, others silently downgrade
 * server-side) is a client-side UI decision layered on top of this list,
 * not something this endpoint itself encodes.
 */
export function getModels(): Promise<{ id: string }[]> {
  return apiFetch<{ id: string }[]>("/models", { method: "GET", skipAuth: true });
}

export async function createThread(
  request: CreateThreadRequest,
): Promise<Response> {
  return fetchSse("/threads", request);
}

export async function continueThread(
  threadId: string,
  query: string,
): Promise<Response> {
  return fetchSse(`/threads/${encodeURIComponent(threadId)}/turns`, { query });
}

export async function proSearch(request: ProSearchRequest): Promise<Response> {
  return fetchSse("/threads/pro-search", request);
}

export function renameThread(
  threadId: string,
  payload: { title: string },
): Promise<void> {
  return apiFetch<void>(`/threads/${encodeURIComponent(threadId)}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteThread(threadId: string): Promise<void> {
  return apiFetch<void>(`/threads/${encodeURIComponent(threadId)}`, {
    method: "DELETE",
  });
}

export function shareThread(threadId: string): Promise<ShareThreadResponse> {
  return apiFetch<ShareThreadResponse>(
    `/threads/${encodeURIComponent(threadId)}/share`,
    {
      method: "POST",
    },
  );
}

export function revokeShare(threadId: string): Promise<void> {
  return apiFetch<void>(`/threads/${encodeURIComponent(threadId)}/share`, {
    method: "DELETE",
  });
}

async function fetchSse(path: string, body: object): Promise<Response> {
  const buildHeaders = (accessToken: string | null) => {
    const headers = new Headers({
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
  };

  const accessToken = await getAccessToken();

  let response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    const refreshedAccessToken = await handleUnauthorizedResponse(response);

    if (refreshedAccessToken) {
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        method: "POST",
        headers: buildHeaders(refreshedAccessToken),
        body: JSON.stringify(body),
      });
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (!response.body) {
    throw new Error("The server returned an empty streaming response.");
  }

  return response;
}
