import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/apiError";
import {
  deleteThread,
  renameThread,
  revokeShare,
  shareThread,
} from "@/features/conversation/api";

function getActionErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  /*
   * Backend behavior: 404 deliberately means either genuinely not found OR
   * "you are not authorized to see/modify this resource." It is unsafe and
   * misleading to tell the user the thread was definitely deleted.
   */
  if (error.status === 404) {
    return "This conversation is unavailable or you no longer have access to it.";
  }

  if (error.status === 401 || error.code === "UNAUTHORIZED") {
    return "Your session has expired. Please sign in again.";
  }

  return error.message || fallback;
}

export function useThreadActions() {
  const queryClient = useQueryClient();

  const invalidateThreadList = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["threads"],
    });
  };

  const renameMutation = useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      renameThread(threadId, { title }),
    onSuccess: async (_response, variables) => {
      await invalidateThreadList();

      /*
       * If a future GET /threads/{id} endpoint is added and cached using
       * ["threads", threadId], this invalidation will also keep that detail
       * view coherent. It is harmless today if no such query exists.
       */
      await queryClient.invalidateQueries({
        queryKey: ["threads", variables.threadId],
      });

      toast.success("Conversation renamed");
    },
    onError: (error) => {
      toast.error(
        getActionErrorMessage(
          error,
          "Couldn't rename this conversation. Please try again.",
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (threadId: string) => deleteThread(threadId),
    onSuccess: async (_response, threadId) => {
      queryClient.removeQueries({
        queryKey: ["threads", threadId],
      });

      await invalidateThreadList();
      toast.success("Conversation deleted");
    },
    onError: (error) => {
      toast.error(
        getActionErrorMessage(
          error,
          "Couldn't delete this conversation. Please try again.",
        ),
      );
    },
  });

  const shareMutation = useMutation({
    mutationFn: (threadId: string) => shareThread(threadId),
    onSuccess: (shareLink, threadId) => {
      /*
       * POST /threads/{threadId}/share is idempotent: if a link already
       * exists, backend returns the same token/url. Cache it locally to make
       * subsequent UI actions "Copy link" / "Revoke" immediately available.
       */
      queryClient.setQueryData(["threads", threadId, "share"], shareLink);
    },
    onError: (error) => {
      toast.error(
        getActionErrorMessage(
          error,
          "Couldn't create a share link. Please try again.",
        ),
      );
    },
  });

  const revokeShareMutation = useMutation({
    mutationFn: (threadId: string) => revokeShare(threadId),

    onSuccess: (_data, threadId) => {
      queryClient.removeQueries({
        queryKey: ["threads", threadId, "share"],
      });

      toast.success("Share link revoked");
    },

    onError: (error) => {
      toast.error(
        getActionErrorMessage(
          error,
          "Couldn't revoke the share link. Please try again.",
        ),
      );
    },
  });

  const copyShareLink = async (url: string): Promise<boolean> => {
    const shareUrl = new URL(url, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied");
      return true;
    } catch {
      toast.error("Couldn't copy the share link. Please copy it manually.");
      return false;
    }
  };

  return {
    renameThread: renameMutation,
    deleteThread: deleteMutation,
    shareThread: shareMutation,
    revokeShare: revokeShareMutation,
    copyShareLink,
  };
}
