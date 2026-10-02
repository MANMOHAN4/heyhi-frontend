import { Bot } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { AnswerWithCitations } from "./CitationBadge";
import { SourceList } from "./SourceList";
import { FollowUpChips } from "./FollowUpChips";
import type { Turn } from "../types";

interface TurnViewProps {
  turn: Turn;
  isLatest: boolean;
  onFollowUpSelect: (query: string) => void;
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
          <AnswerWithCitations
            answerText={turn.answer_text}
            citations={turn.citations}
            sources={turn.sources}
            className="text-[15px] text-foreground"
          />
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
