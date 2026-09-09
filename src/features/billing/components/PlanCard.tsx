import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Crown,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { Subscription } from "@/features/billing/types";

type PlanCardProps = {
  subscription: Subscription;
};

const PLAN_COPY: Record<
  Subscription["plan"],
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  FREE: {
    label: "Free",
    description: "Essential cited answers and saved conversations.",
    icon: Sparkles,
    className:
      "border-border bg-muted/50 text-muted-foreground dark:bg-muted/30",
  },
  PRO: {
    label: "Pro",
    description: "Advanced research and premium model controls.",
    icon: Crown,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  ENTERPRISE: {
    label: "Enterprise",
    description: "Workspace-grade access and advanced controls.",
    icon: Crown,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

const STATUS_COPY: Record<
  Subscription["status"],
  {
    label: string;
    className: string;
  }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  PAST_DUE: {
    label: "Past due",
    className: "bg-destructive/10 text-destructive",
  },
};

export function PlanCard({ subscription }: PlanCardProps) {
  const plan = PLAN_COPY[subscription.plan];
  const status = STATUS_COPY[subscription.status];
  const PlanIcon = plan.icon;

  const periodEnd = subscription.current_period_end
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(subscription.current_period_end))
    : null;

  return (
    <Card className="overflow-hidden border-border/80 bg-card/80">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PlanIcon className="size-5" />
            </div>

            <div>
              <CardTitle className="text-lg">{plan.label}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>
          </div>

          <Badge className={`rounded-md border ${plan.className}`}>
            {plan.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {subscription.status === "ACTIVE" ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : (
              <CircleAlert className="size-4 text-amber-500" />
            )}

            <span className="text-sm text-muted-foreground">
              Subscription status
            </span>
          </div>

          <Badge
            variant="secondary"
            className={`rounded-md ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>

        {periodEnd && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/35 px-3 py-2.5">
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Current billing period ends on{" "}
              <span className="font-medium text-foreground">{periodEnd}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
