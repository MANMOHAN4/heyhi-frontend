/**
 * features/spaces/components/SpaceCard.tsx
 */
import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import type { Space } from "../types";

interface SpaceCardProps {
  space: Space;
}

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link
      to={`/spaces/${space.id}`}
      className="flex flex-col gap-2 rounded-lg border p-4 hover:border-primary hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Folder className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">{space.name}</h3>
      </div>
      {space.custom_instructions && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {space.custom_instructions}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Updated {new Date(space.updated_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
