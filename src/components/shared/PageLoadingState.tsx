import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingVariant = "page" | "list" | "table" | "conversation";

interface PageLoadingStateProps {
  variant?: LoadingVariant;
  count?: number;
  className?: string;
}

export function PageLoadingState({
  variant = "page",
  count = 4,
  className,
}: PageLoadingStateProps) {
  if (variant === "conversation") {
    return (
      <div
        className={cn(
          "mx-auto w-full max-w-4xl space-y-8 p-4 sm:p-6",
          className,
        )}
      >
        <div className="ml-auto max-w-[60%]">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        <div className="max-w-[85%] space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[76%]" />
        </div>

        <div className="ml-auto max-w-[45%]">
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>

        <div className="max-w-[80%] space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[88%]" />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={cn("overflow-hidden rounded-xl border bg-card", className)}
      >
        <div className="border-b p-4">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="space-y-0">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b p-4 last:border-b-0"
            >
              <Skeleton className="h-4 flex-[2]" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border bg-card p-3"
          >
            <Skeleton className="size-8 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
