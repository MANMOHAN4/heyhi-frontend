/**
 * features/billing/useSubscriptionQuery.ts
 * Used both by the dedicated Billing page and by ModelSelect (to decide
 * whether to show model-override options at all).
 */
import { useQuery } from "@tanstack/react-query";
import { getSubscription } from "./api";
import { useAuthStore } from "../auth/useAuthStore";

export function useSubscriptionQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: getSubscription,
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}
