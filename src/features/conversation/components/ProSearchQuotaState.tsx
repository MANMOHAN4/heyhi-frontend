import { CalendarClock, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ProSearchQuotaStateProps = {
  /*
   * Backend error message from:
   * 429 PRO_SEARCH_QUOTA_EXCEEDED
   *
   * Example:
   * "You've used today's 2 Pro Searches. Try again tomorrow."
   *
   * BACKEND_API_REFERENCE.md P6: the limit is 2/day and is NOT plan-based
   * today - same for FREE, PRO, and ENTERPRISE. The backend owns the actual
   * configured number, so render this message rather than hardcoding a
   * quota value in the client, and don't imply upgrading raises it (it
   * currently doesn't - see the removed "View Pro plan" CTA below).
   */
  message?: string

  /*
   * Optional callback for switching the composer out of Pro Search mode
   * without leaving the current conversation.
   */
  onUseRegularSearch?: () => void
}

export function ProSearchQuotaState({
  message,
  onUseRegularSearch,
}: ProSearchQuotaStateProps) {
  const description =
    message ||
    "You've used today's Pro Searches. Your allowance resets tomorrow."

  return (
    <Card className="overflow-hidden border-violet-500/25 bg-violet-500/[0.06] shadow-[0_12px_32px_-24px_rgba(139,92,246,0.65)]">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
            <Sparkles className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">
                Today&apos;s Pro Search limit is reached
              </p>

              <Badge
                variant="secondary"
                className="rounded-md border border-violet-500/25 bg-violet-500/10 text-[10px] text-violet-700 dark:text-violet-300"
              >
                Pro Search
              </Badge>
            </div>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Resets tomorrow — same daily limit for every plan
            </div>
          </div>
        </div>

        {onUseRegularSearch && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseRegularSearch}
            >
              Use regular search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}