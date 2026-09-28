import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getThreads } from "@/features/conversation/api";
import { useAuthStore } from "@/features/auth/useAuthStore";

const THREADS_PAGE_SIZE = 20;

/**
 * Account-scoped thread history query.
 *
 * Backend contract (BACKEND_API_REFERENCE.md §3c, §8.2):
 * - GET /threads is auth-required and cursor-paginated:
 *   { items: ThreadSummaryResponse[], next_cursor: string | null }.
 * - Optional `q` searches across titles and turn content.
 * - Results are always ordered most-recently-updated first (not
 *   client-configurable).
 * - Guests must never call this endpoint: guest conversations have no
 *   persistent account history and are tracked only through session state.
 *
 * Exposes a flattened `threads` array plus infinite-scroll controls
 * (fetchNextPage/hasNextPage) rather than page objects, since almost every
 * consumer just wants "the list so far" - callers that need raw pages can
 * use `pages` directly.
 */
export function useThreadsQuery(searchTerm = "") {
  const accessToken = useAuthStore((state) => state.accessToken);
  const normalizedSearchTerm = searchTerm.trim();

  const query = useInfiniteQuery({
    queryKey: ["threads", { q: normalizedSearchTerm }],
    queryFn: ({ pageParam }) =>
      getThreads({
        query: normalizedSearchTerm || undefined,
        after: pageParam ?? undefined,
        size: THREADS_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const threads = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    ...query,
    threads,
    pages: query.data?.pages ?? [],
  };
}
