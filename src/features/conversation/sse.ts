/**
 * features/conversation/sse.ts
 *
 * Manual SSE consumption for the three streaming endpoints
 * (POST /threads, /threads/{id}/turns, /threads/pro-search). The browser's
 * native EventSource API CANNOT be used here - it only supports GET
 * requests, and these are POST with a body (see 02-api-reference.md
 * "Streaming Endpoints"). This file is a close, hardened port of the
 * reference implementation pattern given in that spec section.
 *
 * Event sequence for a normal (non-Pro-Search) query:
 *   token (0..N) -> sources (1, may be []) -> citations (1, may be []) ->
 *   follow_ups (1, may be []) -> done (1, always last)
 *
 * Pro Search additionally interleaves `step` events before the token
 * sequence begins, and never emits follow_ups.
 *
 * CRITICAL defensive requirement (see "Error mid-stream" in
 * 02-api-reference.md): if generation fails after streaming has already
 * begun, the backend does NOT send an HTTP error - it degrades gracefully
 * within the stream itself, e.g.:
 *   event: token \n data:Something went wrong while generating this answer.
 *   event: done  \n data:
 * ALWAYS be prepared for a stream to end with only token+done, no
 * sources/citations/follow_ups at all. Never assume all five event types
 * will appear - render whatever arrived and stop gracefully on `done`.
 */
import { API_BASE_URL } from "../../../lib/constants";
import { ApiError, parseApiError } from "../../../lib/apiError";
import type { Citation, Source, StreamHandlers } from "./types";

export async function streamQuery(
  path: string,
  body: object,
  accessToken: string | null,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    // Pre-stream failure (e.g. 404 THREAD_NOT_FOUND, 429
    // PRO_SEARCH_QUOTA_EXCEEDED) - a normal JSON error body, not SSE.
    throw await parseApiError(response);
  }

  if (!response.body) {
    throw new ApiError(500, {
      code: "STREAM_UNAVAILABLE",
      message: "No response body received for a streaming request.",
      request_id: "",
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Blank line = event boundary. Keep any incomplete trailing event in
    // the buffer for the next chunk - chunk boundaries can split mid-event.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      if (!rawEvent.trim()) continue;
      const { eventName, data } = parseSseFrame(rawEvent);
      const stop = dispatchEvent(eventName, data, handlers);
      if (stop) return;
    }
  }

  // If the stream ends without an explicit `done` event (should not happen
  // per spec, but defensive against a truncated connection), still signal
  // completion so the UI doesn't hang in a permanently-streaming state.
  handlers.onDone();
}

function parseSseFrame(rawEvent: string): { eventName: string; data: string } {
  const lines = rawEvent.split("\n");
  let eventName = "message";
  let data = "";
  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      // data: may span multiple lines per the SSE spec - accumulate them.
      data += line.slice(5) + "\n";
    }
  }
  return { eventName, data: data.replace(/\n$/, "") };
}

/** Returns true if the caller should stop reading (i.e. `done` was received). */
function dispatchEvent(
  eventName: string,
  data: string,
  handlers: StreamHandlers,
): boolean {
  switch (eventName) {
    case "token":
      handlers.onToken(data);
      return false;
    case "sources":
      handlers.onSources(safeParseJsonArray<Source>(data));
      return false;
    case "citations":
      handlers.onCitations(safeParseJsonArray<Citation>(data));
      return false;
    case "follow_ups":
      handlers.onFollowUps(safeParseJsonArray<string>(data));
      return false;
    case "step":
      handlers.onStep(data);
      return false;
    case "done":
      handlers.onDone();
      return true;
    default:
      // Unknown event name: ignore rather than crash, forward-compatible
      // with any future event types the backend might add.
      return false;
  }
}

function safeParseJsonArray<T>(data: string): T[] {
  if (!data.trim()) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
