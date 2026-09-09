// src/routes/AppShellLayout.tsx
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../src/features/sidebar/components/AppSidebar";

export function AppShellLayout() {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <AppSidebar />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <Outlet />
      </main>
    </div>
  );
}
