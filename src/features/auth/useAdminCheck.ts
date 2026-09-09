import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { apiFetch } from "@/lib/apiClient";

export function useAdminCheck() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const isAdmin = useAuthStore((state) => state.isAdmin);
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess(): Promise<void> {
      if (!accessToken) {
        setIsAdmin(undefined);
        return;
      }

      try {
        /*
         * The backend exposes this endpoint only to admins.
         * A successful request means the current user is an admin.
         */
        await apiFetch("/admin/audit-log");

        if (!cancelled) {
          setIsAdmin(true);
        }
      } catch {
        /*
         * A normal user gets 404 by deliberate backend policy.
         * Treat any unsuccessful admin probe as not-admin for the UI.
         */
        if (!cancelled) {
          setIsAdmin(false);
        }
      }
    }

    void checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [accessToken, setIsAdmin]);

  return {
    isAdmin,
    isChecking: Boolean(accessToken) && isAdmin === undefined,
  };
}
