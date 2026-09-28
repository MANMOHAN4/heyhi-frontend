import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addFileToSpace,
  createSpace,
  deleteSpace,
  inviteCollaborator,
  updateSpace,
  type DeleteSpaceThreadsAction,
} from "@/features/spaces/api";
import { useSeedSpaceRole } from "@/features/spaces/useSpaceRole";
import { ApiError } from "@/lib/apiError";
import type {
  AddFileToSpaceRequest,
  CreateSpaceRequest,
  InviteCollaboratorRequest,
  UpdateSpaceRequest,
} from "@/features/spaces/types";

function getSpaceActionError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code === "USER_NOT_FOUND") {
      return "No account was found with that email.";
    }

    if (error.status === 404) {
      return "This Space is unavailable or you do not have permission to perform this action.";
    }

    return error.message || fallback;
  }

  return fallback;
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  const { setRole } = useSeedSpaceRole();

  return useMutation({
    mutationFn: (payload: CreateSpaceRequest) => createSpace(payload),
    onSuccess: async (space) => {
      // The caller is OWNER of whatever Space they just created, by
      // definition - seed it instead of a redundant GET /my-role call.
      setRole(space.id, "OWNER");
      await queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Space created");
    },
    onError: (error) => {
      toast.error(getSpaceActionError(error, "Couldn't create the Space."));
    },
  });
}

export function useUpdateSpace(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSpaceRequest) => updateSpace(spaceId, payload),
    onSuccess: async (space) => {
      queryClient.setQueryData(["spaces", "detail", spaceId], space);
      await queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Space updated");
    },
    onError: (error) => {
      toast.error(getSpaceActionError(error, "Couldn't update the Space."));
    },
  });
}

/*
 * BACKEND_API_REFERENCE.md §8.5: `threads` is required on every call -
 * "delete" removes the Space's threads along with it, "detach" keeps them
 * as ordinary personal threads. There's no sane default to fall back to, so
 * this mutation takes it as an explicit argument rather than hiding it -
 * the confirm dialog is responsible for making the person choose.
 */
export function useDeleteSpace() {
  const queryClient = useQueryClient();
  const { clearRole } = useSeedSpaceRole();

  return useMutation({
    mutationFn: ({
      spaceId,
      threadsAction,
    }: {
      spaceId: string;
      threadsAction: DeleteSpaceThreadsAction;
    }) => deleteSpace(spaceId, threadsAction),
    onSuccess: async (_response, { spaceId }) => {
      clearRole(spaceId);
      queryClient.removeQueries({ queryKey: ["spaces", "detail", spaceId] });
      queryClient.removeQueries({ queryKey: ["spaces", spaceId] });
      await queryClient.invalidateQueries({ queryKey: ["spaces"] });
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      toast.success("Space deleted");
    },
    onError: (error) => {
      toast.error(getSpaceActionError(error, "Couldn't delete the Space."));
    },
  });
}

export function useAddFileToSpace(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddFileToSpaceRequest) =>
      addFileToSpace(spaceId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["spaces", spaceId, "files"],
      });
      toast.success("File added to Space");
    },
    onError: (error) => {
      toast.error(
        getSpaceActionError(error, "Couldn't add the file to this Space."),
      );
    },
  });
}

export function useInviteCollaborator(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteCollaboratorRequest) =>
      inviteCollaborator(spaceId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["spaces", spaceId, "collaborators"],
      });
      toast.success("Collaborator added");
    },
    onError: (error) => {
      toast.error(getSpaceActionError(error, "Couldn't add the collaborator."));
    },
  });
}

export function useSpaceMutations(spaceId: string) {
  return {
    update: useUpdateSpace(spaceId),
    addFile: useAddFileToSpace(spaceId),
    invite: useInviteCollaborator(spaceId),
  };
}
