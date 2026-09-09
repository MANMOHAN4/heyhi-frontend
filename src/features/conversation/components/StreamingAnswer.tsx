/**
 * features/conversation/components/StreamingAnswer.tsx
 *
 * Renders one actively-streaming (or just-completed) assistant turn.
 * Per 04-nonfunctional-and-deployment.md "Loading, Empty, and Error States":
 * the streaming tokens ARE the loading state - no separate spinner needed
 * once tokens start; before the first token, a brief "Thinking..." marker
 * is reasonable. Per "Accessibility": do NOT announce every token via
 * aria-live (unusable noise for screen readers) - aria-live="polite" is
 * applied only once the turn is fully done, on the completed container.
 */
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ProSearchSteps } from "./ProSearchSteps";
import { SourceList } from "./SourceList";
import { FollowUpChips } from "./FollowUpChips";
import { renderAnswerWithCitations } from "./CitationBadge";
import type { StreamingTurnState, Source } from "../types";

interface StreamingAnswerProps {
  state: StreamingTurnState;
  onFollowUpSelect: (question: string) => void;
}

export function StreamingAnswer({ state, onFollowUpSelect }: StreamingAnswerProps) {
  const citationsBySourceId = useMemo(() => {
    const map = new Map<number, Source | undefined>();
    if (state.citations && state.sources) {
      const sourceById = new Map(state.sources.map((s) => [s.id, s]));
      for (const citation of state.citations) {
        map.set(citation.marker_index, sourceById.get(citation.source_id));
      }
    }
    return map;
  }, [state.citations, state.sources]);

  const hasStartedAnswering = state.answerText.length > 0;

  return (
    <div
      className="space-y-2"
      // Only mark the container as a live region once the turn is fully
      // complete - avoids announcing every individual token.
      aria-live={state.isDone ? "polite" : "off"}
    >
      {state.isProSearch && <ProSearchSteps steps={state.steps} isDone={state.isDone} />}

      {!hasStartedAnswering && !state.isDone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Thinking…
        </div>
      )}

      {hasStartedAnswering && (
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {renderAnswerWithCitations(state.answerText, citationsBySourceId)}
        </div>
      )}

      {state.sources && state.sources.length > 0 && <SourceList sources={state.sources} />}

      {state.isDone && state.followUps && state.followUps.length > 0 && (
        <FollowUpChips followUps={state.followUps} onSelect={onFollowUpSelect} />
      )}
    </div>
  );
}
