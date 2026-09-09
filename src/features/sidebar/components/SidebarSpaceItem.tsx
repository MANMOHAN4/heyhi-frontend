import { FolderKanban } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import type { Space } from "@/features/spaces/types";

type SidebarSpaceItemProps = {
  space: Space;
  onNavigate?: () => void;
};

export function SidebarSpaceItem({ space, onNavigate }: SidebarSpaceItemProps) {
  return (
    <NavLink
      to={`/spaces/${space.id}`}
      onClick={onNavigate}
      title={space.name}
      className={({ isActive }) =>
        `group flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
          isActive
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`
      }
    >
      <FolderKanban className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="min-w-0 flex-1 truncate">{space.name}</span>
      {space.custom_instructions && (
        <Badge
          variant="secondary"
          className="hidden h-5 shrink-0 rounded-md px-1.5 text-[10px] lg:inline-flex"
        >
          AI
        </Badge>
      )}
    </NavLink>
  );
}
