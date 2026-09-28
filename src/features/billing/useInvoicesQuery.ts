import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthStore } from "@/features/auth/useAuthStore";
import { getInvoices } from "@/features/billing/api";

const INVOICES_PAGE_SIZE = 20;

/*
 * Invoice history:
 * - Auth required
 * - Cursor-paginated: Page<InvoiceResponse> = { items, next_cursor }
 *   (BACKEND_API_REFERENCE.md §8.4)
 * - Currently returns an empty page for everyone - no invoice rows are
 *   written yet server-side (Appendix A #6) - so expect an empty state,
 *   not an error, until that's wired up.
 */
export function useInvoicesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useInfiniteQuery({
    queryKey: ["billing", "invoices"],
    queryFn: ({ pageParam }) =>
      getInvoices(pageParam ?? undefined, INVOICES_PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const invoices = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return { ...query, invoices };
}
