import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { getFiles } from "@/features/files/api";

/*
 * The caller's previously-uploaded files (BACKEND_API_REFERENCE.md §8.3).
 * Guests never have an account-scoped file list to pick from.
 */
export function useFilesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["files"],
    queryFn: getFiles,
    enabled: Boolean(accessToken),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}
