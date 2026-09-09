/**
 * features/conversation/api.ts
 * Non-streaming thread management + sharing endpoints. The three streaming
 * endpoints (POST /threads, /threads/{id}/turns, /threads/pro-search) are
 * NOT here - they're driven directly via streamQuery() in sse.ts / the
 * useThreadStream hook, since they need raw Response/ReadableStream access
 * that apiFetch's JSON-only contract doesn't support.
 */
import { apiFetch } from "../../../lib/apiClient";
import type {
  ThreadSummary,
  RenameThreadRequest,
  ShareThreadResponse,
} from "./types";

export function getThreads(q?: string): Promise<ThreadSummary[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<ThreadSummary[]>(`/threads${query}`, { method: "GET" });
}

export function renameThread(
  threadId: string,
  payload: RenameThreadRequest,
): Promise<void> {
  return apiFetch<void>(`/threads/${threadId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteThread(threadId: string): Promise<void> {
  return apiFetch<void>(`/threads/${threadId}`, { method: "DELETE" });
}

export function shareThread(threadId: string): Promise<ShareThreadResponse> {
  // Idempotent - calling again on an already-shared thread returns the same
  // token, safe to call every time the user clicks "Share".
  return apiFetch<ShareThreadResponse>(`/threads/${threadId}/share`, {
    method: "POST",
  });
}

export function revokeShare(threadId: string): Promise<void> {
  return apiFetch<void>(`/threads/${threadId}/share`, { method: "DELETE" });
}
