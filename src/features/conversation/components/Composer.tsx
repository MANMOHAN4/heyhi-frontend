import { useRef, useState } from "react";
import { SendHorizontal, Sparkles, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FileAttachButton } from "@/features/conversation/components/FileAttachButton";
import { FocusModeControl } from "@/features/conversation/components/FocusModeControl";
import { ModelSelect } from "@/features/conversation/components/ModelSelect";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { QUERY_MAX_LENGTH, type FocusMode } from "@/lib/constants";

export type ComposerSubmitParams = {
  query: string;
  focusMode: FocusMode;
  fileIds: string[];
  model: string;
  isProSearch: boolean;
};

type ComposerProps = {
  threadId?: string;
  spaceId?: string;
  isStreaming: boolean;
  onSubmit: (params: ComposerSubmitParams) => void;
  onStopStreaming?: () => void;
};

export function Composer({
  threadId,
  spaceId,
  isStreaming,
  onSubmit,
  onStopStreaming,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const accessToken = useAuthStore((state) => state.accessToken);

  const [query, setQuery] = useState("");
  const [focusMode, setFocusMode] = useState<FocusMode>("WEB");
  const [model, setModel] = useState("auto");
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [isProSearch, setIsProSearch] = useState(false);

  const isContinuation = Boolean(threadId);
  const canUseProSearch = Boolean(accessToken) && !isContinuation;

  const remainingCharacters = QUERY_MAX_LENGTH - query.length;

  const canSubmit =
    !isStreaming && query.trim().length > 0 && query.length <= QUERY_MAX_LENGTH;

  const submitQuery = () => {
    const trimmedQuery = query.trim();

    if (
      !trimmedQuery ||
      trimmedQuery.length > QUERY_MAX_LENGTH ||
      isStreaming
    ) {
      return;
    }

    onSubmit({
      query: trimmedQuery,
      focusMode,
      fileIds,
      model,
      isProSearch: canUseProSearch && isProSearch,
    });

    setQuery("");
    setFileIds([]);
    setIsProSearch(false);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuery();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitQuery();
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-200 focus-within:border-ring/60 focus-within:shadow-[0_20px_55px_-24px_rgba(0,0,0,0.95)]"
      >
        <InputGroup className="min-h-28 border-0 bg-transparent shadow-none">
          <InputGroupTextarea
            ref={textareaRef}
            rows={3}
            value={query}
            disabled={isStreaming}
            maxLength={QUERY_MAX_LENGTH + 50}
            placeholder={
              isContinuation ? "Ask a follow-up question…" : "Ask anything…"
            }
            aria-label="Ask a question"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-24 resize-none px-3 pt-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground/70"
          />

          <InputGroupAddon
            align="block-end"
            className="flex min-w-0 flex-wrap items-center gap-1.5 px-2 pb-2 pt-1"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <FocusModeControl
                value={focusMode}
                onValueChange={setFocusMode}
                disabled={isStreaming || isContinuation}
                compact={isContinuation}
              />

              {!isContinuation && (
                <>
                  <Separator
                    orientation="vertical"
                    className="mx-1 hidden h-5 sm:block"
                  />

                  <FileAttachButton
                    disabled={isStreaming}
                    onFileIdsChange={setFileIds}
                  />

                  <ModelSelect
                    value={model}
                    onValueChange={setModel}
                    disabled={isStreaming}
                  />

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <InputGroupButton
                          type="button"
                          size="sm"
                          variant={isProSearch ? "secondary" : "ghost"}
                          disabled={!canUseProSearch || isStreaming}
                          aria-pressed={isProSearch}
                          onClick={() => {
                            if (canUseProSearch) {
                              setIsProSearch((current) => !current);
                            }
                          }}
                          className={
                            isProSearch
                              ? "gap-1.5 bg-violet-500/15 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
                              : "gap-1.5"
                          }
                        >
                          <Sparkles className="size-3.5" />
                          <span className="hidden sm:inline">Pro Search</span>
                        </InputGroupButton>
                      }
                    />

                    <TooltipContent side="top">
                      {canUseProSearch
                        ? "Run multi-step agentic research"
                        : "Sign in to use Pro Search"}
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {query.length > QUERY_MAX_LENGTH - 160 && (
                <span
                  className={`hidden text-xs sm:inline ${
                    remainingCharacters < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {remainingCharacters}
                </span>
              )}

              {!isStreaming && (
                <span className="hidden text-xs text-muted-foreground lg:inline-flex lg:items-center lg:gap-1">
                  <Kbd>Enter</Kbd>
                  <span>send</span>
                </span>
              )}

              {isStreaming ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        onClick={onStopStreaming}
                        aria-label="Stop generating"
                        className="rounded-xl"
                      >
                        <Square className="size-3.5 fill-current" />
                      </Button>
                    }
                  />

                  <TooltipContent side="top">Stop generating</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="submit"
                        size="icon-sm"
                        disabled={!canSubmit}
                        aria-label="Send question"
                        className="rounded-xl"
                      >
                        <SendHorizontal className="size-4" />
                      </Button>
                    }
                  />

                  <TooltipContent side="top">Send question</TooltipContent>
                </Tooltip>
              )}
            </div>
          </InputGroupAddon>
        </InputGroup>
      </form>

      {spaceId && !isContinuation && (
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          This conversation will use this Space&apos;s shared files and custom
          instructions.
        </p>
      )}

      {!accessToken && !isContinuation && (
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          You are using a guest session. Sign in to save your conversation
          history.
        </p>
      )}
    </div>
  );
}
