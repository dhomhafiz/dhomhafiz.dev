"use client";
import { useEffect } from "react";

// Keep all service copy server-rendered; fetch animation code only near the section.
export function ServicesMotion() {
  useEffect(() => {
    const root = document.getElementById("services");
    if (!root) return;
    let disposed = false;
    let started = false;
    let near = false;
    let cleanup: (() => void) | undefined;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => {
      if (started || disposed || !near || motion.matches) return;
      started = true;
      void import("@/lib/serviceSequence").then(module => {
        if (!disposed) cleanup = module.initServiceSequence(root);
      }).catch(() => { started = false; });
    };
    const observer = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; start(); }, { rootMargin: "200px 0px" });
    observer.observe(root);
    motion.addEventListener("change", start);
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener("change", start); cleanup?.(); };
  }, []);
  return null;
}
