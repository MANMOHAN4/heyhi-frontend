/**
 * routes/conversation/ThreadPage.tsx
 *
 * FIX (duplicate turn bug): the previous version folded a completed stream
 * into persistedTurns inside a useEffect keyed on `current?.isDone`. Once
 * `isDone` flips true, it STAYS true for that stream object, so any extra
 * re-render of this effect (e.g. React.StrictMode's intentional double-
 * invoke of effects in dev, or any parent re-render while `current` is
 * still referentially path-equal on the dependency) re-appends the same
 * turn again. Fixed by tracking which stream instance has already been
 * committed via a ref (commitedStreamRef), keyed on a per-stream id, so the
 * commit logic is idempotent no matter how many times the effect fires for
 * the same completed stream.
 */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Composer } from "../../src/features/conversation/components/Composer";
import { Transcript } from "../../src/features/conversation/components/Transcript";
import { ProSearchQuotaState } from "../../src/features/conversation/components/ProSearchQuotaState";
import { useThreadStream } from "../../src/features/conversation/useThreadStream";
import type { Turn } from "../../src/features/conversation/types";
import type { FocusMode } from "../../../lib/constants";

const GUEST_THREAD_KEY = "heyhi_guest_thread_id";

export function ThreadPage() {
  const { threadId: routeThreadId } = useParams();
  const [persistedTurns, setPersistedTurns] = useState<Turn[]>([]);

  const {
    current,
    quotaExceeded,
    streamError,
    startThread,
    continueThread,
    startProSearch,
  } = useThreadStream();

  const isStreaming = current !== null && !current.isDone;

  // Reset persisted history when navigating between threads (routeThreadId
  // change) so switching threads doesn't carry over the previous thread's
  // turns. In a full implementation this effect would instead fetch the
  // existing thread's turns from GET /threads/{id} - see note below.
  useEffect(() => {
    setPersistedTurns([]);
  }, [routeThreadId]);

  // Idempotency guard: each streaming run gets a unique token (see
  // useThreadStream change below); we only ever commit a given token once,
  // regardless of how many times this effect fires for the same `current`.
  const committedStreamTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!current?.isDone) return;
    if (committedStreamTokenRef.current === current.streamId) return; // already committed

    committedStreamTokenRef.current = current.streamId;
    setPersistedTurns((prev) => [
      ...prev,
      {
        query_text: current.queryText,
        answer_text: current.answerText,
        sources: current.sources ?? [],
        citations: current.citations ?? [],
        follow_ups: current.followUps ?? [],
        created_at: new Date().toISOString(),
      },
    ]);
  }, [current]);

  const handleSubmit = (params: {
    query: string;
    focusMode: FocusMode;
    fileIds: string[];
    model: string;
    isProSearch: boolean;
  }) => {
    if (routeThreadId) {
      continueThread(routeThreadId, { query: params.query });
      return;
    }

    if (params.isProSearch) {
      startProSearch({ query: params.query, focus_mode: params.focusMode });
      return;
    }

    startThread({
      query: params.query,
      focus_mode: params.focusMode,
      file_ids: params.fileIds.length > 0 ? params.fileIds : undefined,
      model: params.model,
    });
    // NOTE: guest thread-ID capture (sessionStorage) should be wired once
    // the backend's exact mechanism for exposing a new thread's ID during/
    // after an SSE stream is confirmed - not done here to avoid guessing
    // at an unconfirmed contract. Flag before relying on guest continuity.
    void GUEST_THREAD_KEY;
  };

  const handleFollowUpSelect = (question: string) => {
    if (routeThreadId) {
      continueThread(routeThreadId, { query: question });
    } else {
      startThread({ query: question });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        <Transcript
          turns={persistedTurns}
          streamingState={current}
          onFollowUpSelect={handleFollowUpSelect}
        />

        <div className="shrink-0 border-t border-border/70 bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          {quotaExceeded && (
            <div className="mb-3">
              <ProSearchQuotaState message={quotaExceeded.message} />
            </div>
          )}

          {streamError && (
            <p
              role="alert"
              className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {streamError}
            </p>
          )}

          <Composer
            isStreaming={isStreaming}
            threadId={routeThreadId}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
