import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { getInvoices } from "@/features/billing/api";

/*
 * Invoice history:
 * - Auth required
 * - Backend returns [] if the user has no invoices
 * - No pagination is currently supported by the backend
 */
export function useInvoicesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: getInvoices,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
