"use client";

import { Button } from "./Button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <Button variant="secondary" onClick={toggle} disabled={theme === null}
    aria-label={theme === null ? "Change color theme" : `Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    className="!min-h-11 !px-3 text-xs">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      {theme === "dark" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />}
    </svg>
    <span>{theme === null ? "Theme" : theme === "dark" ? "Light" : "Dark"}</span>
  </Button>;
}
