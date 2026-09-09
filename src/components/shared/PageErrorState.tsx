import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function PageErrorState({
  title = "Unable to load this section",
  message,
  onRetry,
  className,
}: PageErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center",
        className,
      )}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>

      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </section>
  );
}
