import { useCallback, useRef, useState } from "react";

import {
  continueThread as continueThreadRequest,
  createThread,
  proSearch,
} from "./api";

import type {
  Citation,
  CreateThreadRequest,
  ProSearchRequest,
  Source,
  StreamingTurnState,
} from "./types";

type QuotaExceededState = {
  message: string;
};

type StreamHandlers = {
  onThreadId: (threadId: string | null) => void;
  onToken: (text: string) => void;
  onSources: (sources: Source[]) => void;
  onCitations: (citations: Citation[]) => void;
  onFollowUps: (followUps: string[]) => void;
  onStep: (step: string) => void;
  onDone: () => void;
};

export function useThreadStream() {
  const [current, setCurrent] = useState<StreamingTurnState | null>(null);

  const [createdThreadId, setCreatedThreadId] = useState<string | null>(null);

  const [streamError, setStreamError] = useState<string | null>(null);

  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededState | null>(
    null,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  const clearTransientState = useCallback(() => {
    setCurrent(null);
    setStreamError(null);
    setQuotaExceeded(null);
  }, []);

  const consumeResponse = useCallback(
    async (
      responsePromise: Promise<Response>,
      queryText: string,
      isProSearch: boolean,
    ) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setCurrent({
        queryText,
        answerText: "",
        sources: [],
        citations: [],
        followUps: [],
        steps: [],
        isProSearch,
        isDone: false,
      });

      setStreamError(null);
      setQuotaExceeded(null);

      try {
        const response = await responsePromise;

        const threadId =
          response.headers.get("X-Thread-Id") ??
          response.headers.get("x-thread-id") ??
          response.headers.get("Thread-Id") ??
          response.headers.get("thread-id");

        if (threadId) {
          setCreatedThreadId(threadId);
          sessionStorage.setItem("heyhi:guest-thread-id", threadId);
        }

        if (!response.body) {
          throw new Error("The server returned no streaming response body.");
        }

        await parseSseStream(
          response.body,
          {
            onThreadId: setCreatedThreadId,

            onToken: (text) => {
              setCurrent((previous) =>
                previous
                  ? {
                      ...previous,
                      answerText: previous.answerText + text,
                    }
                  : previous,
              );
            },

            onSources: (sources) => {
              setCurrent((previous) =>
                previous ? { ...previous, sources } : previous,
              );
            },

            onCitations: (citations) => {
              setCurrent((previous) =>
                previous ? { ...previous, citations } : previous,
              );
            },

            onFollowUps: (followUps) => {
              setCurrent((previous) =>
                previous ? { ...previous, followUps } : previous,
              );
            },

            onStep: (step) => {
              setCurrent((previous) =>
                previous
                  ? {
                      ...previous,
                      steps: [...previous.steps, step],
                    }
                  : previous,
              );
            },

            onDone: () => {
              setCurrent((previous) =>
                previous ? { ...previous, isDone: true } : previous,
              );
            },
          },
          controller.signal,
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to complete the request.";

        if (message.toLowerCase().includes("daily pro search")) {
          setQuotaExceeded({ message });
        } else {
          setStreamError(message);
        }

        setCurrent((previous) =>
          previous ? { ...previous, isDone: true } : previous,
        );
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  const startThread = useCallback(
    async (request: CreateThreadRequest) => {
      setCreatedThreadId(null);

      await consumeResponse(createThread(request), request.query, false);
    },
    [consumeResponse],
  );

  const continueThread = useCallback(
    async (threadId: string, query: string) => {
      await consumeResponse(
        continueThreadRequest(threadId, query),
        query,
        false,
      );
    },
    [consumeResponse],
  );

  const startProSearch = useCallback(
    async (request: ProSearchRequest) => {
      setCreatedThreadId(null);

      await consumeResponse(proSearch(request), request.query, true);
    },
    [consumeResponse],
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setCurrent((previous) =>
      previous ? { ...previous, isDone: true } : previous,
    );
  }, []);

  return {
    current,
    quotaExceeded,
    streamError,
    createdThreadId,
    clearTransientState,
    startThread,
    continueThread,
    startProSearch,
    cancelStream,
  };
}

async function parseSseStream(
  stream: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    if (signal.aborted) {
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

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      processSseEvent(rawEvent, handlers);
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processSseEvent(buffer, handlers);
  }
}

function processSseEvent(rawEvent: string, handlers: StreamHandlers): void {
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of rawEvent.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
    }

    if (line.startsWith("data:")) {
      /*
       * Strip ONLY the "data:" field name - never a following space. Spring's
       * SSE writer emits `data:<value>` with no padding space, so the value's
       * own leading space is significant (LLM tokens are typically " word").
       * The SSE "ignore one optional leading space" rule assumes the server
       * pads with a space; Spring doesn't, so stripping it here deleted every
       * inter-word space and ran answers together ("Paris,thecapitalofFrance").
       */
      dataLines.push(line.slice("data:".length));
    }
  }

  const data = dataLines.join("\n");

  switch (eventName) {
    case "token":
      handlers.onToken(data);
      break;

    case "sources":
      handlers.onSources(parseJsonArray<Source>(data));
      break;

    case "citations":
      handlers.onCitations(parseJsonArray<Citation>(data));
      break;

    case "follow_ups":
      handlers.onFollowUps(parseJsonArray<string>(data));
      break;

    case "step":
      handlers.onStep(data);
      break;

    case "done":
      handlers.onDone();
      break;

    default:
      break;
  }
}

function parseJsonArray<T>(value: string): T[] {
  if (!value.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
