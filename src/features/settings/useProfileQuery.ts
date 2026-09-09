/**
 * features/settings/useProfileQuery.ts
 * Wraps GET /users/me for the Settings page. Note: LoginForm/OAuthCompletePage
 * already populate the auth store's `user` on login, so this query mainly
 * exists to (a) refresh on direct navigation to /settings and (b) provide
 * loading/error states for that page specifically.
 */
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api";
import { useAuthStore } from "../auth/useAuthStore";

export function useProfileQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMe,
    enabled: !!accessToken,
  });
}
