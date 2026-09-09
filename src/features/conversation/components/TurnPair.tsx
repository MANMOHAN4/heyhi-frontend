/**
 * features/conversation/components/TurnPair.tsx
 *
 * Renders one COMPLETED, persisted turn (from thread.turns, already fully
 * resolved - not actively streaming). Per 03-pages-and-features.md §3:
 * user's query_text as a right-aligned Bubble, assistant's answer as a
 * left-aligned Message, with sources/follow_ups below.
 *
 * NOTE: replace the plain divs below with shadcn's actual `Bubble` /
 * `Message` primitives (`npx shadcn@latest add message bubble`) once
 * installed - structure/props here are written to be a drop-in swap.
 */
import { useMemo } from "react";
import { SourceList } from "./SourceList";
import { FollowUpChips } from "./FollowUpChips";
import { renderAnswerWithCitations } from "./CitationBadge";
import type { Turn, Source } from "../types";

interface TurnPairProps {
  turn: Turn;
  onFollowUpSelect: (question: string) => void;
  isLatest: boolean;
}

export function TurnPair({ turn, onFollowUpSelect, isLatest }: TurnPairProps) {
  const citationsBySourceId = useMemo(() => {
    const map = new Map<number, Source | undefined>();
    const sourceById = new Map(turn.sources.map((s) => [s.id, s]));
    for (const citation of turn.citations) {
      map.set(citation.marker_index, sourceById.get(citation.source_id));
    }
    return map;
  }, [turn.sources, turn.citations]);

  return (
    <div className="space-y-3 py-4">
      {/* User query - right-aligned bubble */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
          {turn.query_text}
        </div>
      </div>

      {/* Assistant answer - left-aligned message */}
      <div className="max-w-[85%] space-y-2">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {renderAnswerWithCitations(turn.answer_text, citationsBySourceId)}
        </div>
        <SourceList sources={turn.sources} />
        {isLatest && turn.follow_ups.length > 0 && (
          <FollowUpChips followUps={turn.follow_ups} onSelect={onFollowUpSelect} />
        )}
      </div>
    </div>
  );
}
