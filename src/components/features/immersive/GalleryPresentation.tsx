"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";

export interface GalleryReturn { scroll: number; progress?: number; billboard?: number }
interface JourneyBridge { capture: () => GalleryReturn; restore: (saved: GalleryReturn) => void }
const GalleryContext = createContext<{
  active: boolean;
  host: { current: HTMLDivElement | null };
  suspended: { current: boolean };
  bridge: { current: JourneyBridge | null };
  open: (origin: HTMLElement) => void;
  close: () => void;
} | null>(null);
export const useGalleryPresentation = () => {
  const value = useContext(GalleryContext);
  if (!value) throw new Error("GalleryPresentationProvider is required");
  return value;
};
const isGalleryURL = () => new URL(location.href).searchParams.get("gallery") === "projects";

export function GalleryPresentationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const suspended = useRef(false);
  const bridge = useRef<JourneyBridge | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const snapshot = useRef<GalleryReturn>({ scroll: 0 });
  const host = useRef<HTMLDivElement>(null);
  const running = useRef<gsap.core.Tween | null>(null);
  const release = useRef<(() => void) | null>(null);
  const exiting = useRef(false);
  const finishFrame = useRef(0);

  const present = useCallback(() => {
    const element = host.current;
    if (!element) return;
    running.current?.kill();
    cancelAnimationFrame(finishFrame.current);
    exiting.current = false;
    if (!suspended.current) {
      // A mounted journey is authoritative (including Forward after more scrolling).
      // A fresh document instead restores the snapshot carried by its entry.
      snapshot.current = bridge.current?.capture() ?? history.state?.routeGalleryReturn ?? { scroll: scrollY };
      if (isGalleryURL()) history.replaceState({ ...history.state, routeGalleryReturn: snapshot.current }, "", location.href);
      suspended.current = true;
      // Preserve each ancestor sibling's original inert value, including the skip link.
      const siblings: [HTMLElement, boolean][] = [];
      let branch: HTMLElement = element;
      while (branch.parentElement) {
        for (const sibling of Array.from(branch.parentElement.children)) {
          if (sibling !== branch && sibling instanceof HTMLElement) {
            siblings.push([sibling, sibling.inert]); sibling.inert = true;
          }
        }
        branch = branch.parentElement;
        if (branch === document.body) break;
      }
      const works = element.querySelector<HTMLElement>("#works");
      const worksInert = works?.inert ?? false;
      if (works) works.inert = false;
      const overflow = document.documentElement.style.overflow;
      const gutter = document.documentElement.style.scrollbarGutter;
      const restoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      document.documentElement.style.scrollbarGutter = "stable";
      document.documentElement.style.overflow = "hidden";
      release.current = () => {
        siblings.forEach(([sibling, inert]) => { sibling.inert = inert; });
        if (works) works.inert = bridge.current ? worksInert : false;
        document.documentElement.style.overflow = overflow;
        document.documentElement.style.scrollbarGutter = gutter;
        history.scrollRestoration = restoration;
      };
    }
    setActive(true);
    element.dataset.presentation = "active";
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-modal", "true");
    element.setAttribute("aria-labelledby", "works-heading");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    running.current = gsap.to(element, { opacity: 1, duration: reduced ? 0 : .28, ease: "power2.out",
      onComplete: () => {
        // An early keyboard interaction already placed focus inside the archive.
        const focused = document.activeElement as HTMLElement | null;
        if (!focused || !element.contains(focused) || focused.closest("[inert]") || getComputedStyle(focused).visibility === "hidden") {
          element.querySelector<HTMLButtonElement>(".route-gallery-back")?.focus({ preventScroll: true });
        }
      } });
  }, []);

  const dismiss = useCallback(() => {
    const element = host.current;
    if (!element || !suspended.current) return;
    exiting.current = true;
    running.current?.kill();
    cancelAnimationFrame(finishFrame.current);
    running.current = gsap.to(element, { opacity: 0,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : .22,
      onComplete: () => {
        // Let history traversal finish before restoring auto scroll restoration.
        // This matters for an immediate reduced-motion dismissal during popstate.
        finishFrame.current = requestAnimationFrame(() => {
          release.current?.(); release.current = null;
          delete element.dataset.presentation;
          element.removeAttribute("role"); element.removeAttribute("aria-modal"); element.removeAttribute("aria-labelledby");
          element.style.removeProperty("opacity");
          suspended.current = false;
          bridge.current?.restore(snapshot.current);
          if (!bridge.current) {
            const works = document.getElementById("works");
            const top = (snapshot.current.progress !== undefined || !origin.current) && works ?
              scrollY + works.getBoundingClientRect().top - (parseFloat(getComputedStyle(works).scrollMarginTop) || 0) : snapshot.current.scroll;
            scrollTo({ top, behavior: "instant" });
          }
          setActive(false);
          exiting.current = false;
          const target = origin.current?.isConnected && !origin.current.closest("[inert]") ? origin.current :
            document.querySelector<HTMLElement>('.route-gallery-ui:not([inert]) .route-gallery-all-projects') ??
            (bridge.current && (!location.hash || snapshot.current.billboard === -1) ? document.querySelector<HTMLElement>('.editorial-header a[href="#works"]') : document.getElementById("works-heading"));
          target?.focus({ preventScroll: true });
        });
      } });
  }, []);

  const open = useCallback((control: HTMLElement) => {
    if (suspended.current) return;
    origin.current = control;
    const saved = bridge.current?.capture() ?? { scroll: scrollY };
    history.replaceState({ ...history.state, routeJourneyScroll: saved.scroll }, "", location.href);
    const url = new URL(location.href); url.searchParams.set("gallery", "projects");
    history.pushState({ ...history.state, routeGalleryEntry: true, routeGalleryReturn: saved }, "", url);
    present();
  }, [present]);
  const close = useCallback(() => {
    if (!suspended.current || exiting.current) return;
    exiting.current = true;
    if (history.state?.routeGalleryEntry && isGalleryURL()) history.back();
    else {
      const url = new URL(location.href); url.searchParams.delete("gallery");
      history.replaceState({ ...history.state, routeGalleryEntry: false }, "", url);
      dismiss();
    }
  }, [dismiss]);

  useEffect(() => {
    const sync = () => { if (isGalleryURL()) present(); else dismiss(); };
    const key = (event: KeyboardEvent) => {
      if (!suspended.current) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === "Tab") {
        const controls = Array.from(host.current?.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]') ?? [])
          .filter(item => !item.closest('[inert]') && !item.matches(":disabled") && item.getClientRects().length && getComputedStyle(item).visibility !== "hidden");
        const first = controls[0], last = controls.at(-1);
        if (!host.current?.contains(document.activeElement)) { event.preventDefault(); first?.focus({ preventScroll: true }); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus({ preventScroll: true }); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus({ preventScroll: true }); }
      }
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("pageshow", sync);
    document.addEventListener("keydown", key, true);
    sync();
    return () => {
      running.current?.kill(); cancelAnimationFrame(finishFrame.current);
      release.current?.(); suspended.current = false;
      window.removeEventListener("popstate", sync); window.removeEventListener("pageshow", sync);
      document.removeEventListener("keydown", key, true);
    };
  }, [close, dismiss, present]);

  return <GalleryContext.Provider value={{ active, host, suspended, bridge, open, close }}>
    {children}
  </GalleryContext.Provider>;
}

// The host lives in the original document flow so #works and #works-film stay valid.
export function GalleryPresentation({ children }: { children: ReactNode }) {
  const { host, close } = useGalleryPresentation();
  return <div ref={host} className="route-gallery-presentation">
    <button className="route-gallery-back" type="button" onClick={close}>← Back to 3D Experience</button>
    {children}
  </div>;
}
