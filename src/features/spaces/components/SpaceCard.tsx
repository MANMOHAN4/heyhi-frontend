import { ArrowUpRight, FolderKanban, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Space } from "@/features/spaces/types";

type SpaceCardProps = {
  space: Space;
};

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Card className="group flex h-full min-w-0 flex-col overflow-hidden border-border/80 bg-card/80 transition-all duration-200 hover:border-primary/35 hover:bg-card hover:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.8)]">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderKanban className="size-4" />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${space.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        <div className="min-w-0">
          <CardTitle className="truncate text-base">{space.name}</CardTitle>

          <p className="mt-1 text-xs text-muted-foreground">
            Updated{" "}
            {new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(space.updated_at))}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {space.custom_instructions ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {space.custom_instructions}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground/70">
            No custom instructions yet.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
        <Badge variant="secondary" className="rounded-md text-[10px]">
          Space
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs"
          render={<Link to={`/spaces/${space.id}`} />}
        >
          Open
          <ArrowUpRight className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
