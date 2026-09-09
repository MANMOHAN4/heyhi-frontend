/**
 * features/conversation/components/ProSearchQuotaState.tsx
 *
 * Per 02-api-reference.md "POST /threads/pro-search" and
 * 03-pages-and-features.md §3 "429 quota": exceeding the daily Pro Search
 * quota returns 429 PRO_SEARCH_QUOTA_EXCEEDED BEFORE any streaming begins.
 * This is a normal, expected state for active users, not an exceptional
 * failure - render a distinct, friendly inline state, NOT a generic toast,
 * with a clear visual difference from the normal composer/streaming UI.
 */
import { Sparkles } from "lucide-react";

interface ProSearchQuotaStateProps {
  message: string;
}

export function ProSearchQuotaState({ message }: ProSearchQuotaStateProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/40">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
      <div>
        <p className="font-medium text-violet-900 dark:text-violet-200">
          You've used today's Pro Searches
        </p>
        <p className="text-violet-700 dark:text-violet-300">{message}</p>
      </div>
    </div>
  );
}
