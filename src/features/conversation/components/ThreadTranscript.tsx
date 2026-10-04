import { useMemo } from "react";
import { MessageSquareText } from "lucide-react";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

import { EmptyState } from "@/components/shared/EmptyState";
import { StreamingAnswer } from "@/features/conversation/components/StreamingAnswer";
import { TurnView } from "@/features/conversation/components/TurnView";
import type { StreamingTurnState, Turn } from "@/features/conversation/types";

type ThreadTranscriptProps = {
  turns: Turn[];
  streamingTurn: StreamingTurnState | null;
  onFollowUpSelect: (query: string) => void;
  /*
   * Suppresses the "Start a conversation" empty state for a thread whose
   * history has been fetched but not yet seeded into the transcript (a
   * one-frame gap in ThreadPage). Without this, a thread with real history
   * would briefly flash "start fresh" before its turns render.
   */
  suppressEmptyState?: boolean;
};

/*
 * MessageScrollerProvider owns scroller state only.
 *
 * The generated Base UI/Radix wrapper's provider props vary by shadcn
 * release. Passing no custom provider props is the safest compatible
 * composition. Layout belongs on MessageScroller, and scroll anchors belong
 * on MessageScrollerItem.
 */
export function ThreadTranscript({
  turns,
  streamingTurn,
  onFollowUpSelect,
  suppressEmptyState = false,
}: ThreadTranscriptProps) {
  const completedTurnItems = useMemo(
    () =>
      turns.map((turn, index) => ({
        id: `turn-${turn.created_at}-${index}`,
        turn,
        isLatest: index === turns.length - 1 && !streamingTurn,
      })),
    [streamingTurn, turns],
  );

  const isEmpty =
    completedTurnItems.length === 0 &&
    streamingTurn === null &&
    !suppressEmptyState;

  return (
    <div className="min-h-0 flex-1">
      <MessageScrollerProvider>
        {/*
         * MessageScrollerButton docks at `bottom-4` of this element (its own
         * primitive styling - see message-scroller.tsx). That makes this
         * element's bottom edge a real piece of UI chrome, not just a
         * scroll-clipping box: the content inside needs enough reserved
         * bottom space (see pb-16 below) that the button's dock zone is
         * always empty, never stamped over the last card or source row.
         */}
        <MessageScroller className="relative h-full min-h-0">
          <MessageScrollerViewport className="h-full min-h-0">
            {/*
             * gap-10 separates whole turns (one user question + its answer)
             * from the next - each TurnView already handles its own
             * internal question-to-answer rhythm via its own spacing, so
             * this is specifically the "this exchange is over, a new one is
             * starting" breathing room that was missing before.
             */}
            <MessageScrollerContent className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-3 pb-16 pt-6 sm:px-5 sm:pt-8">
              {isEmpty && (
                <div className="flex min-h-[45vh] items-center justify-center">
                  <EmptyState
                    icon={<MessageSquareText className="size-5" />}
                    title="Start a conversation"
                    description="Ask a question to get a cited, research-grounded answer."
                    className="w-full max-w-md border-0 bg-transparent"
                  />
                </div>
              )}

              {completedTurnItems.map(({ id, turn, isLatest }) => (
                <MessageScrollerItem
                  key={id}
                  messageId={id}
                  scrollAnchor
                  className="w-full"
                >
                  <TurnView
                    turn={turn}
                    isLatest={isLatest}
                    onFollowUpSelect={onFollowUpSelect}
                  />
                </MessageScrollerItem>
              ))}

              {streamingTurn && (
                <MessageScrollerItem
                  messageId="active-streaming-turn"
                  scrollAnchor
                  className="w-full"
                >
                  <StreamingTurnView
                    streamingTurn={streamingTurn}
                    onFollowUpSelect={onFollowUpSelect}
                  />
                </MessageScrollerItem>
              )}

            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton
            /*
             * Positioning (absolute, horizontally centered, bottom-4 when
             * direction="end") is owned by the primitive's own classes. Only
             * pass purely visual classes here - adding bottom-4/right-4 fought
             * the primitive's inset-s-1/2 centering and stranded the button
             * mid-screen over the transcript.
             */
            direction="end"
            className="z-10 rounded-full shadow-lg"
            aria-label="Jump to latest message"
          >
            Jump to latest
          </MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
}

type StreamingTurnViewProps = {
  streamingTurn: StreamingTurnState;
  onFollowUpSelect: (query: string) => void;
};

function StreamingTurnView({
  streamingTurn,
  onFollowUpSelect,
}: StreamingTurnViewProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground shadow-sm sm:max-w-[75%]">
          {streamingTurn.queryText}
        </div>
      </div>

      <StreamingAnswer
        streamingTurn={streamingTurn}
        onFollowUpSelect={onFollowUpSelect}
      />
    </div>
  );
}
