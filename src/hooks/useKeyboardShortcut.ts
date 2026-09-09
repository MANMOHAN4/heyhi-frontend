import { useEffect } from "react";

export interface KeyboardShortcutOptions {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
  allowInInput?: boolean;
  onTrigger: (event: KeyboardEvent) => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcut({
  key,
  meta = false,
  ctrl = false,
  shift = false,
  alt = false,
  enabled = true,
  preventDefault = true,
  allowInInput = false,
  onTrigger,
}: KeyboardShortcutOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!allowInInput && isEditableElement(event.target)) {
        return;
      }

      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      const modifierMatches =
        event.metaKey === meta &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt;

      if (!keyMatches || !modifierMatches) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      onTrigger(event);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    allowInInput,
    alt,
    ctrl,
    enabled,
    key,
    meta,
    onTrigger,
    preventDefault,
    shift,
  ]);
}
