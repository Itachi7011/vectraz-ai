"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName = "light" | "dark" | "aurora" | "graphite";

export const THEMES: { value: ThemeName; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Clean and bright" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "aurora", label: "Aurora", description: "Indigo & teal" },
  { value: "graphite", label: "Graphite", description: "Warm charcoal" },
];

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "vectrazai-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (stored && THEMES.some((t) => t.value === stored)) {
      setThemeState(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = (next: ThemeName) => setThemeState(next);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
