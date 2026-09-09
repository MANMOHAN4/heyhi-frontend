/**
 * features/conversation/useThreadActions.ts
 * Rename/delete/share/revoke mutations, each invalidating the thread list
 * cache on success so the sidebar reflects changes immediately.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameThread, deleteThread, shareThread, revokeShare } from "./api";
import { toast } from "sonner"; // shadcn `sonner` component wraps this

export function useThreadActions() {
  const queryClient = useQueryClient();

  const invalidateThreads = () =>
    queryClient.invalidateQueries({ queryKey: ["threads"] });

  const rename = useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      renameThread(threadId, { title }),
    onSuccess: invalidateThreads,
    onError: () => toast.error("Couldn't rename this thread. Please try again."),
  });

  const remove = useMutation({
    mutationFn: (threadId: string) => deleteThread(threadId),
    onSuccess: invalidateThreads,
    onError: () => toast.error("Couldn't delete this thread. Please try again."),
  });

  const share = useMutation({
    mutationFn: (threadId: string) => shareThread(threadId),
    onSuccess: () => toast.success("Share link ready"),
    onError: () => toast.error("Couldn't create a share link. Please try again."),
  });

  const revoke = useMutation({
    mutationFn: (threadId: string) => revokeShare(threadId),
    onSuccess: () => toast.success("Share link revoked"),
    onError: () => toast.error("Couldn't revoke the share link. Please try again."),
  });

  return { rename, remove, share, revoke };
}
