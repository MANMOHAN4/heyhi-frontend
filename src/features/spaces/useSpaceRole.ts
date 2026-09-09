import { create } from "zustand";

import type { SpaceRole } from "@/lib/constants";

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

export function useSpaceRole(spaceId?: string) {
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
