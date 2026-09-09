/**
 * features/conversation/components/ProSearchSteps.tsx
 *
 * Per 02-api-reference.md "SSE Event Reference - Pro Search adds `event:
 * step` frames": a genuinely valuable live view of the agent's reasoning
 * (planning -> per-sub-question search steps -> optional reflection step ->
 * synthesizing), not just a loading spinner.
 *
 * Per 03-pages-and-features.md §3: use shadcn's Marker component with
 * role="status" (accessible live-region semantics built in - see
 * 04-nonfunctional-and-deployment.md "Accessibility"). Once `done` fires,
 * collapse the step list into a "show reasoning steps" disclosure so focus
 * shifts to the final answer rather than leaving it permanently expanded.
 *
 * NOTE: replace the plain <ul>/<li role="status"> below with the actual
 * shadcn `Marker` primitive (`npx shadcn@latest add marker`) once installed -
 * this is a structural placeholder that preserves the correct ARIA pattern
 * (role="status", implying aria-live="polite") until that component exists
 * in components/ui/.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface ProSearchStepsProps {
  steps: string[];
  isDone: boolean;
}

export function ProSearchSteps({ steps, isDone }: ProSearchStepsProps) {
  const [expanded, setExpanded] = useState(true);

  if (steps.length === 0) return null;

  if (isDone) {
    return (
      <div className="mb-2 rounded-md border bg-muted/30">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          Show reasoning steps ({steps.length})
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {expanded && (
          <ul className="space-y-1 px-3 pb-2">
            {steps.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {step}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Actively streaming: always expanded, live status region.
  return (
    <ul role="status" aria-live="polite" className="mb-2 space-y-1 rounded-md border bg-muted/30 px-3 py-2">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isLast && <Loader2 className="h-3 w-3 shrink-0 animate-spin" />}
            {step}
          </li>
        );
      })}
    </ul>
  );
}
