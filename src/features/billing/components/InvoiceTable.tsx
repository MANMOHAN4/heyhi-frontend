/**
 * features/billing/components/InvoiceTable.tsx
 * Per 03-pages-and-features.md §8: Table, columns for amount (formatted
 * amount_cents/100 + currency), status, date. Empty state if none yet.
 * Per 04-nonfunctional-and-deployment.md "Responsive Design": admin/data
 * Tables need horizontal scroll or a card fallback on mobile.
 */
import { useInvoicesQuery } from "../useInvoicesQuery";
import { formatCurrency, formatDate } from "../../../../lib/utils";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";
import { EmptyState } from "../../../src/components/shared/EmptyState";

export function InvoiceTable() {
  const { data, isLoading, isError, refetch } = useInvoicesQuery();

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <PageErrorState
        message="Couldn't load invoices."
        onRetry={() => refetch()}
      />
    );
  }

  if (data?.length === 0) {
    return <EmptyState message="No invoices yet" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Amount</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((invoice, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2">
                {formatCurrency(invoice.amount_cents, invoice.currency)}
              </td>
              <td className="px-3 py-2">{invoice.status}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {formatDate(invoice.issued_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
