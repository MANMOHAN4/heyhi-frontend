/**
 * features/spaces/useSpacesQuery.ts
 */
import { useQuery } from "@tanstack/react-query";
import { getSpaces } from "./api";
import { useAuthStore } from "../auth/useAuthStore";

export function useSpacesQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["spaces"],
    queryFn: getSpaces,
    enabled: !!accessToken,
  });
}
