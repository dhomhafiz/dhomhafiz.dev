"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;
  return <button type="button" aria-label="Back to top" title="Back to top"
    onClick={() => {
      document.getElementById("site-home")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }}
    className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-cyber-cyan/40 bg-cyber-surface/95 text-cyber-cyan shadow-neon-cyan backdrop-blur-md transition-colors hover:bg-cyber-cyan hover:text-cyber-on-accent md:bottom-8 md:right-8">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="m6 11 6-6 6 6M12 5v14" /></svg>
  </button>;
}
