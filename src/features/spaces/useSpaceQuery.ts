/**
 * features/spaces/useSpaceQuery.ts
 * Per 02-api-reference.md "GET /spaces/{spaceId}": requires VIEWER role or
 * above, 404 otherwise (not-found-for-authorization pattern).
 */
import { useQuery } from "@tanstack/react-query";
import { getSpace, getCollaborators } from "./api";

export function useSpaceQuery(spaceId: string) {
  return useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpace(spaceId),
    enabled: !!spaceId,
  });
}

export function useCollaboratorsQuery(spaceId: string) {
  return useQuery({
    queryKey: ["spaces", spaceId, "collaborators"],
    queryFn: () => getCollaborators(spaceId),
    enabled: !!spaceId,
  });
}
