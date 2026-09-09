/**
 * routes/shared/SharedThreadPage.tsx (default export - matches router.tsx's
 * lazy(() => import("./shared/SharedThreadPage")) expectation)
 *
 * Per 03-pages-and-features.md §5: entirely separate from the authenticated
 * app shell (already true here - it's mounted under PublicLayout, not
 * AppShellLayout, in router.tsx). 404 SHARE_LINK_NOT_FOUND -> a clear "this
 * shared link is no longer available" page, NOT a generic 404.
 *
 * Uses a plain useQuery here rather than a dedicated hook file, since this
 * is the only consumer of getSharedThread() and it's a single, simple,
 * page-scoped fetch - no reuse benefit from extracting a hook.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getSharedThread } from "../../src/features/sharing/api";
import { SharedTranscript } from "../../src/features/sharing/components/SharedTranscript";
import { ApiError } from "../../../lib/apiError";
import { PageErrorState } from "../../components/shared/PageErrorState";

export default function SharedThreadPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["shared-thread", token],
    queryFn: () => getSharedThread(token!),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const isRevokedOrMissing =
    error instanceof ApiError && error.code === "SHARE_LINK_NOT_FOUND";

  if (isRevokedOrMissing) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-lg font-semibold">
          This shared link is no longer available
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may have been revoked by its owner, or never existed.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <PageErrorState
        message="Couldn't load this shared conversation."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) return null;

  return <SharedTranscript thread={data} />;
}
