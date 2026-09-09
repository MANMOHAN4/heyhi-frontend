import {
  apiFetch,
  getAccessToken,
  getApiBaseUrl,
  handleUnauthorizedResponse,
} from "@/lib/apiClient";
import { parseApiError } from "@/lib/apiError";

import type {
  CreateThreadRequest,
  ProSearchRequest,
  ShareThreadResponse,
  ThreadSummary,
} from "./types";

export function getThreads(query?: string): Promise<ThreadSummary[]> {
  const search = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";

  return apiFetch<ThreadSummary[]>(`/threads${search}`);
}

/*
 * NOTE: there is currently no documented GET /threads/{threadId} endpoint
 * on the backend (see 02-api-reference.md - only GET /threads, the list
 * endpoint, exists). Full thread history for the ThreadPage route is
 * reconstructed client-side from GET /threads (title/updated_at only) plus
 * whatever turns have streamed in during this browser session, because
 * there is currently no way to fetch a single thread's turn array at all.
 *
 * Flag to backend: add GET /threads/{threadId} returning the full Thread
 * (including `turns`) so a thread opened from the sidebar/reload can show
 * its real history instead of only turns generated in the current tab.
 */
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
  const headers = new Headers({
    Accept: "text/event-stream",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  });

  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw await parseApiError(response);
  }

  if (!response.body) {
    throw new Error("The server returned an empty streaming response.");
  }

  return response;
}
