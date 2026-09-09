/**
 * components/shared/PageErrorState.tsx
 * Per 04-nonfunctional-and-deployment.md "Loading, Empty, and Error States":
 * a retry-capable error state for page-level fetches - NOT just a toast.
 * Toasts are reserved for action failures (rename/invite failed), not
 * initial page-data-load failures.
 */
import { AlertTriangle, RotateCw } from "lucide-react";

interface PageErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function PageErrorState({ message, onRetry }: PageErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center text-sm">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <p className="text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
      >
        <RotateCw className="h-3 w-3" /> Retry
      </button>
    </div>
  );
}
