/**
 * features/spaces/useSpaceMutations.ts
 * All write operations for Spaces, each invalidating the relevant query
 * cache entries on success. 404s from any of these are surfaced as
 * "you don't have permission" per the not-found-for-authorization pattern
 * (see 01-backend-reference.md), not a generic crash/toast.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSpace,
  updateSpace,
  deleteSpace,
  addFileToSpace,
  inviteCollaborator,
} from "./api";
import { ApiError } from "../../../lib/apiError";
import type {
  CreateSpaceRequest,
  UpdateSpaceRequest,
  InviteCollaboratorRequest,
} from "./types";

function permissionAwareMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.isNotFoundOrForbidden) {
    return "You don't have permission to do this.";
  }
  if (err instanceof ApiError && err.code === "USER_NOT_FOUND") {
    return "No account found with that email.";
  }
  return err instanceof ApiError ? err.message : fallback;
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSpaceRequest) => createSpace(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["spaces"] }),
    onError: (err) =>
      toast.error(permissionAwareMessage(err, "Couldn't create this Space.")),
  });
}

export function useUpdateSpace(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSpaceRequest) => updateSpace(spaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (err) =>
      toast.error(permissionAwareMessage(err, "Couldn't save changes.")),
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (spaceId: string) => deleteSpace(spaceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["spaces"] }),
    onError: (err) =>
      toast.error(permissionAwareMessage(err, "Couldn't delete this Space.")),
  });
}

export function useAddFileToSpace(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) =>
      addFileToSpace(spaceId, { file_id: fileId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["spaces", spaceId] }),
    onError: (err) =>
      toast.error(permissionAwareMessage(err, "Couldn't add this file.")),
  });
}

export function useInviteCollaborator(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteCollaboratorRequest) =>
      inviteCollaborator(spaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["spaces", spaceId, "collaborators"],
      });
      toast.success("Collaborator added");
    },
    onError: (err) =>
      toast.error(
        permissionAwareMessage(err, "Couldn't invite this collaborator."),
      ),
  });
}
