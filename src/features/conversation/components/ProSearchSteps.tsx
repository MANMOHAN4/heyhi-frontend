import { CheckCircle2, Search, Sparkles } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";

interface ProSearchStepsProps {
  steps: string[];
  isDone: boolean;
}

export function ProSearchSteps({ steps, isDone }: ProSearchStepsProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Pro Search activity"
      className="mb-4 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
    >
      {steps.map((step, index) => {
        const isCurrent = !isDone && index === steps.length - 1;

        return (
          <Marker
            key={`${index}-${step}`}
            role={isCurrent ? "status" : undefined}
            aria-live={isCurrent ? "polite" : undefined}
            variant={index === steps.length - 1 ? "default" : "border"}
            className="py-1.5 last:border-none last:pb-0"
          >
            <MarkerIcon>
              {isCurrent ? (
                <Spinner className="size-3.5" />
              ) : index === 0 ? (
                <Sparkles className="size-3.5 text-violet-400" />
              ) : (
                <CheckCircle2 className="size-3.5 text-emerald-400" />
              )}
            </MarkerIcon>
            <MarkerContent
              className={isCurrent ? "shimmer text-foreground" : undefined}
            >
              {step}
            </MarkerContent>
          </Marker>
        );
      })}

      {!isDone && steps.length === 0 && (
        <Marker role="status">
          <MarkerIcon>
            <Search className="size-3.5" />
          </MarkerIcon>
          <MarkerContent className="shimmer">
            Preparing research plan…
          </MarkerContent>
        </Marker>
      )}
    </section>
  );
}
