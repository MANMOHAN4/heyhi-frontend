/**
 * components/shared/EmptyState.tsx
 * Thin wrapper matching shadcn's `Empty` component usage pattern (short
 * message + optional CTA), used consistently across every empty list per
 * 04-nonfunctional-and-deployment.md "Loading, Empty, and Error States".
 *
 * NOTE: swap for shadcn's real `Empty` primitive (`npx shadcn@latest add
 * empty`) once installed.
 */
interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-4 text-center text-xs text-muted-foreground">
      <p>{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md border px-3 py-1 font-medium hover:bg-accent"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
