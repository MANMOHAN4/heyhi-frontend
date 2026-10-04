import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
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
         * The default variant is a flat bg-primary fill, which in this
         * theme is a plain near-white pill with no depth. A subtle
         * top-to-bottom gradient, a faint light border (reads as a highlight
         * on a dark page, the way a lightly raised physical surface would),
         * and a real elevation shadow give it the kind of soft, tactile
         * presence Claude/ChatGPT's own user bubble has, instead of a flat
         * pasted-on fill.
         */}
        <BubbleContent
          className="rounded-2xl border !border-white/15 bg-gradient-to-b !from-white !to-white/90 px-4 py-2.5 text-[15px] leading-6 text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_20px_-8px_rgba(0,0,0,0.5)]"
        >
          {turn.query_text}
        </BubbleContent>
      </Bubble>

      {/*
       * TurnView renders only COMPLETED turns (see ThreadTranscript /
       * StreamingAnswer - a turn still in flight is a different
       * component). The "heyHi" / assistant-avatar header is intentionally
       * not shown here: it's a "generating a response" indicator, and once
       * the answer has fully rendered there's no more use for it - the
       * indentation/left-alignment of the answer block itself is what
       * distinguishes it from the user's bubble above.
       */}
      <Message align="start" className="w-full">
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
