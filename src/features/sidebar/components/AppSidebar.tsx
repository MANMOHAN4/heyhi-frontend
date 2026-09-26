import { useEffect, useState } from "react";
import { MessageSquarePlus, PanelLeft, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorState } from "@/components/shared/PageErrorState";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useSpacesQuery } from "@/features/spaces/useSpacesQuery";
import { CommandPalette } from "@/features/sidebar/components/CommandPalette";
import { SidebarSpaceItem } from "@/features/sidebar/components/SidebarSpaceItem";
import { SidebarThreadItem } from "@/features/sidebar/components/SidebarThreadItem";
import { UserMenu } from "@/features/sidebar/components/UserMenu";
import { useThreadSearch } from "@/features/sidebar/useThreadSearch";

type AppSidebarProps = {
  children: React.ReactNode;
};

export function AppSidebar({ children }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  /*
   * Closing the mobile Sheet on navigation avoids leaving an overlay active
   * after the user selects a conversation/Space.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      defaultOpen
    >
      <DesktopSidebar onOpenCommand={() => setCommandOpen(true)} />

      <SidebarInset className="min-w-0 bg-background">
        <div className="flex h-12 shrink-0 items-center border-b border-border/70 px-3 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <PanelLeft className="size-4" />
          </Button>
          <AppLogo className="ml-2" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto gap-1.5 text-xs"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="size-3.5" />
            Search
          </Button>
        </div>

        {children}
      </SidebarInset>

      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}

type DesktopSidebarProps = {
  onOpenCommand: () => void;
};

function DesktopSidebar({ onOpenCommand }: DesktopSidebarProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    searchInput,
    setSearchInput,
    threads,
    isLoading: threadsLoading,
    isError: threadsError,
    refetch: refetchThreads,
  } = useThreadSearch();

  const spacesQuery = useSpacesQuery();

  return (
    <Sidebar
      collapsible="icon"
      className="hidden border-r border-sidebar-border md:flex"
    >
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="px-1"></div>
        <AppLogo />
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-sidebar-accent/35"
          render={<Link to="/" />}
        >
          <MessageSquarePlus className="size-4" />
          <span>New conversation</span>
        </Button>

        {accessToken && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-between border border-sidebar-border/70 bg-sidebar-accent/20 text-muted-foreground hover:bg-sidebar-accent"
            onClick={onOpenCommand}
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5" />
              Search
            </span>

            <span className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </Button>
        )}
      </SidebarHeader>

      <Separator />

      <SidebarContent className="px-2 py-2">
        {!accessToken ? (
          <GuestSidebarContent />
        ) : (
          <>
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Conversations
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <div className="mb-2 px-1">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search history…"
                      className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar-accent/30 pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                      aria-label="Search conversations"
                    />
                  </div>
                </div>

                {threadsLoading && <ThreadListSkeleton />}

                {threadsError && (
                  <div className="px-1 py-2">
                    <PageErrorState
                      message="Couldn't load conversations."
                      onRetry={() => refetchThreads()}
                    />
                  </div>
                )}

                {!threadsLoading && !threadsError && threads.length === 0 && (
                  <div className="px-1 py-2">
                    <EmptyState message="No conversations yet" />
                  </div>
                )}

                {!threadsLoading && !threadsError && threads.length > 0 && (
                  <SidebarMenu>
                    {threads.map((thread) => (
                      <SidebarMenuItem key={thread.id}>
                        <SidebarThreadItem thread={thread} />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-3" />

            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Spaces
              </SidebarGroupLabel>

              <SidebarGroupContent>
                {spacesQuery.isLoading && <SpaceListSkeleton />}

                {spacesQuery.isError && (
                  <div className="px-1 py-2">
                    <PageErrorState
                      message="Couldn't load Spaces."
                      onRetry={() => spacesQuery.refetch()}
                    />
                  </div>
                )}

                {!spacesQuery.isLoading &&
                  !spacesQuery.isError &&
                  spacesQuery.data?.length === 0 && (
                    <div className="px-1 py-2">
                      <EmptyState message="No Spaces yet" />
                    </div>
                  )}

                {!spacesQuery.isLoading &&
                  !spacesQuery.isError &&
                  (spacesQuery.data?.length ?? 0) > 0 && (
                    <SidebarMenu>
                      {spacesQuery.data?.map((space) => (
                        <SidebarMenuItem key={space.id}>
                          <SidebarSpaceItem space={space} />
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {accessToken ? <UserMenu /> : <GuestFooter />}
      </SidebarFooter>
    </Sidebar>
  );
}

type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    searchInput,
    setSearchInput,
    threads,
    isLoading: threadsLoading,
    isError: threadsError,
    refetch: refetchThreads,
  } = useThreadSearch();

  const spacesQuery = useSpacesQuery();

  const closeSheet = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[19rem] max-w-[85vw] flex-col p-0"
      >
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle>
            <AppLogo onClick={closeSheet} />
          </SheetTitle>
        </SheetHeader>

        <div className="p-3">
          <Button
            className="w-full justify-start gap-2"
            render={<Link to="/" onClick={closeSheet} />}
          >
            <MessageSquarePlus className="size-4" />
            New conversation
          </Button>
        </div>

        {!accessToken ? (
          <div className="px-3">
            <GuestSidebarContent />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Conversations
              </p>

              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search history…"
                  className="h-9 w-full rounded-md border bg-muted/30 pl-8 pr-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Search conversations"
                />
              </div>

              {threadsLoading && <ThreadListSkeleton />}

              {threadsError && (
                <PageErrorState
                  message="Couldn't load conversations."
                  onRetry={() => refetchThreads()}
                />
              )}

              {!threadsLoading && !threadsError && threads.length === 0 && (
                <EmptyState message="No conversations yet" />
              )}

              {!threadsLoading && !threadsError && threads.length > 0 && (
                <div className="space-y-0.5">
                  {threads.map((thread) => (
                    <SidebarThreadItem
                      key={thread.id}
                      thread={thread}
                      onNavigate={closeSheet}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Spaces
              </p>

              {spacesQuery.isLoading && <SpaceListSkeleton />}

              {spacesQuery.isError && (
                <PageErrorState
                  message="Couldn't load Spaces."
                  onRetry={() => spacesQuery.refetch()}
                />
              )}

              {!spacesQuery.isLoading &&
                !spacesQuery.isError &&
                spacesQuery.data?.length === 0 && (
                  <EmptyState message="No Spaces yet" />
                )}

              {!spacesQuery.isLoading &&
                !spacesQuery.isError &&
                (spacesQuery.data?.length ?? 0) > 0 && (
                  <div className="space-y-0.5">
                    {spacesQuery.data?.map((space) => (
                      <SidebarSpaceItem
                        key={space.id}
                        space={space}
                        onNavigate={closeSheet}
                      />
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        <div className="border-t p-2">
          {accessToken ? <UserMenu onNavigate={closeSheet} /> : <GuestFooter />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GuestSidebarContent() {
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/25 p-3">
      <p className="text-sm font-medium text-sidebar-foreground">
        Save your research
      </p>

      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Sign in to keep conversations, upload documents, and create Spaces.
      </p>

      <div className="mt-3 flex gap-2">
        <Button size="sm" className="flex-1" render={<Link to="/signup" />}>
          Sign up
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          render={<Link to="/login" />}
        >
          Log in
        </Button>
      </div>
    </div>
  );
}

function GuestFooter() {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground"
      render={<Link to="/login" />}
    >
      Log in to your account
    </Button>
  );
}

function ThreadListSkeleton() {
  return (
    <div className="space-y-1 px-1">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-[86%]" />
      <Skeleton className="h-8 w-[72%]" />
    </div>
  );
}

function SpaceListSkeleton() {
  return (
    <div className="space-y-1 px-1">
      <Skeleton className="h-8 w-[84%]" />
      <Skeleton className="h-8 w-[68%]" />
    </div>
  );
}
