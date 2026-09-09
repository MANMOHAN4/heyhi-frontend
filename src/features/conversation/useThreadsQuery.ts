import { useQuery } from "@tanstack/react-query";

import { getThreads } from "@/features/conversation/api";
import { useAuthStore } from "@/features/auth/useAuthStore";

/**
 * Account-scoped thread history query.
 *
 * Backend contract:
 * - GET /threads is auth-required.
 * - Optional `q` searches across titles and turn content.
 * - Results are ordered most-recently-updated first.
 * - Backend has no pagination currently, so the full matching result set is
 *   intentionally cached under this query key.
 * - Guests must never call this endpoint: guest conversations have no
 *   persistent account history and are tracked only through session state.
 */
export function useThreadsQuery(searchTerm = "") {
  const accessToken = useAuthStore((state) => state.accessToken);
  const normalizedSearchTerm = searchTerm.trim();

  return useQuery({
    queryKey: ["threads", { q: normalizedSearchTerm }],
    queryFn: () => getThreads(normalizedSearchTerm || undefined),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
  });
}
