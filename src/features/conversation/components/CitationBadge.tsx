import * as React from "react";
import { ExternalLink, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Citation, Source } from "@/features/conversation/types";

type CitationBadgeProps = {
  markerIndex: number;
  source?: Source;
  className?: string;
};

export function CitationBadge({
  markerIndex,
  source,
  className,
}: CitationBadgeProps) {
  if (!source) {
    return <span className="text-muted-foreground">[{markerIndex}]</span>;
  }

  const isFileSource = source.url.startsWith("file://");

  const trigger = isFileSource ? (
    <button
      type="button"
      aria-label={`Citation ${markerIndex}: ${source.title}`}
      className="inline-flex align-baseline"
    >
      <Badge
        variant="secondary"
        className={`mx-0.5 inline-flex h-5 cursor-help items-center rounded-md px-1.5 text-[11px] font-medium leading-none hover:bg-accent ${
          className ?? ""
        }`}
      >
        {markerIndex}
      </Badge>
    </button>
  ) : (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open citation ${markerIndex}: ${source.title}`}
      className="inline-flex align-baseline"
    >
      <Badge
        variant="secondary"
        className={`mx-0.5 inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium leading-none transition-colors hover:bg-accent ${
          className ?? ""
        }`}
      >
        {markerIndex}
      </Badge>
    </a>
  );

  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />

      <HoverCardContent align="start" side="top" className="w-80 space-y-2 p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
            {isFileSource ? (
              <FileText className="size-3.5 text-muted-foreground" />
            ) : (
              <ExternalLink className="size-3.5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium leading-snug">
              {source.title}
            </p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {isFileSource ? "From an uploaded document" : source.domain}
            </p>
          </div>
        </div>

        {source.snippet && (
          <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
            {source.snippet}
          </p>
        )}

        {!isFileSource && (
          <p className="truncate text-xs text-primary underline underline-offset-4">
            {source.url}
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export function buildCitationSourceMap(
  citations: Citation[] | null | undefined,
  sources: Source[] | null | undefined,
): Map<number, Source | undefined> {
  const map = new Map<number, Source | undefined>();

  if (!citations || !sources) {
    return map;
  }

  const sourceById = new Map(sources.map((source) => [source.id, source]));

  for (const citation of citations) {
    map.set(citation.marker_index, sourceById.get(citation.source_id));
  }

  return map;
}

type AnswerWithCitationsProps = {
  answerText: string;
  citations?: Citation[] | null;
  sources?: Source[] | null;
  className?: string;
};

export function AnswerWithCitations({
  answerText,
  citations,
  sources,
  className,
}: AnswerWithCitationsProps) {
  const citationSourceMap = React.useMemo(
    () => buildCitationSourceMap(citations, sources),
    [citations, sources],
  );

  const content = React.useMemo(() => {
    return answerText.split(/(\[\d+\])/g).map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);

      if (!match) {
        return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      }

      const markerIndex = Number(match[1]);

      return (
        <CitationBadge
          key={`${markerIndex}-${index}`}
          markerIndex={markerIndex}
          source={citationSourceMap.get(markerIndex)}
        />
      );
    });
  }, [answerText, citationSourceMap]);

  return (
    <div
      className={`whitespace-pre-wrap break-words leading-7 ${className ?? ""}`}
    >
      {content}
    </div>
  );
}
