/**
 * features/conversation/useThreadStream.ts
 *
 * FIX: each call to runStream() now stamps the resulting StreamingTurnState
 * with a unique, client-generated `streamId` (crypto.randomUUID()). This
 * lets ThreadPage's commit effect tell "a completed stream I haven't
 * committed yet" apart from "the same completed stream firing again",
 * which is what caused the duplicate-turn rendering bug.
 *
 * IMPORTANT per 02-api-reference.md "POST /threads/{threadId}/turns":
 * focus_mode/file_ids/space_id/model are fixed at thread creation and NOT
 * accepted on continuation turns - only `query` goes to continueThread().
 */
import { useCallback, useRef, useState } from "react";
import { streamQuery } from "./sse";
import { useAuthStore } from "../auth/useAuthStore";
import { ApiError } from "../../../lib/apiError";
import type {
  CreateThreadRequest,
  ContinueThreadRequest,
  ProSearchRequest,
  StreamingTurnState,
  Source,
  Citation,
} from "./types";

function generateStreamId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stream_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const emptyTurnState = (
  streamId: string,
  isProSearch: boolean,
): StreamingTurnState => ({
  streamId,
  queryText: "",
  answerText: "",
  sources: null,
  citations: null,
  followUps: null,
  steps: [],
  isDone: false,
  isProSearch,
});

interface QuotaExceededState {
  message: string;
}

export function useThreadStream() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [current, setCurrent] = useState<StreamingTurnState | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededState | null>(
    null,
  );
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runStream = useCallback(
    async (
      path: string,
      body: object,
      queryText: string,
      isProSearch: boolean,
    ) => {
      // Abort any in-flight stream before starting a new one - prevents two
      // concurrent streams both writing into `current` if the user
      // double-submits (e.g. double-clicking Send or a follow-up chip).
      abortRef.current?.abort();

      setQuotaExceeded(null);
      setStreamError(null);
      const streamId = generateStreamId();
      setCurrent({ ...emptyTurnState(streamId, isProSearch), queryText });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamQuery(
          path,
          body,
          accessToken,
          {
            onToken: (text) =>
              setCurrent((prev) =>
                prev && prev.streamId === streamId
                  ? { ...prev, answerText: prev.answerText + text }
                  : prev,
              ),
            onSources: (sources: Source[]) =>
              setCurrent((prev) =>
                prev && prev.streamId === streamId
                  ? { ...prev, sources }
                  : prev,
              ),
            onCitations: (citations: Citation[]) =>
              setCurrent((prev) =>
                prev && prev.streamId === streamId
                  ? { ...prev, citations }
                  : prev,
              ),
            onFollowUps: (followUps) =>
              setCurrent((prev) =>
                prev && prev.streamId === streamId
                  ? { ...prev, followUps }
                  : prev,
              ),
            onStep: (description) =>
              setCurrent((prev) =>
                prev && prev.streamId === streamId
                  ? { ...prev, steps: [...prev.steps, description] }
                  : prev,
              ),
            onDone: () =>
              setCurrent((prev) =>
                prev && prev.streamId === streamId
                  ? { ...prev, isDone: true }
                  : prev,
              ),
          },
          controller.signal,
        );
      } catch (err) {
        if (controller.signal.aborted) return; // superseded by a newer stream, not a real error
        if (
          err instanceof ApiError &&
          err.code === "PRO_SEARCH_QUOTA_EXCEEDED"
        ) {
          setQuotaExceeded({ message: err.message });
          setCurrent(null);
          return;
        }
        setStreamError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong starting this search.",
        );
        setCurrent(null);
      }
    },
    [accessToken],
  );

  const startThread = useCallback(
    (request: CreateThreadRequest) =>
      runStream("/threads", request, request.query, false),
    [runStream],
  );

  const continueThread = useCallback(
    (threadId: string, request: ContinueThreadRequest) =>
      runStream(`/threads/${threadId}/turns`, request, request.query, false),
    [runStream],
  );

  const startProSearch = useCallback(
    (request: ProSearchRequest) =>
      runStream("/threads/pro-search", request, request.query, true),
    [runStream],
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setCurrent(null);
  }, []);

  return {
    current,
    quotaExceeded,
    streamError,
    startThread,
    continueThread,
    startProSearch,
    cancelStream,
  };
}
