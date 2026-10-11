"use client";

import { useEffect, useRef } from "react";
import { sectionTransitionProfile } from "@/lib/sectionTransitions";

// Native document scrolling drives only the two-panel opening sequence.
export function useHeroScrub() {
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = frameRef.current?.closest<HTMLElement>(".cinematic-hero");
    const stage = hero?.closest<HTMLElement>(".hero-stage");
    const track = stage?.querySelector<HTMLElement>(".hero-intro-track");
    const viewport = stage?.querySelector<HTMLElement>(".hero-intro-viewport");
    const overlay = hero?.querySelector<HTMLElement>(".hero-overlay");
    const intro = stage?.querySelector<HTMLElement>(".introduction");
    const heroFrame = hero?.querySelector<HTMLElement>(".hero-horizontal-frame");
    if (!hero || !stage || !track || !viewport || !overlay || !intro || !heroFrame) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let request = 0;
    let start = 0;
    let distance = 1;
    let disposed = false;
    let clearance = 0;
    const render = () => {
      request = 0;
      const progress = preference.matches ? 0 : Math.max(0, Math.min(1, (scrollY - start) / distance));
      track.style.transform = preference.matches ? "none" : `translate3d(${-progress * viewport.clientWidth}px, 0, 0)`;
      const mobile = window.innerWidth < 768;
      const scale = 1 - (1 - (mobile ? sectionTransitionProfile.mobileScale : sectionTransitionProfile.desktopScale)) * progress;
      const radius = (mobile ? sectionTransitionProfile.mobileRadius : sectionTransitionProfile.desktopRadius) * progress / scale;
      heroFrame.style.transform = progress === 0 ? "none" : `scale(${scale})`;
      heroFrame.style.clipPath = progress === 0 ? "none" : `inset(${clearance * Math.min(1, progress / .3)}px 0 0 round ${radius}px)`;
      heroFrame.style.willChange = progress > 0 && progress < 1 ? "transform" : "auto";
      // Offscreen panels must not capture keyboard focus during the scrub.
      hero.inert = !preference.matches && progress === 1;
      intro.inert = !preference.matches && progress < 1;
    };
    const schedule = () => { if (!request) request = requestAnimationFrame(render); };
    const measure = () => {
      // Size the pin from the viewport, never the combined unenhanced panels.
      const height = window.innerHeight;
      const viewportHeight = window.innerHeight;
      distance = viewportHeight * (innerWidth < 768 ? .75 : 1);
      clearance = (document.querySelector<HTMLElement>(".cinematic-header")?.offsetHeight ?? 0) + 8;
      stage.style.setProperty("--opening-height", `${height}px`);
      stage.style.setProperty("--opening-pin-top", "0px");
      stage.style.setProperty("--opening-distance", `${distance}px`);
      const flowStage = stage.closest<HTMLElement>(".section-transition-stage") ?? stage;
      start = scrollY + flowStage.getBoundingClientRect().top;
      stage.dataset.horizontalReady = "true";
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(overlay);
    observer.observe(intro);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", measure);
    measure();
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(request);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", measure);
      delete stage.dataset.horizontalReady;
      track.style.removeProperty("transform");
      heroFrame.style.removeProperty("transform");
      heroFrame.style.removeProperty("clip-path");
      heroFrame.style.removeProperty("will-change");
      hero.inert = intro.inert = false;
    };
  }, []);
  return frameRef;
}
