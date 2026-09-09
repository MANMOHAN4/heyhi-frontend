/**
 * features/sharing/api.ts
 * Per 02-api-reference.md "GET /shared/{token}": genuinely, fully public -
 * no header needed or checked. skipAuth: true ensures apiClient never
 * attaches an Authorization header nor triggers the 401-logout handler
 * for this call, since it must work identically for a guest and a
 * logged-in user browsing someone else's share link.
 */
import { apiFetch } from "../../../lib/apiClient";
import type { SharedThreadResponse } from "../conversation/types";

export function getSharedThread(token: string): Promise<SharedThreadResponse> {
  return apiFetch<SharedThreadResponse>(
    `/shared/${encodeURIComponent(token)}`,
    {
      method: "GET",
      skipAuth: true,
    },
  );
}
