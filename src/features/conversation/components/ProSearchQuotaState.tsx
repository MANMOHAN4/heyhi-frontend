import { CalendarClock, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ProSearchQuotaStateProps = {
  /*
   * Backend error message from:
   * 429 PRO_SEARCH_QUOTA_EXCEEDED
   *
   * Example:
   * "Daily Pro Search limit of 10 reached. Try again tomorrow."
   *
   * The backend owns the actual configured daily number, so render this
   * message rather than hardcoding a quota value in the client.
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
    "You have used all available Pro Searches for today. Your allowance resets tomorrow."

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
              Resets tomorrow
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {onUseRegularSearch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseRegularSearch}
            >
              Use regular search
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
            render={<Link to="/settings/billing" />}
          >
            View Pro plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}