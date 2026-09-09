import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  compact?: boolean;
  href?: string;
}

export function AppLogo({
  className,
  compact = false,
  href = "/",
}: AppLogoProps) {
  return (
    <Link
      to={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card shadow-sm">
        <Sparkles className="size-4 text-foreground" strokeWidth={2} />
      </span>

      {!compact && (
        <span className="text-sm font-semibold tracking-tight text-foreground">
          heyHi
        </span>
      )}
    </Link>
  );
}
