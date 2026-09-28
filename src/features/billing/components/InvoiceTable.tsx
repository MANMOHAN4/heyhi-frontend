import { Button } from "@/components/ui/button";
import { CheckCircle2, CircleAlert, FileText, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { useInvoicesQuery } from "@/features/billing/useInvoicesQuery";
import type { Invoice } from "@/features/billing/types";

function formatInvoiceAmount(invoice: Invoice): string {
  /*
   * `amount_cents` represents the smallest currency unit.
   * For INR that means paise, so 99900 is displayed as ₹999.00.
   */
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: invoice.currency || "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(invoice.amount_cents / 100);
}

function formatInvoiceDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function getInvoiceStatusClass(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (
    normalizedStatus.includes("PAID") ||
    normalizedStatus.includes("SUCCESS") ||
    normalizedStatus.includes("ACTIVE")
  ) {
    return {
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (
    normalizedStatus.includes("FAILED") ||
    normalizedStatus.includes("OVERDUE") ||
    normalizedStatus.includes("PAST_DUE")
  ) {
    return {
      icon: CircleAlert,
      className: "bg-destructive/10 text-destructive",
    };
  }

  return {
    icon: FileText,
    className: "bg-muted text-muted-foreground dark:bg-muted/50",
  };
}

export function InvoiceTable() {
  const invoicesQuery = useInvoicesQuery();

  if (invoicesQuery.isLoading) {
    return <InvoiceTableSkeleton />;
  }

  if (invoicesQuery.isError) {
    return (
      <PageErrorState
        message="Couldn't load invoice history."
        onRetry={() => invoicesQuery.refetch()}
      />
    );
  }

  const invoices = invoicesQuery.invoices;

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ReceiptText className="size-4 text-muted-foreground" />
          Invoice history
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your completed billing records and payment statuses.
        </p>
      </CardHeader>

      <CardContent>
        {invoices.length === 0 ? (
          <EmptyState message="No invoices yet." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.map((invoice, index) => {
                  const status = getInvoiceStatusClass(invoice.status);
                  const StatusIcon = status.icon;

                  return (
                    <TableRow
                      key={`${invoice.issued_at}-${invoice.amount_cents}-${index}`}
                    >
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatInvoiceDate(invoice.issued_at)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`gap-1 rounded-md ${status.className}`}
                        >
                          <StatusIcon className="size-3" />
                          {invoice.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-right font-medium">
                        {formatInvoiceAmount(invoice)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {invoicesQuery.hasNextPage && (
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={invoicesQuery.isFetchingNextPage}
              onClick={() => invoicesQuery.fetchNextPage()}
            >
              {invoicesQuery.isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvoiceTableSkeleton() {
  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
