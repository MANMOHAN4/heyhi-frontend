import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { suspendUser, unsuspendUser } from "@/features/admin/api";
import { ApiError } from "@/lib/apiError";

function getAdminActionErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  /*
   * Admin authorization is deliberately hidden by returning 404.
   * Do not claim that a user or endpoint definitely does not exist.
   */
  if (error.status === 404) {
    return "This admin action is unavailable or you no longer have access.";
  }

  if (error.status === 401 || error.code === "UNAUTHORIZED") {
    return "Your session has expired. Please sign in again.";
  }

  return error.message || fallback;
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => suspendUser(userId),

    onSuccess: async () => {
      /*
       * Suspension is automatically audit-logged by the backend.
       * Refresh both views so the status and newest audit event appear together.
       */
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "users"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "audit-log"],
        }),
      ]);

      toast.success("User suspended");
    },

    onError: (error) => {
      toast.error(
        getAdminActionErrorMessage(
          error,
          "Couldn't suspend this user. Please try again.",
        ),
      );
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "users"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "audit-log"],
        }),
      ]);

      toast.success("User unsuspended");
    },

    onError: (error) => {
      toast.error(
        getAdminActionErrorMessage(
          error,
          "Couldn't unsuspend this user. Please try again.",
        ),
      );
    },
  });
}
