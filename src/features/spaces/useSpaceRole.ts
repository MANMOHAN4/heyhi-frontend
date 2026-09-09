import { useEffect } from "react";
import { create } from "zustand";

import { useAuthStore } from "@/features/auth/useAuthStore";
import type { SpaceRole } from "@/lib/constants";
import { useCollaboratorsQuery } from "@/features/spaces/useSpaceQuery";

const ROLE_RANK: Record<SpaceRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

type SpaceRoleState = {
  rolesBySpaceId: Record<string, SpaceRole>;
  setRole: (spaceId: string, role: SpaceRole) => void;
  removeRole: (spaceId: string) => void;
  clearRoles: () => void;
};

export const useSpaceRoleStore = create<SpaceRoleState>((set) => ({
  rolesBySpaceId: {},

  setRole: (spaceId, role) =>
    set((state) => ({
      rolesBySpaceId: {
        ...state.rolesBySpaceId,
        [spaceId]: role,
      },
    })),

  removeRole: (spaceId) =>
    set((state) => {
      const nextRoles = { ...state.rolesBySpaceId };
      delete nextRoles[spaceId];

      return { rolesBySpaceId: nextRoles };
    }),

  clearRoles: () => set({ rolesBySpaceId: {} }),
}));

/*
 * Backend gap workaround (see 01-backend-reference.md, Authorization /
 * Roles): there is no "what is my role in this Space" endpoint. The role
 * store is normally populated at the point a role is first knowable -
 * OWNER at creation time (useSpaceMutations), or EDITOR/VIEWER at the
 * moment someone is invited (if the inviter is looking at the same
 * session - which they usually aren't, since the invitee is a different
 * person/browser entirely).
 *
 * That leaves a real gap: a genuine collaborator who opens a Space they
 * were invited to - not one they created in this browser session - has no
 * role recorded at all, so every role-gated action (Add file, Invite,
 * Delete, even seeing the Collaborators list) silently disappears despite
 * GET /spaces/{id} having already confirmed they have at least VIEWER
 * access to get this far.
 *
 * This hook closes that gap: whenever a Space's role is unknown, it fetches
 * GET /spaces/{id}/collaborators (VIEWER+ access, per 02-api-reference.md)
 * and looks for the current user's own row by user_id to recover their
 * exact role. This is a UI convenience only, not a security boundary - if
 * this ever guesses wrong, every mutating action still gets enforced (and
 * a wrong guess denied) by the backend itself.
 */
function useResolveSpaceRole(spaceId?: string): void {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const roleKnown = useSpaceRoleStore((state) =>
    spaceId ? Boolean(state.rolesBySpaceId[spaceId]) : true,
  );
  const setRole = useSpaceRoleStore((state) => state.setRole);

  const collaboratorsQuery = useCollaboratorsQuery(
    spaceId && !roleKnown ? spaceId : undefined,
  );

  useEffect(() => {
    if (!spaceId || roleKnown || !currentUserId) {
      return;
    }

    const ownRow = collaboratorsQuery.data?.find(
      (collaborator) => collaborator.user_id === currentUserId,
    );

    if (ownRow) {
      setRole(spaceId, ownRow.role);
      return;
    }

    /*
     * The collaborators call succeeded (VIEWER+ access, confirmed by
     * GET /spaces/{id} already succeeding) but the caller's own user_id
     * isn't in the list. This means they can see the Space through some
     * other path than being a listed collaborator - possibly ownership,
     * if the API reference's SpaceCollaborator array doesn't include an
     * OWNER row for the Space's own owner (unconfirmed either way from
     * 02-api-reference.md). Fall back to the floor the successful call
     * itself proves - VIEWER - rather than guessing OWNER: under-granting
     * only hides an action the backend would have allowed, whereas
     * over-granting would show an action (e.g. Delete Space) the backend
     * then has to reject, which is a worse experience.
     */
    if (collaboratorsQuery.isSuccess) {
      setRole(spaceId, "VIEWER");
    }
  }, [
    collaboratorsQuery.data,
    collaboratorsQuery.isSuccess,
    currentUserId,
    roleKnown,
    setRole,
    spaceId,
  ]);
}

export function useSpaceRole(spaceId?: string) {
  useResolveSpaceRole(spaceId);

  const role = useSpaceRoleStore((state) =>
    spaceId ? state.rolesBySpaceId[spaceId] : undefined,
  );
  const setRole = useSpaceRoleStore((state) => state.setRole);

  const hasAtLeast = (minimumRole: SpaceRole) => {
    if (!role) {
      return false;
    }

    return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
  };

  return {
    role,
    roleKnown: Boolean(role),
    isOwner: role === "OWNER",
    isEditorOrAbove: hasAtLeast("EDITOR"),
    isViewerOrAbove: hasAtLeast("VIEWER"),
    setRole: (nextRole: SpaceRole) => {
      if (spaceId) {
        setRole(spaceId, nextRole);
      }
    },
  };
}
