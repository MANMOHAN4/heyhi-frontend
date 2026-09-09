/**
 * features/conversation/components/FocusModeToggle.tsx
 * Per 02-api-reference.md "Focus Modes": present as a Toggle Group (all six
 * visible at once) on desktop. Per 04-nonfunctional-and-deployment.md
 * "Responsive Design": collapse into a Select/Dropdown on narrow screens -
 * six always-visible toggle buttons will not fit a phone screen width.
 * Disabled entirely when continuing an existing thread (focus_mode is fixed
 * at thread creation - see 02-api-reference.md "POST /threads/{id}/turns").
 */
import {
  FOCUS_MODES,
  FOCUS_MODE_LABELS,
  FOCUS_MODE_DESCRIPTIONS,
  type FocusMode,
} from "../../../../lib/constants";

interface FocusModeToggleProps {
  value: FocusMode;
  onChange: (mode: FocusMode) => void;
  disabled?: boolean;
}

export function FocusModeToggle({
  value,
  onChange,
  disabled,
}: FocusModeToggleProps) {
  return (
    <>
      {/* Desktop: full toggle group, all six visible */}
      <div
        className="hidden gap-1 md:flex"
        role="group"
        aria-label="Focus mode"
      >
        {FOCUS_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            title={FOCUS_MODE_DESCRIPTIONS[mode]}
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              value === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {FOCUS_MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Mobile: collapses to a select */}
      <select
        className="rounded-md border bg-background px-2 py-1 text-xs md:hidden"
        value={value}
        disabled={disabled}
        aria-label="Focus mode"
        onChange={(e) => onChange(e.target.value as FocusMode)}
      >
        {FOCUS_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {FOCUS_MODE_LABELS[mode]}
          </option>
        ))}
      </select>
    </>
  );
}
