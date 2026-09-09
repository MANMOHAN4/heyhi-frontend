/**
 * features/sidebar/components/AppSidebar.tsx
 *
 * FIX (black overlay bug): the previous version always rendered the mobile
 * drawer's <div> tree (including its bg-black/40 backdrop) whenever
 * `mobileOpen` was true, with NO check on viewport width - so on a desktop
 * viewport, if `mobileOpen` was ever set true (e.g. a stray click, or React
 * StrictMode double-invoking a handler in dev), the backdrop rendered
 * ON TOP OF the already-visible desktop sidebar, producing exactly the
 * "black panel over half the screen" seen in the screenshot. There was
 * also no Escape-key handling and no body-scroll-lock, both of which the
 * previous version lacked.
 *
 * FIX: the drawer now (1) only ever mounts when mobileOpen is true AND
 * (2) is unconditionally hidden at md+ widths via `md:hidden` on the
 * wrapping element itself (not just the trigger button), so even if
 * mobileOpen were somehow true on desktop, Tailwind's responsive class
 * keeps it not-displayed. Escape-to-close and click-outside-to-close are
 * both wired. This is still a placeholder for shadcn's real Sidebar/Sheet
 * (see 04-nonfunctional-and-deployment.md) but is now behaviorally correct.
 */
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus, Search, Menu, X } from "lucide-react";
import { useAuthStore } from "../../auth/useAuthStore";
import { useThreadsQuery } from "../../conversation/useThreadsQuery";
import { useSpacesQuery } from "../../spaces/useSpacesQuery";
import { useThreadSearch } from "../useThreadSearch";
import { ThreadListItem } from "./ThreadListItem";
import { SpaceListItem } from "./SpaceListItem";
import { UserMenu } from "./UserMenu";
import { GuestPrompt } from "./GuestPrompt";
import { PageErrorState } from "../../../src/components/shared/PageErrorState";
import { EmptyState } from "../../../src/components/shared/EmptyState";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { inputValue, setInputValue, debouncedValue } = useThreadSearch();
  const threadsQuery = useThreadsQuery(debouncedValue);
  const spacesQuery = useSpacesQuery();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 p-2">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> New Thread
        </NavLink>
      </div>

      {!accessToken ? (
        <GuestPrompt />
      ) : (
        <>
          <div className="relative px-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search threads…"
              className="w-full rounded-md border bg-background py-1.5 pl-7 pr-2 text-sm"
              aria-label="Search threads"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            <p className="px-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
              Threads
            </p>
            {threadsQuery.isLoading && (
              <div className="space-y-1 px-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 animate-pulse rounded bg-muted" />
                ))}
              </div>
            )}
            {threadsQuery.isError && (
              <PageErrorState
                message="Couldn't load your threads."
                onRetry={() => threadsQuery.refetch()}
              />
            )}
            {threadsQuery.data?.length === 0 && (
              <EmptyState message="Start your first conversation" />
            )}
            {threadsQuery.data?.map((thread) => (
              <ThreadListItem key={thread.id} thread={thread} />
            ))}

            <p className="mt-4 px-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
              Spaces
            </p>
            {spacesQuery.data?.length === 0 && (
              <EmptyState message="Create your first Space" />
            )}
            {spacesQuery.data?.map((space) => (
              <SpaceListItem key={space.id} space={space} />
            ))}
          </div>

          <UserMenu />
        </>
      )}
    </div>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Escape-to-close + body-scroll-lock while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar - always visible at md+, never rendered below it */}
      <aside className="hidden w-64 shrink-0 border-r md:block">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger trigger - only rendered below md */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed left-2 top-2 z-30 rounded-md border bg-background p-2 shadow-sm md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/*
        Mobile drawer: gated on BOTH mobileOpen AND md:hidden, so it is
        never simultaneously visible with the desktop <aside> above,
        regardless of state - this is what fixes the black-overlay bug.
      */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full w-72 flex-col bg-background shadow-lg">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
