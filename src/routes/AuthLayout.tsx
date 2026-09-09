import { Link, Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";

/*
 * Minimal public layout for login, signup, verify-email, and OAuth completion.
 *
 * It intentionally does not use AppSidebar. Auth pages should feel focused,
 * clean, and usable on small screens without product-shell navigation.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.35_0.02_285_/_0.18),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.32_0.02_285_/_0.22),transparent_40%)]" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex w-fit items-center gap-2 text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </span>
          heyHi
        </Link>

        <section className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-7">
          <Outlet />
        </section>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Citation-grounded answers and research.
        </p>
      </div>
    </div>
  );
}
