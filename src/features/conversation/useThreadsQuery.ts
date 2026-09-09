/**
 * features/conversation/useThreadsQuery.ts
 * GET /threads?q= - auth required, most-recently-updated first, no
 * pagination on the backend (flagged gap - fine at small scale).
 */
import { useQuery } from "@tanstack/react-query";
import { getThreads } from "./api";
import { useAuthStore } from "../auth/useAuthStore";

export function useThreadsQuery(searchTerm: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["threads", searchTerm],
    queryFn: () => getThreads(searchTerm || undefined),
    enabled: !!accessToken, // guests have no persistent identity to list against
  });
}
