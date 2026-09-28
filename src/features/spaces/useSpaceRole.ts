import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getMyRole } from "@/features/spaces/api";
import { useAuthStore } from "@/features/auth/useAuthStore";
import type { SpaceRoleOrNone } from "@/lib/constants";

const ROLE_RANK: Record<SpaceRoleOrNone, number> = {
  NONE: -1,
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export function spaceRoleQueryKey(spaceId?: string) {
  return ["spaces", spaceId, "my-role"] as const;
}

/*
 * GET /spaces/{id}/my-role (BACKEND_API_REFERENCE.md §5, §8.5) is the
 * authoritative source for the caller's role in a Space, including the
 * explicit NONE case. This replaces the previous client-side approach of
 * caching OWNER at creation time and guessing everyone else's role from the
 * collaborators list - that guess could only ever produce a floor (VIEWER)
 * for a real collaborator who opened a Space they didn't create in this
 * browser session, silently hiding actions (Add file, Invite, Delete) the
 * backend would actually have allowed them.
 */
export function useSpaceRole(spaceId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useQuery({
    queryKey: spaceRoleQueryKey(spaceId),
    queryFn: () => getMyRole(spaceId!),
    enabled: Boolean(accessToken && spaceId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const role = query.data?.role;

  const hasAtLeast = (minimumRole: SpaceRoleOrNone) => {
    if (!role) {
      return false;
    }

    return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
  };

  return {
    role,
    roleKnown: role !== undefined,
    isLoading: query.isLoading,
    isOwner: role === "OWNER",
    isEditorOrAbove: hasAtLeast("EDITOR"),
    isViewerOrAbove: hasAtLeast("VIEWER"),
    hasNoAccess: role === "NONE",
  };
}

/*
 * For call sites (space creation, space deletion) that already know the
 * outcome without needing to ask the server - e.g. right after creating a
 * Space, the caller is OWNER by definition. Seeds the query cache directly
 * instead of an extra round trip, and useSpaceRole above will read it back
 * immediately via the same query key.
 */
export function useSeedSpaceRole() {
  const queryClient = useQueryClient();

  return {
    setRole: (spaceId: string, role: SpaceRoleOrNone) => {
      queryClient.setQueryData(spaceRoleQueryKey(spaceId), { role });
    },
    clearRole: (spaceId: string) => {
      queryClient.removeQueries({ queryKey: spaceRoleQueryKey(spaceId) });
    },
  };
}
