/**
 * features/spaces/types.ts
 * Per 01-backend-reference.md "Space" / "SpaceCollaborator".
 */
import type { SpaceRole } from "../../../lib/constants";

export interface Space {
  id: string; // UUID
  name: string;
  custom_instructions: string | null; // max 4000 chars, enforced server-side
  updated_at: string; // ISO 8601
}

export interface SpaceCollaborator {
  user_id: string;
  role: SpaceRole; // "OWNER" | "EDITOR" | "VIEWER" - uppercase in responses
  accepted_at: string; // always set immediately, invites auto-accept
}

export interface CreateSpaceRequest {
  name: string;
  custom_instructions?: string;
}

export interface UpdateSpaceRequest {
  name?: string;
  custom_instructions?: string;
  // Omit fields you don't want to change - do NOT send null expecting
  // "no change"; only omit the key entirely (see 02-api-reference.md
  // "PATCH /spaces/{spaceId}").
}

export interface AddFileToSpaceRequest {
  file_id: string;
}

export interface InviteCollaboratorRequest {
  email: string;
  role: "editor" | "viewer"; // lowercase in the REQUEST specifically -
  // a real, deliberate backend casing inconsistency vs. the uppercase
  // response shape (see 02-api-reference.md "POST /spaces/{id}/collaborators").
}
