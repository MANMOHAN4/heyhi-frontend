/**
 * features/spaces/useSpaceRole.ts
 *
 * Per 01-backend-reference.md "Authorization / Roles" and the consolidated
 * gap list in 04-nonfunctional-and-deployment.md: there is NO endpoint that
 * tells the frontend "what is my role in this Space" - it must be inferred
 * or tracked client-side once known from context (Space list/creation
 * response), then gracefully handle any subsequent 404 as "no permission",
 * not a crash.
 *
 * Approach taken here: a small Zustand store keyed by spaceId, populated
 * whenever we learn the role from a reliable context:
 *   - Creating a Space -> caller is always OWNER.
 *   - Space appears in GET /spaces -> caller is the OWNER (that endpoint
 *     only returns Spaces the caller owns - see 02-api-reference.md gap).
 *   - Successfully calling an OWNER-only or EDITOR-only action -> confirms
 *     at least that role tier; a 404 on such an action means "not that
 *     role or higher", not a crash.
 * If no role is known yet for a spaceId, treat as VIEWER (most
 * conservative - hides editor/owner-only controls until proven otherwise).
 */
import { create } from "zustand";
import type { SpaceRole } from "../../../lib/constants";

interface SpaceRoleState {
  rolesBySpaceId: Record<string, SpaceRole>;
  setRole: (spaceId: string, role: SpaceRole) => void;
  getRole: (spaceId: string) => SpaceRole | undefined;
}

export const useSpaceRoleStore = create<SpaceRoleState>((set, get) => ({
  rolesBySpaceId: {},
  setRole: (spaceId, role) =>
    set((state) => ({
      rolesBySpaceId: { ...state.rolesBySpaceId, [spaceId]: role },
    })),
  getRole: (spaceId) => get().rolesBySpaceId[spaceId],
}));

const ROLE_RANK: Record<SpaceRole, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export function useSpaceRole(spaceId: string) {
  const role = useSpaceRoleStore((s) => s.rolesBySpaceId[spaceId]);
  const setRole = useSpaceRoleStore((s) => s.setRole);

  const isAtLeast = (minimum: SpaceRole) => {
    if (!role) return false; // unknown -> conservatively deny
    return ROLE_RANK[role] >= ROLE_RANK[minimum];
  };

  return {
    role, // undefined = not yet known
    setRole: (r: SpaceRole) => setRole(spaceId, r),
    isOwner: role === "OWNER",
    isEditorOrAbove: isAtLeast("EDITOR"),
    isViewerOrAbove: isAtLeast("VIEWER"),
  };
}
