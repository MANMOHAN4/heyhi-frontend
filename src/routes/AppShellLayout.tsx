import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/features/sidebar/components/AppSidebar";

/*
 * Full-viewport authenticated/guest conversational shell.
 *
 * `min-w-0` is crucial inside flex layouts:
 * it allows long messages, source cards, tables, and composer controls to
 * shrink within the viewport instead of forcing horizontal overflow.
 *
 * `h-[100dvh]` uses the dynamic mobile viewport rather than old `100vh`,
 * avoiding the mobile browser address-bar layout jump.
 */
export function AppShellLayout() {
  return (
    <AppSidebar>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <Outlet />
      </main>
    </AppSidebar>
  );
}
