/**
 * features/conversation/components/Composer.tsx
 *
 * Per 03-pages-and-features.md §3 "Composing a query":
 * Input Group = Textarea (char count near 2000 limit) + FocusModeToggle +
 * FileAttachButton + ModelSelect (Pro/Enterprise only) + Send, plus a
 * separate Pro Search toggle.
 *
 * Behavior split:
 *  - New thread (no threadId prop): focus_mode/file_ids/model/space_id are
 *    all selectable and sent with the first query.
 *  - Continuing thread (threadId provided): per 02-api-reference.md, only
 *    `query` is accepted - focus_mode/file_ids/model/space_id controls are
 *    disabled/hidden, reusing whatever was fixed at creation.
 */
import { useState } from "react";
import { FocusModeToggle } from "./FocusModeToggle";
import { FileAttachButton } from "./FileAttachButton";
import { ModelSelect } from "./ModelSelect";
import { ProSearchToggle } from "./ProSearchToggle";
import type { UploadedDocument } from "../../files/types";
import { QUERY_MAX_LENGTH, type FocusMode } from "../../../../lib/constants";
import { Send } from "lucide-react";

interface ComposerProps {
  threadId?: string; // undefined = composing the first turn of a new thread
  spaceId?: string;
  isStreaming: boolean;
  onSubmit: (params: {
    query: string;
    focusMode: FocusMode;
    fileIds: string[];
    model: string;
    isProSearch: boolean;
  }) => void;
}

export function Composer({
  threadId,
  spaceId,
  isStreaming,
  onSubmit,
}: ComposerProps) {
  const [query, setQuery] = useState("");
  const [focusMode, setFocusMode] = useState<FocusMode>("WEB");
  const [model, setModel] = useState("auto");
  const [attachedFiles, setAttachedFiles] = useState<UploadedDocument[]>([]);
  const [proSearchActive, setProSearchActive] = useState(false);

  const isContinuation = !!threadId;
  const remaining = QUERY_MAX_LENGTH - query.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || trimmed.length > QUERY_MAX_LENGTH || isStreaming) return;

    onSubmit({
      query: trimmed,
      focusMode,
      fileIds: attachedFiles
        .filter((f) => f.status === "READY")
        .map((f) => f.id),
      model,
      isProSearch: proSearchActive && !isContinuation,
    });
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
    rounded-2xl border border-border/80
    bg-card/80 p-3 shadow-[0_12px_35px_-18px_rgba(0,0,0,0.75)]
    backdrop-blur-sm
    transition-shadow duration-200
    focus-within:border-ring/60
    focus-within:shadow-[0_14px_40px_-18px_rgba(0,0,0,0.9)]
  "
    >
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Ask anything…"
        rows={2}
        maxLength={QUERY_MAX_LENGTH + 50} // allow slight overtype, block on submit instead
        disabled={isStreaming}
        aria-label="Query"
        className="w-full resize-none bg-transparent text-sm outline-none disabled:opacity-60"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <FocusModeToggle
            value={focusMode}
            onChange={setFocusMode}
            disabled={isContinuation || isStreaming}
          />
          {!isContinuation && (
            <ModelSelect
              value={model}
              onChange={setModel}
              disabled={isStreaming}
            />
          )}
          {!isContinuation && (
            <FileAttachButton
              attachedFiles={attachedFiles}
              onFilesChange={setAttachedFiles}
              disabled={isStreaming}
            />
          )}
          {!isContinuation && (
            <ProSearchToggle
              active={proSearchActive}
              onToggle={() => setProSearchActive((v) => !v)}
              disabled={isStreaming}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {remaining < 100 && (
            <span
              className={`text-xs ${remaining < 0 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {remaining}
            </span>
          )}
          <button
            type="submit"
            disabled={
              isStreaming || !query.trim() || query.length > QUERY_MAX_LENGTH
            }
            aria-label="Send"
            className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {spaceId && !isContinuation && (
        <p className="text-xs text-muted-foreground">
          Grounded in this Space's shared files and custom instructions.
        </p>
      )}
    </form>
  );
}
