/**
 * features/sharing/components/SharedTranscript.tsx
 *
 * Per 02-api-reference.md "GET /shared/{token}": the shape is deliberately
 * minimal - title + turns, each with query_text/answer_text/sources/
 * citations/created_at only. NO owner_id, focus_mode, model, or follow_ups
 * (see 01-backend-reference.md "Thread" note). Do not render follow-up
 * chips or any composer here - this reuses only the citation-rendering
 * logic from the conversation feature, not its interactive machinery.
 */
import { useMemo } from "react";
import { renderAnswerWithCitations } from "../../conversation/components/CitationBadge";
import { SourceList } from "../../conversation/components/SourceList";
import type { SharedThreadResponse, Source } from "../../conversation/types";

interface SharedTranscriptProps {
  thread: SharedThreadResponse;
}

export function SharedTranscript({ thread }: SharedTranscriptProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{thread.title}</h1>
        <p className="text-xs text-muted-foreground">
          Shared, read-only conversation
        </p>
      </div>

      {thread.turns.map((turn, i) => (
        <SharedTurn key={i} turn={turn} />
      ))}
    </div>
  );
}

function SharedTurn({ turn }: { turn: SharedThreadResponse["turns"][number] }) {
  const citationsBySourceId = useMemo(() => {
    const map = new Map<number, Source | undefined>();
    const sourceById = new Map(turn.sources.map((s) => [s.id, s]));
    for (const citation of turn.citations) {
      map.set(citation.marker_index, sourceById.get(citation.source_id));
    }
    return map;
  }, [turn.sources, turn.citations]);

  return (
    <div className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0">
      <p className="text-sm font-medium">{turn.query_text}</p>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {renderAnswerWithCitations(turn.answer_text, citationsBySourceId)}
      </div>
      <SourceList sources={turn.sources} />
    </div>
  );
}
