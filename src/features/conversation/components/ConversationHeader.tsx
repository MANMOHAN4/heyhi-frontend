import { Link, useLocation, useParams } from "react-router-dom";
import { Menu, MessageSquarePlus, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuthStore } from "@/features/auth/useAuthStore";

type ConversationHeaderProps = {
  title?: string;
  space?: {
    id: string;
    name: string;
  } | null;
  onOpenSidebar?: () => void;
  onShare?: () => void;
  shareDisabled?: boolean;
};

export function ConversationHeader({
  title,
  space,
  onOpenSidebar,
  onShare,
  shareDisabled = false,
}: ConversationHeaderProps) {
  const { threadId } = useParams<{ threadId: string }>();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);

  const isNewThread = !threadId || location.pathname === "/";

  const displayTitle =
    title?.trim() || (isNewThread ? "New conversation" : "Conversation");

  const canShare = Boolean(accessToken && threadId && onShare);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/80 px-3 backdrop-blur-xl sm:px-5">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={onOpenSidebar}
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </Button>
          }
        />

        <TooltipContent side="bottom">Open navigation</TooltipContent>
      </Tooltip>

      <div className="min-w-0 flex-1">
        {space ? (
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbLink
                  render={
                    <Link
                      to={`/spaces/${space.id}`}
                      className="truncate text-xs"
                    />
                  }
                >
                  {space.name}
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate text-sm font-medium">
                  {displayTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              {displayTitle}
            </p>

            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Citation-grounded answers and research
            </p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {canShare && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={shareDisabled}
                  onClick={onShare}
                  className="hidden gap-1.5 sm:inline-flex"
                >
                  <Share2 className="size-3.5" />
                  Share
                </Button>
              }
            />

            <TooltipContent side="bottom">
              Share this conversation
            </TooltipContent>
          </Tooltip>
        )}

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Start new conversation"
                render={<Link to="/" />}
              >
                <MessageSquarePlus className="size-4" />
              </Button>
            }
          />

          <TooltipContent side="bottom">New conversation</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
