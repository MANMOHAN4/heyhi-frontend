/**
 * features/billing/useInvoicesQuery.ts
 */
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "./api";
import { useAuthStore } from "../auth/useAuthStore";

export function useInvoicesQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: getInvoices,
    enabled: !!accessToken,
  });
}
