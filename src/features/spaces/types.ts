import type { SpaceRole } from "@/lib/constants";

export interface Space {
  id: string;
  name: string;
  custom_instructions: string | null;
  updated_at: string;
}

export interface SpaceCollaborator {
  user_id: string;
  role: SpaceRole;
  accepted_at: string;
}

export interface CreateSpaceRequest {
  name: string;
  custom_instructions?: string;
}

export interface UpdateSpaceRequest {
  name?: string;
  custom_instructions?: string;
}

export interface AddFileToSpaceRequest {
  file_id: string;
  /** Optional per-space display name; defaults to the file's own name if omitted. */
  display_filename?: string;
}

export interface SpaceFile {
  file_id: string;
  display_name: string;
  filename: string;
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED" | "DELETING";
}

export interface InviteCollaboratorRequest {
  email: string;
  role: "editor" | "viewer";
}
