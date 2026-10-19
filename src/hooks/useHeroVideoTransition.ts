"use client";

import { useEffect, useRef } from "react";
import { sectionTransitionFrame } from "@/lib/sectionTransitions";

export function useHeroVideoTransition() {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = frame.current;
    if (!surface) return;
    const header = document.querySelector<HTMLElement>(".editorial-header");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let request = 0;
    let origin = 0;
    let distance = 1;
    let height = 0;
    let headerHeight = 0;
    let headerScrolled = scrollY > 24;
    const render = () => {
      request = 0;
      // Share the existing frame with the header; hysteresis avoids flicker near the top.
      if (scrollY > 32) headerScrolled = true;
      else if (scrollY < 12) headerScrolled = false;
      const headerSurface = headerScrolled ? "scrolled" : "top";
      if (header && header.dataset.surface !== headerSurface) header.dataset.surface = headerSurface;
      // The fixed header now overlays the hero, so the film starts at the page origin.
      const progress = motion.matches ? 0 : Math.max(0, Math.min(1, (scrollY - origin) / distance));
      const { scale, radius } = sectionTransitionFrame(progress, innerWidth < 768);
      // Keep the upper rounded edge below the sticky header as the film scrolls away.
      const top = origin - scrollY + height * (1 - scale) / 2;
      const clearance = headerHeight + 8 * Math.min(1, progress / .3);
      const inset = Math.min(height, Math.max(0, (clearance - top) / scale));
      surface.style.transform = progress === 0 ? "none" : `scale(${scale})`;
      surface.style.clipPath = progress === 0 ? "none" : `inset(${inset}px 0 0 round ${radius}px)`;
      surface.style.willChange = progress > 0 && progress < 1 ? "transform" : "auto";
    };
    const schedule = () => { if (!request) request = requestAnimationFrame(render); };
    const measure = () => {
      // Measure the untransformed layout so resizing never feeds the scale back in.
      const hero = surface.closest<HTMLElement>(".editorial-hero");
      origin = hero ? scrollY + hero.getBoundingClientRect().top : 0;
      height = surface.offsetHeight;
      headerHeight = header?.offsetHeight ?? 0;
      distance = Math.max(1, Math.min(height * .6, innerHeight * .5));
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(surface);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    motion.addEventListener("change", schedule);
    measure();
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      motion.removeEventListener("change", schedule);
      surface.style.removeProperty("transform");
      surface.style.removeProperty("clip-path");
      surface.style.removeProperty("will-change");
      header?.removeAttribute("data-surface");
    };
  }, []);

  return frame;
}
