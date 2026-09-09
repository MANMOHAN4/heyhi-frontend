import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { getSubscription } from "@/features/billing/api";

/*
 * Used by:
 * - Billing page plan card
 * - Upgrade button visibility
 * - Conversation ModelSelect, to show model overrides only to PRO/ENTERPRISE
 *
 * It does not run for guests because billing endpoints require JWT auth.
 */
export function useSubscriptionQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: getSubscription,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
