import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { History } from "lucide-react";

import { Composer } from "@/features/conversation/components/Composer";
import { ThreadTranscript } from "@/features/conversation/components/ThreadTranscript";
import { useThreadLookup } from "@/features/conversation/useThreadLookup";
import { useThreadStream } from "@/features/conversation/useThreadStream";
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

  const [turns, setTurns] = useState<Turn[]>([]);

  /*
   * React Router does not remount this component when only the
   * :threadId param changes (index route and /t/:threadId share the same
   * element type), so local state like `turns` would otherwise leak from
   * one thread into the next when navigating sidebar item A -> B. Reset
   * whenever the route's thread id actually changes.
   */
  const previousRouteThreadIdRef = useRef(routeThreadId);

  useEffect(() => {
    if (previousRouteThreadIdRef.current !== routeThreadId) {
      previousRouteThreadIdRef.current = routeThreadId;
      setTurns([]);
    }
  }, [routeThreadId]);

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

  const isStreaming = Boolean(current && !current.isDone);

  const activeThreadId =
    routeThreadId ??
    createdThreadId ??
    sessionStorage.getItem("heyhi:guest-thread-id") ??
    undefined;

  /*
   * Resolves whether routeThreadId is a real, owned thread (and its title)
   * using GET /threads, since there is no GET /threads/{id} endpoint to
   * fetch full turn history directly - see useThreadLookup for why.
   */
  const threadLookup = useThreadLookup(routeThreadId);

  const hasRenderedAnyTurnThisSession =
    turns.length > 0 || current !== null || createdThreadId === routeThreadId;

  useEffect(() => {
    if (!createdThreadId || routeThreadId) {
      return;
    }

    navigate(`/t/${createdThreadId}`, {
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

    clearTransientState();
  }, [clearTransientState, current]);

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

  /*
   * Only block rendering while we're actively trying to resolve a thread the
   * person navigated to directly (sidebar click, reload, shared link within
   * the app) and haven't produced any turns for yet in this tab. Once
   * something has streamed in this session, always show it - don't flash a
   * loading/error state over an active or completed conversation.
   */
  if (
    routeThreadId &&
    !hasRenderedAnyTurnThisSession &&
    threadLookup.status === "loading"
  ) {
    return <PageLoadingState variant="conversation" />;
  }

  if (
    routeThreadId &&
    !hasRenderedAnyTurnThisSession &&
    threadLookup.status === "not-found"
  ) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center p-6">
        <PageErrorState
          title="Conversation unavailable"
          message="This conversation doesn't exist, or you don't have access to it."
          className="max-w-md"
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        {routeThreadId &&
          threadLookup.status === "found" &&
          !hasRenderedAnyTurnThisSession && (
            <div className="mx-auto mt-3 flex w-full max-w-3xl items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <History className="mt-0.5 size-4 shrink-0" />
              <p>
                Continuing{" "}
                <span className="font-medium text-foreground">
                  {threadLookup.title}
                </span>
                . Earlier messages in this conversation aren&apos;t shown
                here yet - ask a follow-up below to keep going.
              </p>
            </div>
          )}

        <ThreadTranscript
          turns={turns}
          streamingTurn={current}
          onFollowUpSelect={handleFollowUpSelect}
          suppressEmptyState={
            threadLookup.status === "found" && !hasRenderedAnyTurnThisSession
          }
        />

        {quotaExceeded && (
          <p className="mx-auto mb-3 max-w-3xl rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {quotaExceeded.message}
          </p>
        )}

        {streamError && (
          <p
            role="alert"
            className="mx-auto mb-3 max-w-3xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
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
    </main>
  );
}
