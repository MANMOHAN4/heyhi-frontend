/**
 * features/billing/components/UpgradeButton.tsx
 * Per 03-pages-and-features.md §8: shown only if plan is FREE.
 */
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useRazorpayCheckout } from "../useRazorpayCheckout";

export function UpgradeButton() {
  const { openCheckout } = useRazorpayCheckout();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await openCheckout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Upgrade to Pro
    </button>
  );
}
