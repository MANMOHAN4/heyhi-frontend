import { Crown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useRazorpayCheckout } from "@/features/billing/useRazorpayCheckout";

type UpgradeButtonProps = {
  className?: string;
};

export function UpgradeButton({ className }: UpgradeButtonProps) {
  const { isOpening, openCheckout } = useRazorpayCheckout();

  const button = (
    <Button
      type="button"
      disabled={isOpening}
      onClick={() => void openCheckout()}
      className={`gap-2 bg-violet-600 text-white hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 ${className ?? ""}`}
    >
      {isOpening ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Crown className="size-4" />
      )}

      {isOpening ? "Opening checkout…" : "Upgrade to Pro"}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="top">
        Upgrade your heyHi account with Razorpay
      </TooltipContent>
    </Tooltip>
  );
}
