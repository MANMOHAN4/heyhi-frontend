/**
 * features/admin/useAdminMutations.ts
 * Per 03-pages-and-features.md §9 "Users": Suspend/Unsuspend behind an
 * Alert Dialog for suspend specifically (a real, impactful action - a
 * suspended user's token is silently treated as invalid everywhere, see
 * 01-backend-reference.md "Authorization / Roles"). Both actions are
 * audit-logged server-side automatically.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suspendUser, unsuspendUser } from "./api";

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
      toast.success("User suspended");
    },
    onError: () => toast.error("Couldn't suspend this user."),
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
      toast.success("User unsuspended");
    },
    onError: () => toast.error("Couldn't unsuspend this user."),
  });
}
