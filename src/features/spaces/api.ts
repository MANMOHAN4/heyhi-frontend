import { apiFetch } from "@/lib/apiClient";
import type { SpaceRoleOrNone } from "@/lib/constants";
import type {
  AddFileToSpaceRequest,
  CreateSpaceRequest,
  InviteCollaboratorRequest,
  Space,
  SpaceCollaborator,
  SpaceFile,
  UpdateSpaceRequest,
} from "@/features/spaces/types";

export function createSpace(payload: CreateSpaceRequest): Promise<Space> {
  return apiFetch<Space>("/spaces", {
    method: "POST",
    body: payload,
  });
}

export function getSpaces(): Promise<Space[]> {
  return apiFetch<Space[]>("/spaces", {
    method: "GET",
  });
}

export function getSpace(spaceId: string): Promise<Space> {
  return apiFetch<Space>(`/spaces/${encodeURIComponent(spaceId)}`, {
    method: "GET",
  });
}

export function updateSpace(
  spaceId: string,
  payload: UpdateSpaceRequest,
): Promise<Space> {
  return apiFetch<Space>(`/spaces/${encodeURIComponent(spaceId)}`, {
    method: "PATCH",
    body: payload,
  });
}

export type DeleteSpaceThreadsAction = "delete" | "detach";

/*
 * BACKEND_API_REFERENCE.md §8.5: `threads` is REQUIRED - missing or an
 * unrecognized value both 400. "delete" removes the Space's threads along
 * with it; "detach" keeps them as ordinary personal (space-less) threads
 * owned by whoever's threads they were. OWNER-only; 204 on success.
 */
export function deleteSpace(
  spaceId: string,
  threadsAction: DeleteSpaceThreadsAction,
): Promise<void> {
  return apiFetch<void>(
    `/spaces/${encodeURIComponent(spaceId)}?threads=${threadsAction}`,
    { method: "DELETE" },
  );
}

/*
 * 201, empty body (BACKEND_API_REFERENCE.md §8.5) - nothing to return.
 * The Space's file list should be refetched (GET /spaces/{id}/files) after
 * this succeeds, same pattern as the moderation "mark reviewed" action.
 */
export function addFileToSpace(
  spaceId: string,
  payload: AddFileToSpaceRequest,
): Promise<void> {
  return apiFetch<void>(`/spaces/${encodeURIComponent(spaceId)}/files`, {
    method: "POST",
    body: payload,
  });
}

/*
 * GET /spaces/{id}/files - List<SpaceFileResponse>, no paging
 * (BACKEND_API_REFERENCE.md §8.5).
 */
export function getSpaceFiles(spaceId: string): Promise<SpaceFile[]> {
  return apiFetch<SpaceFile[]>(
    `/spaces/${encodeURIComponent(spaceId)}/files`,
    { method: "GET" },
  );
}

export function getCollaborators(
  spaceId: string,
): Promise<SpaceCollaborator[]> {
  return apiFetch<SpaceCollaborator[]>(
    `/spaces/${encodeURIComponent(spaceId)}/collaborators`,
    {
      method: "GET",
    },
  );
}

export function inviteCollaborator(
  spaceId: string,
  payload: InviteCollaboratorRequest,
): Promise<SpaceCollaborator> {
  return apiFetch<SpaceCollaborator>(
    `/spaces/${encodeURIComponent(spaceId)}/collaborators`,
    {
      method: "POST",
      body: payload,
    },
  );
}

/*
 * GET /spaces/{id}/my-role (BACKEND_API_REFERENCE.md §5, §8.5) - the
 * authoritative source for "what can I do here", replacing the old
 * client-side guessing that inferred role from the collaborators list.
 * Returns NONE if the caller has no relationship to the Space at all.
 */
export function getMyRole(spaceId: string): Promise<{ role: SpaceRoleOrNone }> {
  return apiFetch<{ role: SpaceRoleOrNone }>(
    `/spaces/${encodeURIComponent(spaceId)}/my-role`,
    { method: "GET" },
  );
}
