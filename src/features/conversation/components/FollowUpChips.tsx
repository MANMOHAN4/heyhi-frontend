import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type FollowUpChipsProps = {
  followUps: string[]
  onSelect: (question: string) => void
  disabled?: boolean
}

export function FollowUpChips({ followUps, onSelect, disabled = false }: FollowUpChipsProps) {
  if (followUps.length === 0) {
    return null
  }

  return (
    <section aria-label="Suggested follow-up questions" className="pt-1">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Continue exploring</p>
      <div className="flex flex-wrap gap-2">
        {followUps.map((question, index) => (
          <Button
            key={`${question}-${index}`}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="h-auto max-w-full justify-start rounded-full px-3 py-1.5 text-left text-xs font-normal whitespace-normal hover:border-primary/40 hover:bg-accent"
          >
            <span className="line-clamp-2">{question}</span>
            <ArrowUpRight className="ml-1 size-3 shrink-0 text-muted-foreground" />
          </Button>
        ))}
      </div>
    </section>
  )
}
