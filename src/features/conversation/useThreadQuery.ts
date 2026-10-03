import { useQuery } from "@tanstack/react-query";

import { getThread } from "@/features/conversation/api";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { ApiError } from "@/lib/apiError";

/*
 * Fetches a single owned thread WITH its full turn history (GET /threads/{id}).
 *
 * Enabled only for authenticated users: guest conversations are session-only
 * and have no server-side history to fetch. A 404 (the thread is missing OR
 * owned by someone else - the backend intentionally doesn't distinguish, to
 * avoid leaking thread existence across accounts) is terminal, so it is not
 * retried; transient failures retry once.
 */
export function useThreadQuery(threadId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getThread(threadId!),
    enabled: Boolean(threadId) && Boolean(accessToken),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
