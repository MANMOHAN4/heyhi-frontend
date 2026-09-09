/**
 * features/sidebar/useThreadSearch.ts
 * Debounces the sidebar search input into the `q` param for
 * useThreadsQuery (GET /threads?q=...), per 03-pages-and-features.md §2.
 */
import { useEffect, useState } from "react";

export function useThreadSearch(delayMs = 300) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(inputValue), delayMs);
    return () => clearTimeout(timer);
  }, [inputValue, delayMs]);

  return { inputValue, setInputValue, debouncedValue };
}
