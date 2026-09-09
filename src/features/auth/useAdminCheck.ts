/**
 * features/auth/useAdminCheck.ts
 *
 * There is no `is_admin` field on any user-facing response (see
 * 01-backend-reference.md "Authorization / Roles"). The ONLY way to know if
 * the current user is an admin is to call an admin-only endpoint and see
 * whether it succeeds (200) or fails (404, indistinguishable from a
 * nonexistent route). Recommendation followed here: probe
 * GET /admin/audit-log once per fresh login and cache the boolean result in
 * the auth store. Never poll this repeatedly - admin status only changes via
 * a manual/backend process.
 */
import { useEffect } from "react";
import { apiFetch } from "../../../lib/apiClient";
import { ApiError } from "../../../lib/apiError";
import { useAuthStore } from "./useAuthStore";

export function useAdminCheck() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const setIsAdmin = useAuthStore((s) => s.setIsAdmin);

  useEffect(() => {
    if (!accessToken || isAdmin !== null) return;

    let cancelled = false;

    apiFetch("/admin/audit-log", { method: "GET" })
      .then(() => {
        if (!cancelled) setIsAdmin(true);
      })
      .catch((err) => {
        if (cancelled) return;
        // A 404 here means "not admin" - the same generic not-found
        // response used everywhere else for authorization failures.
        if (err instanceof ApiError && err.status === 404) {
          setIsAdmin(false);
        } else {
          // Network/other error: leave as null (unknown) so we retry
          // next time a component mounts this hook, rather than
          // permanently assuming non-admin on a transient failure.
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isAdmin, setIsAdmin]);

  return isAdmin;
}
