import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { getCollaborators, getSpace } from "@/features/spaces/api";

export function useSpaceQuery(spaceId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["spaces", "detail", spaceId],
    queryFn: () => getSpace(spaceId!),
    enabled: Boolean(accessToken && spaceId),
    staleTime: 30_000,
  });
}

export function useCollaboratorsQuery(spaceId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["spaces", spaceId, "collaborators"],
    queryFn: () => getCollaborators(spaceId!),
    enabled: Boolean(accessToken && spaceId),
    staleTime: 30_000,
  });
}
