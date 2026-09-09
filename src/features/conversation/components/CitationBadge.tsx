/**
 * features/conversation/components/CitationBadge.tsx
 *
 * Per 03-pages-and-features.md §3: citation markers ([1], [2]) within the
 * streamed answer text render as small inline Badges; hovering shows source
 * title/domain/snippet. IMPORTANT: sources/citations arrive AFTER all
 * token events (see SSE Event Reference) - so markers render as PLAIN TEXT
 * during streaming and only become interactive badges once the `sources`
 * event lands. This is expected behavior, not a bug to "fix".
 */
import type { Source } from "../types";

interface CitationBadgeProps {
  markerIndex: number;
  source: Source | undefined; // undefined until sources/citations have arrived
}

export function CitationBadge({ markerIndex, source }: CitationBadgeProps) {
  if (!source) {
    // Streaming not yet complete for citations - render as plain text.
    return <span>[{markerIndex}]</span>;
  }

  return (
    <span className="group relative inline-block">
      <sup className="mx-0.5 cursor-help rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">
        {markerIndex}
      </sup>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-64 -translate-x-1/2 rounded-md border bg-popover p-2 text-xs opacity-0 shadow-md transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <p className="font-medium">{source.title}</p>
        <p className="text-muted-foreground">{source.domain}</p>
        <p className="mt-1 line-clamp-3 text-muted-foreground">{source.snippet}</p>
      </span>
    </span>
  );
}

/**
 * Renders answer_text with [n] markers replaced by CitationBadge components.
 * Splits on the literal "[n]" pattern - this is a simple, reliable approach
 * given the backend guarantees markers appear as plain "[1]", "[2]" etc.
 * inline within the streamed text (see 01-backend-reference.md "Turn").
 */
export function renderAnswerWithCitations(
  answerText: string,
  citationsBySourceId: Map<number, Source | undefined>
): React.ReactNode[] {
  const parts = answerText.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (!match) return <span key={i}>{part}</span>;
    const markerIndex = parseInt(match[1], 10);
    return (
      <CitationBadge key={i} markerIndex={markerIndex} source={citationsBySourceId.get(markerIndex)} />
    );
  });
}
