import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Composer } from "@/features/conversation/components/Composer";
import { ThreadTranscript } from "@/features/conversation/components/ThreadTranscript";
import { useThreadStream } from "@/features/conversation/useThreadStream";

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

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <ThreadTranscript
          turns={turns}
          streamingTurn={current}
          onFollowUpSelect={handleFollowUpSelect}
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
