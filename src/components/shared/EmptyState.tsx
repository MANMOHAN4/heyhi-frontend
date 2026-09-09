import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  message?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/*
 * Shared empty-state wrapper used by threads, Spaces, invoices,
 * moderation queue, collaborators, and file lists.
 *
 * `message` is kept as an alias for `description` so both existing
 * usage styles compile:
 *
 * <EmptyState message="No invoices yet." />
 *
 * <EmptyState
 *   title="No invoices yet"
 *   description="Your completed payment records will appear here."
 * />
 */
export function EmptyState({
  title,
  message,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const body = description ?? message;
  const resolvedTitle = title ?? body ?? "Nothing here yet";

  return (
    <div
      className={cn(
        "flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-5" />}
      </div>

      <h3 className="mt-3 text-sm font-medium text-foreground">
        {resolvedTitle}
      </h3>

      {body && body !== resolvedTitle && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
