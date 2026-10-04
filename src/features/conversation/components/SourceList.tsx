import { ExternalLink, FileText, Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import type { Source } from "@/features/conversation/types";

type SourceListProps = {
  sources: Source[];
};

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section aria-label="Sources" className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground">Sources</p>

        <Badge
          variant="secondary"
          className="h-5 rounded-md px-1.5 text-[10px]"
        >
          {sources.length}
        </Badge>
      </div>

      {/*
       * The card row scrolls horizontally past the visible width whenever
       * there are more than ~3 sources. Without a visual cue, a row cut off
       * mid-card at the container edge reads as a layout bug rather than an
       * intentional carousel - the fade masks make "there's more, scroll"
       * obvious the way Perplexity's own source row does.
       */}
      <div className="relative -mx-1">
        <div className="flex min-w-0 gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
          {sources.map((source, index) => (
            <SourceCard key={source.id} source={source} index={index} />
          ))}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
        />
      </div>
    </section>
  );
}

type SourceCardProps = {
  source: Source;
  index: number;
};

function SourceCard({ source, index }: SourceCardProps) {
  const isFileSource = source.url.startsWith("file://");

  const domain = isFileSource ? "Uploaded document" : source.domain;

  const card = (
    <Card className="w-64 shrink-0 border-border/70 bg-card transition-colors hover:bg-accent/45">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
            {isFileSource ? (
              <FileText className="size-3.5 text-muted-foreground" />
            ) : (
              <Globe2 className="size-3.5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-xs font-medium leading-snug">
              {source.title}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {domain}
            </p>
          </div>

          <Badge
            variant="outline"
            className="h-5 shrink-0 rounded-md px-1.5 text-[10px]"
          >
            {index + 1}
          </Badge>
        </div>

        {source.snippet && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {source.snippet}
          </p>
        )}
      </CardContent>
    </Card>
  );

  /*
   * File sources use file:// URLs and must not be opened by the browser.
   * Web sources remain normal external links.
   */
  const trigger = isFileSource ? (
    <div className="block">{card}</div>
  ) : (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open source: ${source.title}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </a>
  );

  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />

      <HoverCardContent side="top" align="start" className="w-80 space-y-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium leading-snug">{source.title}</p>

            <p className="mt-1 text-xs text-muted-foreground">{domain}</p>
          </div>

          {isFileSource ? (
            <FileText className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
          )}
        </div>

        {source.snippet && (
          <p className="text-xs leading-relaxed text-muted-foreground">
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
