import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { getMyProfile } from "@/features/settings/api";

/*
 * The current user is also held in the in-memory auth store after login.
 * This query remains the authoritative server-state source for Settings:
 *
 * - It refreshes the profile when the page is opened.
 * - It provides clean loading / error / retry states.
 * - It is invalidated after PATCH /users/me.
 *
 * It must not run for guests because GET /users/me requires JWT auth.
 */
export function useProfileQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
