import { ApiError } from "@/lib/apiError";

import type { Citation, Source, StreamHandlers } from "./types";

export async function consumeSseStream(
  response: Response,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) {
    throw new ApiError(
      "SSE_EMPTY_BODY",
      "The server returned an empty stream.",
      500,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }

      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        dispatchSseFrame(frame, handlers);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      dispatchSseFrame(buffer, handlers);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "SSE_PARSE_ERROR",
      "Unable to read the response stream.",
      500,
    );
  } finally {
    reader.releaseLock();
  }
}

function dispatchSseFrame(frame: string, handlers: StreamHandlers): void {
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  const data = dataLines.join("\n");

  switch (eventName) {
    case "token":
      handlers.onToken(data);
      return;

    case "sources":
      handlers.onSources(parseArray<Source>(data));
      return;

    case "citations":
      handlers.onCitations(parseArray<Citation>(data));
      return;

    case "follow_ups":
      handlers.onFollowUps(parseArray<string>(data));
      return;

    case "step":
      handlers.onStep(data);
      return;

    case "done":
      handlers.onDone();
      return;

    default:
      return;
  }
}

function parseArray<T>(data: string): T[] {
  if (!data.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(data);

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
