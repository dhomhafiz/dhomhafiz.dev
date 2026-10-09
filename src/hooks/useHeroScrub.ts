"use client";

import { useEffect, useRef } from "react";
import { createHeroContentExit } from "@/lib/heroContentExit";
import { createHeroLetterTumble } from "@/lib/heroLetterTumble";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

// One native scroll progress drives the frame and independent content exit.
// No React state updates, smoothing tail, or continuously running RAF loop.
export function useHeroScrub() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const hero = frame?.closest<HTMLElement>(".cinematic-hero");
    const overlay = hero?.querySelector<HTMLElement>(".hero-overlay");
    const stage = hero?.closest<HTMLElement>(".hero-stage");
    if (!frame || !hero || !overlay || !stage) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contentExit = createHeroContentExit(overlay);
    const letterTumble = createHeroLetterTumble(overlay);
    let disposed = false;
    let request = 0;
    let start = 0;
    let distance = 1;
    let coverStart = 0;
    let mobile = false;
    let topClearance = 0;
    let overlayHeight = 0;
    let lastProgress = -1;

    const render = () => {
      request = 0;
      const scroll = window.scrollY - start;
      const progress = preference.matches ? 0 : clamp((scroll - coverStart) / distance);
      if (progress !== lastProgress) {
        contentExit.render(progress, window.innerWidth);
        letterTumble.render(progress, window.innerWidth);
        const endScale = mobile ? 0.94 : 0.9;
        const radius = mobile ? 24 : 40;
        // Bring the top edge below the fixed navigation so its rounded corners
        // are visible while the foreground continues covering the bottom edge.
        const topOffset = topClearance * clamp(progress / 0.3);
        const transform = progress === 0 ? "none" : `translate3d(0, ${topOffset}px, 0) scale(${1 - (1 - endScale) * progress})`;
        frame.style.transform = transform;
        // Mobile reads the tall introduction first, then pins its visible tail.
        // Keep the content attached to the shrinking backdrop during coverage.
        const scale = 1 - (1 - endScale) * progress;
        overlay.style.transform = mobile && progress > 0 ? `scale(${scale})` : "none";
        overlay.style.clipPath = mobile && progress > 0
          ? `inset(${(Math.max(0, overlayHeight - distance) + topOffset) / scale}px 0 0)`
          : "none";
        overlay.style.willChange = mobile && progress > 0 && progress < 1 ? "transform" : "auto";
        // Convert radius to local pixels so the final visible radius matches the target.
        frame.style.borderRadius = `${radius * progress / (1 - (1 - endScale) * progress)}px`;
        frame.style.willChange = progress > 0 && progress < 1 ? "transform" : "auto";
        lastProgress = progress;
      }
    };
    const schedule = () => {
      if (!request) request = requestAnimationFrame(render);
    };
    const measure = () => {
      mobile = window.innerWidth < 768;
      topClearance = (document.querySelector<HTMLElement>(".cinematic-header")?.offsetHeight ?? 0) + 8;
      start = window.scrollY + stage.getBoundingClientRect().top;
      distance = window.innerHeight;
      overlayHeight = overlay.offsetHeight;
      hero.style.setProperty("--hero-pin-top", `${mobile ? Math.min(0, distance - overlayHeight) : 0}px`);
      // Use the actual foreground edge so shrink and cover start together,
      // including the longer portrait-first mobile intro and viewport resizing.
      const content = stage.parentElement?.querySelector<HTMLElement>(".portfolio-content");
      coverStart = content ? window.scrollY + content.getBoundingClientRect().top - start - distance : 0;
      letterTumble.measure();
      lastProgress = -1;
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(overlay);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", measure);
    measure();
    document.fonts.ready.then(() => { if (!disposed) measure(); });

    return () => {
      disposed = true;
      letterTumble.destroy();
      contentExit.destroy();
      cancelAnimationFrame(request);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", measure);
      frame.style.removeProperty("transform");
      frame.style.removeProperty("border-radius");
      frame.style.removeProperty("will-change");
      overlay.style.removeProperty("transform");
      overlay.style.removeProperty("clip-path");
      overlay.style.removeProperty("will-change");
      hero.style.removeProperty("--hero-pin-top");
    };
  }, []);

  return frameRef;
}
