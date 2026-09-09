import type { ComponentType } from "react";
import {
  BookOpen,
  Calculator,
  Globe2,
  PenLine,
  PlaySquare,
  UsersRound,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { FocusMode } from "@/lib/constants";

type FocusModeOption = {
  value: FocusMode;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const FOCUS_MODE_OPTIONS: FocusModeOption[] = [
  {
    value: "WEB",
    label: "Web",
    description: "Search the live web for current information.",
    icon: Globe2,
  },
  {
    value: "ACADEMIC",
    label: "Academic",
    description: "Search scholarly papers from arXiv.",
    icon: BookOpen,
  },
  {
    value: "MATH",
    label: "Math",
    description: "Solve arithmetic and conceptual math without web retrieval.",
    icon: Calculator,
  },
  {
    value: "WRITING",
    label: "Writing",
    description: "Write or rewrite content without citations.",
    icon: PenLine,
  },
  {
    value: "VIDEO",
    label: "Video",
    description: "Search video-platform results.",
    icon: PlaySquare,
  },
  {
    value: "SOCIAL",
    label: "Social",
    description: "Search social-platform results.",
    icon: UsersRound,
  },
];

type FocusModeControlProps = {
  value: FocusMode;
  onValueChange: (value: FocusMode) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function FocusModeControl({
  value,
  onValueChange,
  disabled = false,
  compact = false,
}: FocusModeControlProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  /*
   * Mobile and compact contexts use a Select:
   * - Six toggle buttons do not fit reliably on 375px screens.
   * - Thread continuation keeps mode fixed, so compact rendering is useful.
   */
  if (!isDesktop || compact) {
    return (
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(nextValue) => {
          onValueChange(nextValue as FocusMode);
        }}
      >
        <SelectTrigger
          className="h-8 min-w-28 bg-muted/40 text-xs"
          aria-label="Focus mode"
        >
          <SelectValue placeholder="Focus mode" />
        </SelectTrigger>

        <SelectContent align="start">
          {FOCUS_MODE_OPTIONS.map((option) => {
            const Icon = option.icon;

            return (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <Icon className="size-3.5 text-muted-foreground" />
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <ToggleGroup
      value={[value]}
      disabled={disabled}
      onValueChange={(nextValues) => {
        const nextValue = nextValues[0];

        if (nextValue) {
          onValueChange(nextValue as FocusMode);
        }
      }}
      aria-label="Focus mode"
      className="flex max-w-full flex-wrap justify-start gap-1"
    >
      {FOCUS_MODE_OPTIONS.map((option) => {
        const Icon = option.icon;

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger
              render={
                <ToggleGroupItem
                  value={option.value}
                  aria-label={option.label}
                  className="h-8 gap-1.5 rounded-md px-2.5 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Icon className="size-3.5" />
                  <span>{option.label}</span>
                </ToggleGroupItem>
              }
            />

            <TooltipContent side="top" className="max-w-56 text-xs">
              {option.description}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </ToggleGroup>
  );
}
