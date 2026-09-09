/**
 * routes/PublicLayout.tsx
 * Entirely separate from the authenticated app shell - no sidebar, no
 * composer, read-only. Used only for /shared/:token per
 * 03-pages-and-features.md §5.
 */
import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <Outlet />
    </div>
  );
}
