import { Sparkles } from "lucide-react";
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
    <div className="space-y-6">
      <Bubble align="end" variant="default" className="ml-auto">
        {/*
         * A slightly richer surface than the flat `bg-primary` default -
         * a subtle shadow and crisper corners so the user's own message
         * reads as a distinct, raised element against the page background
         * rather than blending into the same flat tone as everything else.
         */}
        <BubbleContent className="rounded-2xl px-4 py-2.5 text-[15px] leading-6 shadow-sm">
          {turn.query_text}
        </BubbleContent>
      </Bubble>

      <Message align="start" className="w-full">
        <MessageHeader className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/60 text-primary-foreground shadow-sm">
            <Sparkles className="size-3.5" />
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
