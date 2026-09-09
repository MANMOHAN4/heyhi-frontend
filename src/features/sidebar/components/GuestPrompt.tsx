/**
 * features/sidebar/components/GuestPrompt.tsx
 * Per 03-pages-and-features.md §2: guests see a simplified shell - no
 * thread list/Spaces (nothing to list without an account), just a
 * persistent "Sign up to save your history" prompt.
 */
import { Link } from "react-router-dom";

export function GuestPrompt() {
  return (
    <div className="m-2 rounded-md border bg-muted/40 p-3 text-sm">
      <p className="font-medium">Sign up to save your history</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Guest conversations aren't saved to an account and can't be recovered
        if you lose this tab.
      </p>
      <div className="mt-2 flex gap-2">
        <Link
          to="/signup"
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
        >
          Sign up
        </Link>
        <Link to="/login" className="rounded-md border px-3 py-1 text-xs font-medium">
          Log in
        </Link>
      </div>
    </div>
  );
}
