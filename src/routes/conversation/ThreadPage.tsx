import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Composer } from "@/features/conversation/components/Composer";
import { ThreadTranscript } from "@/features/conversation/components/ThreadTranscript";
import { useThreadQuery } from "@/features/conversation/useThreadQuery";
import { useThreadStream } from "@/features/conversation/useThreadStream";
import { ApiError } from "@/lib/apiError";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { PageLoadingState } from "@/components/shared/PageLoadingState";

import type {
  CreateThreadRequest,
  FocusMode,
  Turn,
} from "@/features/conversation/types";

export default function ThreadPage() {
  const { threadId: routeThreadId } = useParams<{
    threadId?: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [turns, setTurns] = useState<Turn[]>([]);

  /*
   * React Router does not remount this component when only the
   * :threadId param changes (index route and /threads/:threadId share the same
   * element type), so local state like `turns` would otherwise leak from
   * one thread into the next when navigating sidebar item A -> B. Reset
   * whenever the route's thread id actually changes, and allow the new
   * thread's history to seed again.
   */
  const previousRouteThreadIdRef = useRef(routeThreadId);
  const seededThreadIdRef = useRef<string | undefined>(undefined);

  const {
    current,
    quotaExceeded,
    streamError,
    createdThreadId,
    clearTransientState,
    startThread,
    continueThread,
    startProSearch,
    cancelStream,
  } = useThreadStream();

  /*
   * Fetches the opened thread's full persisted turn history (sidebar click,
   * reload, in-app link). Disabled for guests and for the "new conversation"
   * screen (no threadId).
   */
  const threadQuery = useThreadQuery(routeThreadId);

  const isStreaming = Boolean(current && !current.isDone);

  const activeThreadId =
    routeThreadId ??
    createdThreadId ??
    sessionStorage.getItem("heyhi:guest-thread-id") ??
    undefined;

  useEffect(() => {
    if (previousRouteThreadIdRef.current !== routeThreadId) {
      previousRouteThreadIdRef.current = routeThreadId;
      seededThreadIdRef.current = undefined;
      setTurns([]);
    }
  }, [routeThreadId]);

  /*
   * Seed the transcript from fetched history. Guards:
   * - data?.id === routeThreadId: never seed one thread's history into another
   *   (the query cache is keyed per thread, but renders can briefly straddle a
   *   navigation).
   * - seed only when nothing is shown yet (previous.length === 0): a turn that
   *   just streamed in this tab is authoritative; the server copy may lag a
   *   moment behind, so don't clobber or double-count it.
   * seededThreadIdRef then pins this thread so a later background refetch
   * (e.g. after a follow-up) won't re-seed over the live transcript.
   */
  useEffect(() => {
    if (!routeThreadId) {
      return;
    }

    if (seededThreadIdRef.current === routeThreadId) {
      return;
    }

    if (threadQuery.data?.id !== routeThreadId) {
      return;
    }

    const history = threadQuery.data.turns ?? [];

    setTurns((previous) => (previous.length > 0 ? previous : history));
    seededThreadIdRef.current = routeThreadId;
  }, [routeThreadId, threadQuery.data]);

  useEffect(() => {
    if (!createdThreadId || routeThreadId) {
      return;
    }

    navigate(`/threads/${createdThreadId}`, {
      replace: true,
    });
  }, [createdThreadId, navigate, routeThreadId]);

  useEffect(() => {
    if (!current?.isDone) {
      return;
    }

    if (!current.answerText.trim()) {
      clearTransientState();
      return;
    }

    const completedTurn: Turn = {
      query_text: current.queryText,
      answer_text: current.answerText,
      sources: current.sources,
      citations: current.citations,
      follow_ups: current.followUps,
      created_at: new Date().toISOString(),
    };

    setTurns((previous) => [...previous, completedTurn]);

    if (activeThreadId) {
      /*
       * These turns are now owned locally for this thread - pin it so the
       * history fetch won't re-seed over them, and refresh the cached history
       * so reopening the thread later shows the newly-persisted turn.
       */
      seededThreadIdRef.current = activeThreadId;
      void queryClient.invalidateQueries({
        queryKey: ["thread", activeThreadId],
      });
    }

    clearTransientState();
  }, [activeThreadId, clearTransientState, current, queryClient]);

  const handleSubmit = useCallback(
    ({
      query,
      focusMode,
      fileIds,
      model,
      isProSearch,
    }: {
      query: string;
      focusMode: FocusMode;
      fileIds: string[];
      model: string;
      isProSearch: boolean;
    }) => {
      if (activeThreadId && !isProSearch) {
        void continueThread(activeThreadId, query);
        return;
      }

      if (isProSearch) {
        void startProSearch({
          query,
          focus_mode: focusMode,
        });
        return;
      }

      const request: CreateThreadRequest = {
        query,
        focus_mode: focusMode,
        model: model || "auto",
      };

      if (fileIds.length > 0) {
        request.file_ids = fileIds;
      }

      void startThread(request);
    },
    [activeThreadId, continueThread, startProSearch, startThread],
  );

  const handleFollowUpSelect = useCallback(
    (query: string) => {
      if (!activeThreadId || isStreaming) {
        return;
      }

      void continueThread(activeThreadId, query);
    },
    [activeThreadId, continueThread, isStreaming],
  );

  const hasRenderedAnyTurnThisSession =
    turns.length > 0 || current !== null || createdThreadId === routeThreadId;

  /*
   * Block rendering only while first resolving a thread the person navigated
   * to directly and haven't produced any turns for yet in this tab. Once
   * something has streamed or seeded, always show it rather than flashing a
   * loading/error state over an active or completed conversation.
   */
  if (
    routeThreadId &&
    !hasRenderedAnyTurnThisSession &&
    threadQuery.isLoading
  ) {
    return <PageLoadingState variant="conversation" />;
  }

  if (routeThreadId && !hasRenderedAnyTurnThisSession && threadQuery.isError) {
    const notFound =
      threadQuery.error instanceof ApiError && threadQuery.error.status === 404;

    return (
      <main className="flex min-h-0 flex-1 items-center justify-center p-6">
        <PageErrorState
          title={notFound ? "Conversation unavailable" : "Couldn't load conversation"}
          message={
            notFound
              ? "This conversation doesn't exist, or you don't have access to it."
              : "Something went wrong loading this conversation. Please try again."
          }
          onRetry={notFound ? undefined : () => void threadQuery.refetch()}
          className="max-w-md"
        />
      </main>
    );
  }

  /*
   * Suppress the "Start a conversation" empty state during the one-frame gap
   * where history has arrived but the seeding effect hasn't run yet, so a
   * thread with real history never flashes as empty.
   */
  const suppressEmptyState =
    (threadQuery.data?.turns?.length ?? 0) > 0 && turns.length === 0;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <ThreadTranscript
          turns={turns}
          streamingTurn={current}
          onFollowUpSelect={handleFollowUpSelect}
          suppressEmptyState={suppressEmptyState}
        />

        {/*
          * Composer dock: pinned to the bottom of the column, but the card
          * itself is centered and width-limited with side + bottom breathing
          * room, the way Claude / ChatGPT / Perplexity float their input
          * instead of stretching it edge-to-edge against the sidebar.
          */}
        <div className="shrink-0 px-3 pb-3 pt-2 sm:px-5 sm:pb-4">
          <div className="mx-auto w-full max-w-3xl">
            {quotaExceeded && (
              <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {quotaExceeded.message}
              </p>
            )}

            {streamError && (
              <p
                role="alert"
                className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {streamError}
              </p>
            )}

            <Composer
              threadId={activeThreadId}
              isStreaming={isStreaming}
              onSubmit={handleSubmit}
              onStopStreaming={cancelStream}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
