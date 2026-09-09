import { apiFetch } from "@/lib/apiClient";
import type { SharedThread } from "@/features/sharing/types";

/*
 * GET /shared/{token}
 *
 * Public endpoint:
 * - No JWT is required.
 * - Do not attach an Authorization header.
 * - Do not redirect a visitor to /login if it fails.
 *
 * A revoked/nonexistent link returns:
 *
 * 404
 * {
 *   code: "SHARE_LINK_NOT_FOUND",
 *   message: "...",
 *   request_id: "..."
 * }
 */
export function getSharedThread(token: string): Promise<SharedThread> {
  return apiFetch<SharedThread>(`/shared/${encodeURIComponent(token)}`, {
    method: "GET",
    skipAuth: true,
  });
}
