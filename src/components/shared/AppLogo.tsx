import { Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  compact?: boolean;
  href?: string;
  onClick?: () => void;
}

export function AppLogo({
  className,
  compact = false,
  href = "/",
  onClick,
}: AppLogoProps) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`${APP_NAME} home`}
    >
      <img
        src="/assets/app-logo.png"
        alt=""
        aria-hidden="true"
        className="size-8 shrink-0 rounded-lg object-contain"
      />

      {!compact && (
        <span className="text-sm font-semibold tracking-tight text-current">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}