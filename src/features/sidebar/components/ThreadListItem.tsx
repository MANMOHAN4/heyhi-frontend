/**
 * features/sidebar/components/ThreadListItem.tsx
 * Per 03-pages-and-features.md §4 "Thread Sidebar Actions":
 *  - Rename via inline edit (PATCH /threads/{id})
 *  - Delete behind an Alert Dialog confirmation (destructive)
 *  - Share -> copyable url in an Input + copy button + Toast; if already
 *    shared, show "Copy share link" / "Revoke" instead of "Share" again
 *    (share is idempotent - same token returned every time).
 *  - Revoke behind an Alert Dialog.
 */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MoreHorizontal, Pencil, Trash2, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { useThreadActions } from "../../conversation/useThreadActions";
import type { ThreadSummary } from "../../conversation/types";

interface ThreadListItemProps {
  thread: ThreadSummary;
  sharedUrl?: string; // tracked client-side once known - no "is this shared" field on ThreadSummary
}

export function ThreadListItem({ thread, sharedUrl }: ThreadListItemProps) {
  const { rename, remove, share, revoke } = useThreadActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);

  const submitRename = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== thread.title) {
      rename.mutate({ threadId: thread.id, title: trimmed });
    }
    setRenaming(false);
  };

  const handleShare = () => {
    share.mutate(thread.id, {
      onSuccess: (res) => {
        navigator.clipboard.writeText(window.location.origin + res.url);
        toast.success("Link copied");
      },
    });
    setMenuOpen(false);
  };

  return (
    <div className="group relative flex items-center rounded-md px-2 py-1.5 hover:bg-accent">
      {renaming ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={submitRename}
          onKeyDown={(e) => e.key === "Enter" && submitRename()}
          className="flex-1 rounded border bg-background px-1 text-sm"
        />
      ) : (
        <NavLink to={`/t/${thread.id}`} className="flex-1 truncate text-sm">
          {thread.title}
        </NavLink>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Thread actions"
        className="opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-10 w-40 rounded-md border bg-popover p-1 text-sm shadow-md">
          <button
            className="flex w-full items-center gap-2 rounded px-2 py-1 hover:bg-accent"
            onClick={() => {
              setRenaming(true);
              setMenuOpen(false);
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Rename
          </button>
          <button
            className="flex w-full items-center gap-2 rounded px-2 py-1 hover:bg-accent"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" /> {sharedUrl ? "Copy share link" : "Share"}
          </button>
          {sharedUrl && (
            <button
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-destructive hover:bg-accent"
              onClick={() => {
                setConfirmingRevoke(true);
                setMenuOpen(false);
              }}
            >
              Revoke share
            </button>
          )}
          <button
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-destructive hover:bg-accent"
            onClick={() => {
              setConfirmingDelete(true);
              setMenuOpen(false);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}

      {confirmingDelete && (
        <AlertDialogPlaceholder
          title="Delete this thread?"
          description="This action can't be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            remove.mutate(thread.id);
            setConfirmingDelete(false);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {confirmingRevoke && (
        <AlertDialogPlaceholder
          title="Revoke share link?"
          description="Anyone with the old link will lose access. A new link can be generated later."
          confirmLabel="Revoke"
          onConfirm={() => {
            revoke.mutate(thread.id);
            setConfirmingRevoke(false);
          }}
          onCancel={() => setConfirmingRevoke(false)}
        />
      )}
    </div>
  );
}

/**
 * NOTE: swap for shadcn's real `AlertDialog` (`npx shadcn@latest add
 * alert-dialog`) once installed - this inline placeholder preserves the
 * required "destructive action behind explicit confirmation" behavior from
 * 03-pages-and-features.md §4 in the meantime.
 */
function AlertDialogPlaceholder({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-lg border bg-popover p-4 shadow-lg">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border px-3 py-1.5 text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1 rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground"
          >
            <Check className="h-3.5 w-3.5" /> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
