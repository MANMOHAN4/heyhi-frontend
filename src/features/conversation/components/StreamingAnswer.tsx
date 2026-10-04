import { useMemo } from "react";
import { Bot, Loader2 } from "lucide-react";

import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";

import { AnswerWithCitations } from "@/features/conversation/components/CitationBadge";
import { FollowUpChips } from "@/features/conversation/components/FollowUpChips";
import { ProSearchSteps } from "@/features/conversation/components/ProSearchSteps";
import { SourceList } from "@/features/conversation/components/SourceList";
import type { StreamingTurnState } from "@/features/conversation/types";

type StreamingAnswerProps = {
  streamingTurn: StreamingTurnState;
  onFollowUpSelect: (query: string) => void;
};

/*
 * Streaming answer behavior:
 *
 * - Before first token: show a compact accessible "Thinking…" Marker.
 * - During token streaming: render accumulated answer text.
 * - Sources/citations appear only after their SSE frames arrive.
 * - Pro Search `step` events render via ProSearchSteps.
 * - At done: render sources and clickable follow-up suggestions.
 *
 * Do NOT put aria-live="polite" around token text. Announcing every token
 * is extremely noisy for screen-reader users. We announce only status
 * markers while work is in progress, and expose a stable completed answer.
 */
export function StreamingAnswer({
  streamingTurn,
  onFollowUpSelect,
}: StreamingAnswerProps) {
  const hasAnswerText = streamingTurn.answerText.trim().length > 0;
  const isWaitingForFirstToken = !hasAnswerText && !streamingTurn.isDone;

  const sources = streamingTurn.sources ?? [];
  const citations = streamingTurn.citations ?? [];
  const followUps = streamingTurn.followUps ?? [];

  const assistantStatus = useMemo(() => {
    if (streamingTurn.isDone) {
      return "Answer complete";
    }

    if (streamingTurn.isProSearch && streamingTurn.steps.length > 0) {
      return "Research in progress";
    }

    return "Generating answer";
  }, [
    streamingTurn.isDone,
    streamingTurn.isProSearch,
    streamingTurn.steps.length,
  ]);

  return (
    <Message align="start" className="w-full">
      {/*
       * The "heyHi" header is a generating-response indicator, not a
       * permanent label: it's visible while a turn is in flight (thinking
       * or actively streaming tokens) and disappears the instant isDone
       * flips true, matching TurnView (the completed-turn renderer), which
       * never shows this header at all. The sr-only status announcement
       * stays independent of the visible label so screen readers are still
       * told what's happening even in the split second right at isDone.
       */}
      {!streamingTurn.isDone && (
        <MessageHeader className="mb-2 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Bot className="size-3.5" />
          </div>

          <span className="text-xs font-medium text-muted-foreground">
            heyHi
          </span>

          <span className="sr-only" role="status">
            {assistantStatus}
          </span>
        </MessageHeader>
      )}

      <MessageContent className="min-w-0 max-w-none space-y-4">
        {streamingTurn.isProSearch && (
          <ProSearchSteps
            steps={streamingTurn.steps}
            isDone={streamingTurn.isDone}
          />
        )}

        {isWaitingForFirstToken && (
          <Marker variant="default" role="status">
            <MarkerIcon>
              <Spinner className="size-3.5" />
            </MarkerIcon>

            <MarkerContent className="shimmer">
              {streamingTurn.isProSearch ? "Planning research…" : "Thinking…"}
            </MarkerContent>
          </Marker>
        )}

        {hasAnswerText && (
          <div
            /*
             * Only becomes a live region after complete. While streaming,
             * aria-live="off" prevents token-by-token narration.
             */
            aria-live={streamingTurn.isDone ? "polite" : "off"}
            aria-atomic={streamingTurn.isDone}
            className="min-w-0"
          >
            <AnswerWithCitations
              answerText={streamingTurn.answerText}
              citations={citations}
              sources={sources}
              className="text-sm text-foreground sm:text-[0.9375rem]"
            />
          </div>
        )}

        {streamingTurn.isDone && sources.length > 0 && (
          <SourceList sources={sources} />
        )}

        {streamingTurn.isDone && followUps.length > 0 && (
          <FollowUpChips
            followUps={followUps}
            disabled={false}
            onSelect={onFollowUpSelect}
          />
        )}

        {streamingTurn.isDone && !hasAnswerText && (
          <Marker variant="border">
            <MarkerIcon>
              <Loader2 className="size-3.5 text-muted-foreground" />
            </MarkerIcon>

            <MarkerContent>
              The response finished without any answer text.
            </MarkerContent>
          </Marker>
        )}
      </MessageContent>
    </Message>
  );
}
