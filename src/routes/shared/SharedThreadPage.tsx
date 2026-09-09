import { Link, useParams } from "react-router-dom";
import { Link2Off, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PageErrorState } from "@/components/shared/PageErrorState";
import { ApiError } from "@/lib/apiError";
import { SharedTranscript } from "@/features/sharing/components/SharedTranscript";
import { useSharedThreadQuery } from "@/features/sharing/useSharedThreadQuery";

export default function SharedThreadPage() {
  const { token } = useParams<{ token: string }>();
  const sharedThreadQuery = useSharedThreadQuery(token);

  if (sharedThreadQuery.isLoading) {
    return <SharedThreadSkeleton />;
  }

  const error = sharedThreadQuery.error;

  if (
    error instanceof ApiError &&
    (error.code === "SHARE_LINK_NOT_FOUND" || error.status === 404)
  ) {
    return <SharedLinkUnavailable />;
  }

  if (sharedThreadQuery.isError || !sharedThreadQuery.data) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16">
        <PageErrorState
          message="Couldn't load this shared conversation."
          onRetry={() => sharedThreadQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>
            heyHi
          </Link>

          <Button variant="outline" size="sm" render={<Link to="/signup" />}>
            Try heyHi
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <SharedTranscript thread={sharedThreadQuery.data} />
      </main>
    </div>
  );
}

function SharedLinkUnavailable() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/80 bg-card/80">
        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Link2Off className="size-5 text-muted-foreground" />
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight">
            This shared link is no longer available
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            It may have been revoked by its owner, or it may not exist.
          </p>

          <Button className="mt-6" render={<Link to="/" />}>
            Go to heyHi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SharedThreadSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-3 border-b border-border/70 pb-6">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
        </div>

        {[0, 1].map((index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-3 sm:pl-11">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[94%]" />
              <Skeleton className="h-4 w-[75%]" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
