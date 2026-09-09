import { useQuery } from "@tanstack/react-query";

import { getSpaces } from "@/features/spaces/api";
import { useAuthStore } from "@/features/auth/useAuthStore";

export function useSpacesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["spaces", "owned"],
    queryFn: getSpaces,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
