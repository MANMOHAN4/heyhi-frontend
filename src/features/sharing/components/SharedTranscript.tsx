import { useMemo } from "react";
import {
  BookOpenText,
  CalendarDays,
  FileText,
  MessageSquareText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  AnswerWithCitations,
  buildCitationSourceMap,
} from "@/features/conversation/components/CitationBadge";
import { SourceList } from "@/features/conversation/components/SourceList";
import type { SharedThread } from "@/features/sharing/types";

type SharedTranscriptProps = {
  thread: SharedThread;
};

export function SharedTranscript({ thread }: SharedTranscriptProps) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-4 border-b border-border/70 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpenText className="size-4" />
          </div>

          <Badge variant="secondary" className="rounded-md">
            Shared conversation
          </Badge>
        </div>

        <div>
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {thread.title}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A read-only, citation-grounded conversation shared from heyHi.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {thread.turns.map((turn, index) => (
          <SharedTurn
            key={`${turn.created_at}-${index}`}
            turn={turn}
            turnNumber={index + 1}
          />
        ))}
      </div>

      <footer className="border-t border-border/70 pt-6">
        <p className="text-center text-xs text-muted-foreground">
          Shared from heyHi · Citation-grounded answers
        </p>
      </footer>
    </article>
  );
}

type SharedTurnProps = {
  turn: SharedThread["turns"][number];
  turnNumber: number;
};

function SharedTurn({ turn, turnNumber }: SharedTurnProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(turn.created_at);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }, [turn.created_at]);

  const citationSourceMap = useMemo(
    () => buildCitationSourceMap(turn.citations, turn.sources),
    [turn.citations, turn.sources],
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-md text-[10px]">
          Turn {turnNumber}
        </Badge>

        {formattedDate && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formattedDate}
          </span>
        )}
      </div>

      <Card className="border-border/80 bg-card/80">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquareText className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Question
              </p>

              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
                {turn.query_text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pl-0 sm:pl-11">
        <div className="rounded-xl border border-border/70 bg-background/35 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <BookOpenText className="size-3.5" />
            </div>

            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Answer
            </p>
          </div>

          <AnswerWithCitations
            answerText={turn.answer_text}
            citations={turn.citations}
            sources={turn.sources}
            className="text-sm text-foreground"
          />

          <SourceList sources={turn.sources} />
        </div>
      </div>

      {turn.sources.length === 0 && (
        <SharedSourceSummary
          turnNumber={turnNumber}
          citationSourceMap={citationSourceMap}
        />
      )}

      <Separator className="mt-8" />
    </section>
  );
}

/*
 * This is intentionally conservative:
 *
 * - Writing/Math modes can legitimately have no sources.
 * - A stream may also complete gracefully with an answer but no sources.
 * - Therefore, do not treat `sources.length === 0` as an error.
 *
 * The component is only a light reading-context cue on public pages.
 */
function SharedSourceSummary({
  turnNumber,
  citationSourceMap,
}: {
  turnNumber: number;
  citationSourceMap: Map<number, unknown>;
}) {
  const citationCount = citationSourceMap.size;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
      <FileText className="mt-0.5 size-3.5 shrink-0" />

      <p>
        {citationCount > 0
          ? `Turn ${turnNumber} includes ${citationCount} citation marker${
              citationCount === 1 ? "" : "s"
            }, but source metadata is unavailable.`
          : "No sources were attached to this answer."}
      </p>
    </div>
  );
}
