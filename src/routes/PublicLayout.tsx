import { Outlet } from "react-router-dom";

/*
 * Public shared-thread layout.
 *
 * SharedThreadPage owns the visible public header because it needs a
 * special "Try heyHi" call-to-action. This layout only supplies a clean,
 * full-width document frame and deliberately has no app sidebar.
 */
export function PublicLayout() {
  return (
    <div className="min-h-[100dvh] min-w-0 bg-background text-foreground">
      <Outlet />
    </div>
  );
}
