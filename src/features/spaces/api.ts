/**
 * features/spaces/api.ts
 * Per 02-api-reference.md "Knowledge - Files & Spaces". Reminder gaps
 * (see 01-backend-reference.md / 04-nonfunctional...md consolidated gap
 * list): GET /spaces returns only Spaces the caller OWNS, not ones they've
 * been invited to as a collaborator; there is no "my role in this Space"
 * field on any response.
 */
import { apiFetch } from "../../../lib/apiClient";
import type {
  Space,
  SpaceCollaborator,
  CreateSpaceRequest,
  UpdateSpaceRequest,
  AddFileToSpaceRequest,
  InviteCollaboratorRequest,
} from "./types";

export function createSpace(payload: CreateSpaceRequest): Promise<Space> {
  return apiFetch<Space>("/spaces", { method: "POST", body: payload });
}

export function getSpaces(): Promise<Space[]> {
  return apiFetch<Space[]>("/spaces", { method: "GET" });
}

export function getSpace(spaceId: string): Promise<Space> {
  return apiFetch<Space>(`/spaces/${spaceId}`, { method: "GET" });
}

export function updateSpace(
  spaceId: string,
  payload: UpdateSpaceRequest,
): Promise<Space> {
  return apiFetch<Space>(`/spaces/${spaceId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSpace(spaceId: string): Promise<void> {
  return apiFetch<void>(`/spaces/${spaceId}`, { method: "DELETE" });
}

export function addFileToSpace(
  spaceId: string,
  payload: AddFileToSpaceRequest,
): Promise<void> {
  return apiFetch<void>(`/spaces/${spaceId}/files`, {
    method: "POST",
    body: payload,
  });
}

export function getCollaborators(
  spaceId: string,
): Promise<SpaceCollaborator[]> {
  return apiFetch<SpaceCollaborator[]>(`/spaces/${spaceId}/collaborators`, {
    method: "GET",
  });
}

export function inviteCollaborator(
  spaceId: string,
  payload: InviteCollaboratorRequest,
): Promise<SpaceCollaborator> {
  return apiFetch<SpaceCollaborator>(`/spaces/${spaceId}/collaborators`, {
    method: "POST",
    body: payload,
  });
}
