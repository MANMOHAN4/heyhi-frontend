import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Database,
  HelpCircle,
  ServerCog,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { useHealthQuery } from "@/features/admin/useAdminQueries";

function getHealthPresentation(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "UP") {
    return {
      icon: CheckCircle2,
      label: "Up",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      iconClass: "text-emerald-500",
    };
  }

  if (normalizedStatus === "DOWN") {
    return {
      icon: CircleAlert,
      label: "Down",
      badgeClass: "bg-destructive/10 text-destructive",
      iconClass: "text-destructive",
    };
  }

  return {
    icon: HelpCircle,
    label: status,
    badgeClass: "bg-muted text-muted-foreground",
    iconClass: "text-muted-foreground",
  };
}

function displayComponentName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function HealthGrid() {
  const healthQuery = useHealthQuery();

  if (healthQuery.isLoading) {
    return <HealthGridSkeleton />;
  }

  if (healthQuery.isError) {
    return (
      <PageErrorState
        message="Couldn't load dependency health."
        onRetry={() => healthQuery.refetch()}
      />
    );
  }

  if (!healthQuery.data) {
    return <EmptyState message="No health information is available." />;
  }

  const components = Object.entries(healthQuery.data.components ?? {});
  const overall = getHealthPresentation(healthQuery.data.status);
  const OverallIcon = overall.icon;

  return (
    <div className="space-y-4">
      <Card className="border-border/80 bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-muted-foreground" />
              System health
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Current snapshot of backend dependency health.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => healthQuery.refetch()}
            disabled={healthQuery.isFetching}
          >
            {healthQuery.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background/35 p-4">
            <div
              className={`flex size-10 items-center justify-center rounded-xl bg-muted ${overall.iconClass}`}
            >
              <OverallIcon className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Overall status</p>
              <p className="text-xs text-muted-foreground">
                Point-in-time snapshot. This dashboard does not poll
                continuously.
              </p>
            </div>

            <Badge
              variant="secondary"
              className={`gap-1 rounded-md ${overall.badgeClass}`}
            >
              <OverallIcon className="size-3.5" />
              {overall.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {components.length === 0 ? (
        <EmptyState message="No individual dependency statuses were reported." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {components.map(([name, component]) => {
            const presentation = getHealthPresentation(component.status);
            const StatusIcon = presentation.icon;

            return (
              <Card key={name} className="border-border/80 bg-card/80">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Database className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayComponentName(name)}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Dependency
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`shrink-0 gap-1 rounded-md ${presentation.badgeClass}`}
                  >
                    <StatusIcon className="size-3.5" />
                    {presentation.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        <ServerCog className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Historical health charts are intentionally not shown because the
          current backend exposes only a live `/actuator/health` snapshot, not
          time-series health data.
        </p>
      </div>
    </div>
  );
}

function HealthGridSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="border-border/80 bg-card/80">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>

        <CardContent>
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}
