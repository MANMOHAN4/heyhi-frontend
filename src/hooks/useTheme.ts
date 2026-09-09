import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";

export type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (
    storedTheme === "dark" ||
    storedTheme === "light" ||
    storedTheme === "system"
  ) {
    return storedTheme;
  }

  return "dark";
}

function applyTheme(theme: Theme): void {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(resolvedTheme);

  document.documentElement.style.colorScheme = resolvedTheme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentResolvedTheme =
        currentTheme === "system" ? getSystemTheme() : currentTheme;

      return currentResolvedTheme === "dark" ? "light" : "dark";
    });
  }, []);

  const resolvedTheme =
    theme === "system" && typeof window !== "undefined"
      ? getSystemTheme()
      : theme;

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
  };
}
