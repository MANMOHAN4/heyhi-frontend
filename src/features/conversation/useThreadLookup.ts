import { useEffect, useMemo } from "react";

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
   * Not found in the pages of the account's thread list fetched so far.
   * Either it belongs to someone else, it was deleted, it's a guest thread
   * from this browser's sessionStorage rather than an owned thread at all,
   * or - since GET /threads is cursor-paginated - it's simply an older
   * thread that hasn't been paged in yet (see the loop below).
   */
  | "not-found";

/*
 * Backend gap workaround (see conversation/api.ts):
 * there is no GET /threads/{threadId} endpoint, so there is no way to fetch
 * a single thread's full turn history directly. GET /threads (the list
 * endpoint) is the only source of truth for "does this thread exist and is
 * it mine" - it returns {id, title, updated_at} (paginated) but never
 * `turns`.
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

  /*
   * GET /threads is cursor-paginated (20/page by default). A thread the
   * person is navigating straight to (sidebar click, bookmark, browser
   * back/forward) might be older than whatever page(s) have been fetched
   * so far, especially right after login before any "Load more" has run.
   * Page in further, up to a small bound, before concluding "not-found" -
   * without this, an account with >20 threads would wrongly show "this
   * conversation doesn't exist" for anything past the first page.
   */
  const MAX_LOOKUP_PAGES = 5;

  useEffect(() => {
    if (
      !threadId ||
      !accessToken ||
      threadsQuery.isLoading ||
      threadsQuery.isFetchingNextPage ||
      !threadsQuery.hasNextPage
    ) {
      return;
    }

    const alreadyFound = threadsQuery.threads.some(
      (thread) => thread.id === threadId,
    );

    if (alreadyFound) {
      return;
    }

    if (threadsQuery.pages.length >= MAX_LOOKUP_PAGES) {
      return;
    }

    void threadsQuery.fetchNextPage();
  }, [accessToken, threadId, threadsQuery]);

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

    const match = threadsQuery.threads.find(
      (thread) => thread.id === threadId,
    );

    if (match) {
      return { status: "found" as ThreadLookupStatus, title: match.title };
    }

    // Still paging in more results looking for it - keep showing "loading"
    // rather than a premature "not-found" that would immediately flip once
    // the next page lands.
    if (
      threadsQuery.isFetchingNextPage ||
      (threadsQuery.hasNextPage &&
        threadsQuery.pages.length < MAX_LOOKUP_PAGES)
    ) {
      return { status: "loading" as ThreadLookupStatus, title: null };
    }

    return { status: "not-found" as ThreadLookupStatus, title: null };
  }, [accessToken, threadId, threadsQuery]);
}
