"use client";

import { useEffect, useRef, useState } from "react";
import { themeStorageKey, type Theme } from "@/config/theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  const preference = useRef<Theme | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      const stored = localStorage.getItem(themeStorageKey);
      if (stored === "light" || stored === "dark") preference.current = stored;
    } catch { /* System preference still works without storage. */ }
    const apply = () => {
      const next = preference.current ?? (media.matches ? "dark" : "light");
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    const onChange = () => apply();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      preference.current = event.newValue === "light" || event.newValue === "dark" ? event.newValue : null;
      apply();
    };
    apply();
    media.addEventListener("change", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    preference.current = next;
    setTheme(next);
    try { localStorage.setItem(themeStorageKey, next); } catch { /* Switching remains available. */ }
  }

  return { theme, toggle };
}
