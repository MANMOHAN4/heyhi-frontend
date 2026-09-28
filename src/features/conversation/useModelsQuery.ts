import { useQuery } from "@tanstack/react-query";

import { getModels } from "@/features/conversation/api";

/*
 * GET /models (BACKEND_API_REFERENCE.md §8.2, P6) is public and returns
 * only bare ids - [{ id }] - no display metadata. It rarely changes, so a
 * long staleTime avoids refetching on every composer mount.
 */
export function useModelsQuery() {
  return useQuery({
    queryKey: ["models"],
    queryFn: getModels,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}
