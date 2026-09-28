import { useEffect, useMemo, useState } from "react";
import {
  Command as CommandIcon,
  FolderKanban,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useThreadsQuery } from "@/features/conversation/useThreadsQuery";
import { useSpacesQuery } from "@/features/spaces/useSpacesQuery";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useDebounce } from "@/hooks/useDebounce";

type CommandPaletteProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 250);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch("");
    }

    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setUncontrolledOpen(nextOpen);
    }
  };

  const threadsQuery = useThreadsQuery(debouncedSearch);
  const spacesQuery = useSpacesQuery();

  const filteredSpaces = useMemo(() => {
    const spaces = spacesQuery.data ?? [];

    if (!search.trim()) {
      return spaces.slice(0, 6);
    }

    const normalizedSearch = search.toLowerCase();

    return spaces
      .filter((space) => space.name.toLowerCase().includes(normalizedSearch))
      .slice(0, 6);
  }, [search, spacesQuery.data]);

  useKeyboardShortcut({
    key: "k",
    meta: true,
    ctrl: false,
    enabled: true,
    onTrigger: () => setOpen(!open),
  });

  useKeyboardShortcut({
    key: "k",
    meta: false,
    ctrl: true,
    enabled: true,
    onTrigger: () => setOpen(!open),
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Quick navigation"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search conversations and Spaces…"
            className="border-0"
          />
          <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Kbd>Esc</Kbd>
          </span>
        </div>

        <CommandList className="max-h-[min(24rem,60vh)]">
          <CommandEmpty>
            {accessToken
              ? "No conversations or Spaces found."
              : "Sign in to search your history."}
          </CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => goTo("/")}>
              <MessageSquarePlus className="size-4" />
              New conversation
              <CommandShortcut>⌘ N</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {accessToken && <CommandSeparator />}

          {accessToken && (
            <>
              <CommandGroup heading="Conversations">
                {threadsQuery.isFetching && (
                  <CommandItem disabled>
                    <CommandIcon className="size-4 animate-pulse" />
                    Searching conversations…
                  </CommandItem>
                )}

                {!threadsQuery.isFetching &&
                  threadsQuery.threads.slice(0, 8).map((thread) => (
                    <CommandItem
                      key={thread.id}
                      value={`conversation ${thread.title}`}
                      onSelect={() => goTo(`/threads/${thread.id}`)}
                    >
                      <CommandIcon className="size-4" />
                      <span className="truncate">{thread.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Spaces">
                {filteredSpaces.map((space) => (
                  <CommandItem
                    key={space.id}
                    value={`space ${space.name}`}
                    onSelect={() => goTo(`/spaces/${space.id}`)}
                  >
                    <FolderKanban className="size-4" />
                    <span className="truncate">{space.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
