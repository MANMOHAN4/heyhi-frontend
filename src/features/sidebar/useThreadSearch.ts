import { useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { useThreadsQuery } from "@/features/conversation/useThreadsQuery";

export function useThreadSearch(delay = 300) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedQuery = useDebounce(searchInput.trim(), delay);

  const threadsQuery = useThreadsQuery(debouncedQuery);

  return {
    searchInput,
    setSearchInput,
    debouncedQuery,
    threads: threadsQuery.threads,
    isLoading: threadsQuery.isLoading,
    isFetching: threadsQuery.isFetching,
    isError: threadsQuery.isError,
    error: threadsQuery.error,
    refetch: threadsQuery.refetch,
    hasMore: Boolean(threadsQuery.hasNextPage),
    isLoadingMore: threadsQuery.isFetchingNextPage,
    loadMore: threadsQuery.fetchNextPage,
  };
}
