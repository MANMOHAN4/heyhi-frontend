import { apiFetch } from "@/lib/apiClient";
import type {
  AddFileToSpaceRequest,
  CreateSpaceRequest,
  InviteCollaboratorRequest,
  Space,
  SpaceCollaborator,
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

export function deleteSpace(spaceId: string): Promise<void> {
  return apiFetch<void>(`/spaces/${encodeURIComponent(spaceId)}`, {
    method: "DELETE",
  });
}

export function addFileToSpace(
  spaceId: string,
  payload: AddFileToSpaceRequest,
): Promise<void> {
  return apiFetch<void>(`/spaces/${encodeURIComponent(spaceId)}/files`, {
    method: "POST",
    body: payload,
  });
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
