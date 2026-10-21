"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { useGalleryPresentation } from "./GalleryPresentation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { routeJourneySettings, type JourneyProgress } from "./routeJourneySettings";
import { billboardDestinations, billboardEntry, viewingBillboard } from "./routeBillboardSettings";

// Actual document scroll is the single input for both manual and link navigation.
// React never renders per scroll frame; the scene reads this persistent ref.
export function useImmersiveJourney(surface: RefObject<HTMLDivElement | null>, enabled: boolean, onBillboardChange: (index: number) => void) {
  const { suspended, bridge } = useGalleryPresentation();
  const journey = useRef<JourneyProgress>({ enabled: false, progress: 0, galleryActive: false, activeBillboard: -1, cameraProgress: 0 });

  useLayoutEffect(() => {
    const hero = surface.current?.closest<HTMLElement>(".immersive-hero");
    const track = hero?.closest<HTMLElement>(".route-journey");
    const works = document.getElementById("works");
    if (!enabled || !hero || !track || !works) return;
    gsap.registerPlugin(ScrollTrigger);
    const copy = hero.querySelector<HTMLElement>(".hero-copy-block");
    const caption = hero.querySelector<HTMLElement>(".route-caption");
    const arrow = hero.querySelector<HTMLElement>(".hero-scroll-arrow");
    const gallery = hero.querySelector<HTMLElement>(".route-gallery-ui");
    const heading = document.getElementById("gallery-heading");
    const originalTabIndex = heading?.getAttribute("tabindex");
    heading?.setAttribute("tabindex", "-1");
    const previousWorksTop = works.getBoundingClientRect().top;
    const layout = track.parentElement!;
    const measure = () => {
      delete track.dataset.journey;
      layout.style.setProperty("--route-hero-height", `${hero.offsetHeight}px`);
      layout.style.setProperty("--route-track-screens", String(1 + routeJourneySettings.scrollScreens));
      track.dataset.journey = "active";
    };
    measure();
    journey.current.enabled = true;
    let navigation: gsap.core.Tween | undefined;
    let restoreFrame = 0;
    let saveTimer = 0;
    let reloadScroll: number | undefined;
    const storageKey = `route-journey:${location.pathname}${location.search}${location.hash}`;
    // Next may replace custom history state while hydrating a full reload.
    // Session storage is only a reload backup; Back/Forward uses its own entry.
    try {
      const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const saved = sessionStorage.getItem(storageKey);
      if (entry?.type === "reload" && saved !== null && Number.isFinite(Number(saved))) reloadScroll = Number(saved);
    } catch { /* Storage restrictions leave native restoration available. */ }
    const stop = () => { navigation?.kill(); navigation = undefined; };
    const destination = (target: HTMLElement) => scrollY + target.getBoundingClientRect().top -
      (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    const journeyEnd = () => scrollY + track.getBoundingClientRect().top + hero.offsetHeight * routeJourneySettings.scrollScreens;
    const galleryDestination = (index = 0) => scrollY + track.getBoundingClientRect().top +
      hero.offsetHeight * routeJourneySettings.scrollScreens * billboardEntry(index);
    const save = () => {
      history.replaceState({ ...history.state, routeJourneyScroll: scrollY }, "", location.href);
      try { sessionStorage.setItem(`route-journey:${location.pathname}${location.search}${location.hash}`, String(scrollY)); }
      catch { /* Storage is optional. */ }
    };

    const update = (progress: number) => {
      if (suspended.current) return;
      journey.current.progress = progress;
      // Release the introduction, while keyboard focus can always restore it.
      const fade = 1 - gsap.utils.clamp(0, 1, progress / (billboardDestinations[0].viewStart * 0.32));
      if (copy) { copy.style.opacity = String(fade); copy.inert = fade === 0; }
      if (caption) caption.style.opacity = String(fade);
      if (arrow) { arrow.style.opacity = String(fade); arrow.inert = fade === 0; }
      const index = scrollY <= journeyEnd() + hero.offsetHeight * 0.15 ? viewingBillboard(progress) : -1;
      const changed = index !== journey.current.activeBillboard;
      const active = index >= 0;
      journey.current.activeBillboard = index;
      if (changed) onBillboardChange(index);
      journey.current.galleryActive = active;
      hero.dataset.gallery = active ? "active" : "inactive";
      if (active) hero.dataset.billboard = billboardDestinations[index].projectSlug;
      else delete hero.dataset.billboard;
      if (gallery) { gallery.inert = !active; gallery.setAttribute("aria-hidden", String(!active)); }
      works.inert = active;
      // Returning to the highway or switching presentations never leaves focus inert.
      if (active && (works.contains(document.activeElement) || (changed && gallery?.contains(document.activeElement)))) heading?.focus({ preventScroll: true });
      else if (!active && gallery?.contains(document.activeElement)) {
        if (scrollY > journeyEnd()) {
          const filmHeading = document.getElementById("works-heading");
          filmHeading?.setAttribute("tabindex", "-1"); filmHeading?.focus({ preventScroll: true });
        } else document.querySelector<HTMLElement>('.editorial-header a[href="#works"]')?.focus({ preventScroll: true });
      }
    };
    const trigger = ScrollTrigger.create({
      trigger: track, start: "top top",
      end: journeyEnd,
      onUpdate: self => update(self.progress),
      onRefresh: self => update(self.progress),
    });
    update(trigger.progress);
    // A refreshed gallery URL can initialize WebGL behind the archive. Seed the
    // same authoritative journey before CameraRig's first frame, without travel.
    const savedGallery = history.state?.routeGalleryReturn;
    if (suspended.current && savedGallery?.progress !== undefined) {
      journey.current.progress = savedGallery.progress;
      journey.current.activeBillboard = savedGallery.billboard ?? -1;
      journey.current.galleryActive = journey.current.activeBillboard >= 0;
      onBillboardChange(journey.current.activeBillboard);
    }

    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      stop();
      if (suspended.current) return;
      if (link.getAttribute("href") !== "#works" || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      event.preventDefault();
      const requested = billboardDestinations.findIndex(item => item.projectSlug === link.dataset.billboard);
      const index = Math.max(0, requested);
      const proxy = { y: scrollY };
      const from = scrollY;
      navigation = gsap.to(proxy, {
        y: galleryDestination(index), duration: routeJourneySettings.navigationSeconds, ease: "power2.inOut",
        onUpdate: () => { scrollTo({ top: proxy.y, behavior: "instant" }); ScrollTrigger.update(); },
        onComplete: () => {
          navigation = undefined;
          if (location.hash !== "#works" || Math.abs(from - scrollY) > 1) {
            history.replaceState({ ...history.state, routeJourneyScroll: from }, "", location.href);
            history.pushState({ routeJourneyScroll: scrollY }, "", "#works");
          }
          heading?.focus({ preventScroll: true });
        },
      });
    };
    const key = (event: KeyboardEvent) => {
      if (["Escape", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) stop();
    };
    // Native hash/history restoration is re-aligned after the enhanced track exists.
    const align = () => {
        if (suspended.current || new URL(location.href).searchParams.get("gallery") === "projects") return;
        let target: HTMLElement | null = null;
        try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* Invalid hash keeps native behavior. */ }
        if (target) scrollTo({ top: location.hash === "#works" ?
          (history.state?.routeJourneyScroll ?? reloadScroll ?? galleryDestination()) : destination(target), behavior: "instant" });
        else if (!location.hash) scrollTo({ top: history.state?.routeJourneyScroll ?? reloadScroll ?? 0, behavior: "instant" });
        reloadScroll = undefined;
        ScrollTrigger.refresh();
        save();
    };
    const restore = () => {
      stop();
      cancelAnimationFrame(restoreFrame);
      restoreFrame = requestAnimationFrame(align);
    };
    bridge.current = {
      capture: () => {
        stop(); clearTimeout(saveTimer);
        return { scroll: scrollY, progress: journey.current.progress, billboard: journey.current.activeBillboard };
      },
      restore: saved => {
        stop(); measure(); ScrollTrigger.refresh();
        const top = saved.progress === undefined ? (location.hash === "#works" ? galleryDestination() :
          location.hash === "#works-film" ? destination(works) : saved.scroll) :
          saved.progress === 1 && saved.billboard === -1 ? saved.scroll : scrollY + track.getBoundingClientRect().top +
          hero.offsetHeight * routeJourneySettings.scrollScreens * saved.progress;
        scrollTo({ top, behavior: "instant" }); ScrollTrigger.update(); update(trigger.progress);
      },
    };
    const resize = () => { if (suspended.current) return; stop(); measure(); ScrollTrigger.refresh(); };
    const persist = () => { if (suspended.current) return; update(trigger.progress); clearTimeout(saveTimer); saveTimer = window.setTimeout(save, 120); };
    const hashChanged = () => { stop(); if (location.hash === "#works") restore(); };
    const show = () => { if (location.hash || history.state?.routeJourneyScroll !== undefined) restore(); else ScrollTrigger.refresh(); };
    document.addEventListener("click", navigate);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("keydown", key);
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", hashChanged);
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", show);
    window.addEventListener("pagehide", save);
    window.addEventListener("scroll", persist, { passive: true });
    // Preserve a user who already scrolled while the GPU was initializing.
    if (location.hash || history.state?.routeJourneyScroll !== undefined || reloadScroll !== undefined) align();
    else {
      if (scrollY > hero.offsetHeight) {
        scrollTo({ top: scrollY + works.getBoundingClientRect().top - previousWorksTop, behavior: "instant" });
        ScrollTrigger.update();
      }
      // A new visit starts a new reload backup, even before its first scroll.
      save();
    }

    return () => {
      bridge.current = null;
      stop();
      cancelAnimationFrame(restoreFrame);
      clearTimeout(saveTimer);
      trigger.kill();
      const oldWorksTop = works.getBoundingClientRect().top;
      const beyondHero = scrollY > hero.offsetHeight;
      const wasGallery = journey.current.galleryActive;
      journey.current.enabled = false;
      journey.current.progress = 0;
      journey.current.galleryActive = false;
      journey.current.activeBillboard = -1;
      journey.current.cameraProgress = 0;
      onBillboardChange(-1);
      works.inert = false;
      delete hero.dataset.gallery;
      delete hero.dataset.billboard;
      if (gallery) { gallery.inert = true; gallery.setAttribute("aria-hidden", "true"); }
      delete track.dataset.journey;
      layout.style.removeProperty("--route-hero-height");
      layout.style.removeProperty("--route-track-screens");
      works.style.removeProperty("--route-arrival");
      [copy, caption, arrow].forEach(element => element?.style.removeProperty("opacity"));
      if (copy) copy.inert = false;
      if (arrow) arrow.inert = false;
      if (originalTabIndex === null) heading?.removeAttribute("tabindex");
      else if (originalTabIndex !== undefined) heading?.setAttribute("tabindex", originalTabIndex);
      if (!suspended.current && wasGallery) {
        scrollTo({ top: destination(works), behavior: "instant" });
        document.getElementById("works-heading")?.focus({ preventScroll: true });
      } else if (!suspended.current && beyondHero) scrollTo({ top: scrollY + works.getBoundingClientRect().top - oldWorksTop, behavior: "instant" });
      document.removeEventListener("click", navigate);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", key);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", hashChanged);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", show);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("scroll", persist);
    };
  }, [enabled, surface, onBillboardChange, suspended, bridge]);
  return journey;
}
