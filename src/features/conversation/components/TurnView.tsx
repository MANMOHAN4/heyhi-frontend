import { useMemo } from "react";
import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { SourceList } from "./SourceList";
import { FollowUpChips } from "./FollowUpChips";
import type { Source, Turn } from "../types";

interface TurnViewProps {
  turn: Turn;
  isLatest: boolean;
  onFollowUpSelect: (query: string) => void;
}

function CompletedAnswer({ turn }: { turn: Turn }) {
  const citationSources = useMemo(() => {
    const result = new Map<number, Source | undefined>();
    const sourcesById = new Map(
      turn.sources.map((source) => [source.id, source]),
    );

    for (const citation of turn.citations) {
      result.set(citation.marker_index, sourcesById.get(citation.source_id));
    }

    return result;
  }, [turn.citations, turn.sources]);

  const parts = turn.answer_text.split(/(\[\d+\])/g);

  return (
    <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
      {parts.map((part, index) => {
        const match = /^\[(\d+)\]$/.exec(part);

        if (!match) return <span key={index}>{part}</span>;

        const marker = Number(match[1]);
        const source = citationSources.get(marker);

        return source ? (
          <Badge
            key={index}
            variant="secondary"
            className="mx-0.5 inline-flex h-5 cursor-default rounded-md px-1.5 align-baseline text-[10px]"
            title={`${source.title} — ${source.domain}`}
          >
            {marker}
          </Badge>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </p>
  );
}

export function TurnView({ turn, isLatest, onFollowUpSelect }: TurnViewProps) {
  return (
    <div className="space-y-5">
      <Bubble align="end" variant="default" className="ml-auto">
        <BubbleContent className="rounded-2xl px-4 py-2.5 text-[15px] leading-6">
          {turn.query_text}
        </BubbleContent>
      </Bubble>

      <Message align="start" className="w-full">
        <MessageHeader className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex size-5 items-center justify-center rounded-md border border-border bg-card">
            <Bot className="size-3" />
          </span>
          heyHi
        </MessageHeader>
        <MessageContent className="w-full max-w-none">
          <CompletedAnswer turn={turn} />
          <SourceList sources={turn.sources} />
          {isLatest && turn.follow_ups.length > 0 && (
            <FollowUpChips
              followUps={turn.follow_ups}
              onSelect={onFollowUpSelect}
            />
          )}
        </MessageContent>
      </Message>
    </div>
  );
}
