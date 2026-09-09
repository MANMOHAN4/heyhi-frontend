/**
 * features/conversation/components/Transcript.tsx
 *
 * FIX: added `min-w-0` to the scroll container and constrained turn content
 * to a max-width centered column (`mx-auto w-full max-w-3xl`). Previously
 * the container had no explicit width constraint, so wide content (the
 * SourceList's horizontal-scrolling row of cards) could push the container
 * itself wider than the viewport instead of scrolling WITHIN its own
 * bounds - visible in the screenshot as source cards running off the right
 * edge. `min-w-0` is required on flex children that contain
 * overflow-scrolling content, since flex items default to min-width:auto,
 * which ignores overflow settings on descendants.
 */
import { useEffect, useRef, useState } from "react";
import { TurnPair } from "./TurnPair";
import { StreamingAnswer } from "./StreamingAnswer";
import type { Turn, StreamingTurnState } from "../types";

interface TranscriptProps {
  turns: Turn[];
  streamingState: StreamingTurnState | null;
  onFollowUpSelect: (question: string) => void;
}

export function Transcript({
  turns,
  streamingState,
  onFollowUpSelect,
}: TranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setUserScrolledUp(distanceFromBottom > 80);
  };

  useEffect(() => {
    if (userScrolledUp) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [
    turns,
    streamingState?.answerText,
    streamingState?.steps,
    userScrolledUp,
  ]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      aria-label="Conversation transcript"
    >
      <div className="mx-auto w-full max-w-3xl px-4">
        {turns.map((turn, i) => (
          <TurnPair
            key={i}
            turn={turn}
            onFollowUpSelect={onFollowUpSelect}
            isLatest={i === turns.length - 1 && !streamingState}
          />
        ))}

        {streamingState && (
          <div className="space-y-3 py-4">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                {streamingState.queryText}
              </div>
            </div>
            <div className="max-w-[85%]">
              <StreamingAnswer
                state={streamingState}
                onFollowUpSelect={onFollowUpSelect}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
