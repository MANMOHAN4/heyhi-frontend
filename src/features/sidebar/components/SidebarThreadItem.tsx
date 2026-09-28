import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useThreadActions } from "@/features/conversation/useThreadActions";
import type { ThreadSummary } from "@/features/conversation/types";

type SidebarThreadItemProps = {
  thread: ThreadSummary;
  onNavigate?: () => void;
};

export function SidebarThreadItem({
  thread,
  onNavigate,
}: SidebarThreadItemProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  const {
    renameThread,
    deleteThread,
    shareThread,
    revokeShare,
    copyShareLink,
  } = useThreadActions();

  useEffect(() => {
    setTitle(thread.title);
  }, [thread.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const finishEditing = () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle && trimmedTitle !== thread.title) {
      renameThread.mutate({
        threadId: thread.id,
        title: trimmedTitle,
      });
    } else {
      setTitle(thread.title);
    }

    setIsEditing(false);
  };

  const cancelEditing = () => {
    setTitle(thread.title);
    setIsEditing(false);
  };

  const handleShare = () => {
    shareThread.mutate(thread.id, {
      onSuccess: async (shareLink) => {
        await copyShareLink(shareLink.url);
      },
    });
  };

  const handleDelete = () => {
    deleteThread.mutate(thread.id, {
      onSuccess: () => {
        navigate("/", { replace: true });
      },
    });
  };

  const handleRevoke = () => {
    revokeShare.mutate(thread.id, {
      onSuccess: () => {
        setRevokeOpen(false);
      },
    });
  };

  const isBusy =
    renameThread.isPending ||
    deleteThread.isPending ||
    shareThread.isPending ||
    revokeShare.isPending;

  return (
    <div className="group relative flex min-w-0 items-center gap-1 rounded-lg px-1 py-0.5">
      {isEditing ? (
        <div className="flex min-w-0 flex-1 items-center gap-1 px-1">
          <Input
            ref={inputRef}
            value={title}
            disabled={renameThread.isPending}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={finishEditing}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                finishEditing();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
            className="h-8 min-w-0 bg-background px-2 text-xs"
            aria-label="Conversation title"
          />
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            disabled={renameThread.isPending}
            onMouseDown={(event) => event.preventDefault()}
            onClick={finishEditing}
            aria-label="Save conversation title"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            disabled={renameThread.isPending}
            onMouseDown={(event) => event.preventDefault()}
            onClick={cancelEditing}
            aria-label="Cancel renaming conversation"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <NavLink
            to={`/threads/${thread.id}`}
            onClick={onNavigate}
            title={thread.title}
            className={({ isActive }) =>
              `min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            {thread.title}
          </NavLink>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={isBusy}
                        aria-label={`Actions for ${thread.title}`}
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="right">Conversation actions</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="start" side="right" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="size-3.5" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleShare}
                disabled={shareThread.isPending}
              >
                <Share2 className="size-3.5" />
                {shareThread.isPending
                  ? "Creating link…"
                  : "Share and copy link"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <AlertDialogTrigger
                  render={
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        setRevokeOpen(true);
                      }}
                    >
                      <Copy className="size-3.5" />
                      Revoke share link
                    </DropdownMenuItem>
                  }
                />

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke the share link?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anyone using the current public link will immediately lose
                      access. You can create a new link later, but it will have
                      a different URL.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={revokeShare.isPending}
                      onClick={handleRevoke}
                    >
                      {revokeShare.isPending ? "Revoking…" : "Revoke link"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger
                  render={
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(event) => {
                        event.preventDefault();
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Delete conversation
                    </DropdownMenuItem>
                  }
                />

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete this conversation?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action permanently removes the conversation and
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteThread.isPending}
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteThread.isPending
                        ? "Deleting…"
                        : "Delete conversation"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
