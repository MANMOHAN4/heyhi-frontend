import { useQuery } from "@tanstack/react-query";

import { getSharedThread } from "@/features/sharing/api";

/*
 * Shared conversations are public and read-only.
 *
 * `retry: false` is intentional:
 * - A valid but temporarily unavailable request still gets the standard
 *   retry-capable PageErrorState in the route.
 * - A revoked/missing link is a real terminal 404 state, so it should not
 *   be repeatedly retried by React Query before the clear unavailable page
 *   can be shown.
 */
export function useSharedThreadQuery(token?: string) {
  return useQuery({
    queryKey: ["shared-thread", token],
    queryFn: () => getSharedThread(token!),
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
}
