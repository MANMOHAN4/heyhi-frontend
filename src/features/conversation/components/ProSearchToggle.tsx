/**
 * features/conversation/components/ProSearchToggle.tsx
 * Per 03-pages-and-features.md §3: visually distinct, disabled/tooltipped
 * for guests since the daily quota (and any persistent history) is
 * per-account only - an anonymous user gets no real benefit from it.
 */
import { Sparkles } from "lucide-react";
import { useAuthStore } from "../../auth/useAuthStore";

interface ProSearchToggleProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ProSearchToggle({ active, onToggle, disabled }: ProSearchToggleProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isGuest = !accessToken;

  return (
    <button
      type="button"
      disabled={disabled || isGuest}
      title={isGuest ? "Sign in to use Pro Search" : "Multi-step agentic research"}
      aria-pressed={active}
      onClick={onToggle}
      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-violet-600 text-white"
          : "bg-muted text-muted-foreground hover:bg-accent"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      Pro Search
    </button>
  );
}
