/**
 * features/sidebar/components/SpaceListItem.tsx
 */
import { NavLink } from "react-router-dom";
import { Folder } from "lucide-react";
import type { Space } from "../../spaces/types";

interface SpaceListItemProps {
  space: Space;
}

export function SpaceListItem({ space }: SpaceListItemProps) {
  return (
    <NavLink
      to={`/spaces/${space.id}`}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
    >
      <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{space.name}</span>
    </NavLink>
  );
}
