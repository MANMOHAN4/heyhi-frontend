import { getAccessToken, getApiBaseUrl, apiFetch } from "@/lib/api";
import { parseApiError } from "@/lib/apiError";

import type {
  CreateThreadRequest,
  ProSearchRequest,
  ShareThreadResponse,
  Thread,
  ThreadSummary,
} from "./types";

export function getThreads(query?: string): Promise<ThreadSummary[]> {
  const search = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";

  return apiFetch<ThreadSummary[]>(`/threads${search}`);
}

export function getThread(threadId: string): Promise<Thread> {
  return apiFetch<Thread>(`/threads/${encodeURIComponent(threadId)}`);
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
    throw await parseApiError(response);
  }

  if (!response.body) {
    throw new Error("The server returned an empty streaming response.");
  }

  return response;
}
