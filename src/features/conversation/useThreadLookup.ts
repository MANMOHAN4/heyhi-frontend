import { useMemo } from "react";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { useThreadsQuery } from "@/features/conversation/useThreadsQuery";

export type ThreadLookupStatus =
  /** No threadId in the route at all - this is the "new conversation" screen. */
  | "new"
  /** Logged out, or the thread list hasn't resolved this ID yet - can't tell. */
  | "unknown"
  /** Still waiting on GET /threads. */
  | "loading"
  /** Found in the account's thread list - a real, existing thread. */
  | "found"
  /**
   * Not in the account's thread list. Either it belongs to someone else, it
   * was deleted, or (for a logged-out visitor) it's a guest thread from this
   * browser's sessionStorage rather than an owned thread at all.
   */
  | "not-found";

/*
 * Backend gap workaround (see conversation/api.ts):
 * there is no GET /threads/{threadId} endpoint, so there is no way to fetch
 * a single thread's full turn history directly. GET /threads (the list
 * endpoint) is the only source of truth for "does this thread exist and is
 * it mine" - it returns {id, title, updated_at} but never `turns`.
 *
 * This hook uses that list to answer the narrower, actually-answerable
 * question of whether routeThreadId is a real, owned thread, and to recover
 * its title. It cannot recover past turns - ThreadPage is responsible for
 * telling the person that plainly rather than presenting a real, existing
 * thread as if it were silently empty.
 */
export function useThreadLookup(threadId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const threadsQuery = useThreadsQuery();

  return useMemo(() => {
    if (!threadId) {
      return { status: "new" as ThreadLookupStatus, title: null };
    }

    if (!accessToken) {
      // Could be a guest thread continued via sessionStorage - not
      // resolvable against an account list, and that's fine.
      return { status: "unknown" as ThreadLookupStatus, title: null };
    }

    if (threadsQuery.isLoading) {
      return { status: "loading" as ThreadLookupStatus, title: null };
    }

    if (threadsQuery.isError) {
      return { status: "unknown" as ThreadLookupStatus, title: null };
    }

    const match = threadsQuery.data?.find((thread) => thread.id === threadId);

    if (!match) {
      return { status: "not-found" as ThreadLookupStatus, title: null };
    }

    return { status: "found" as ThreadLookupStatus, title: match.title };
  }, [
    accessToken,
    threadId,
    threadsQuery.data,
    threadsQuery.isError,
    threadsQuery.isLoading,
  ]);
}
