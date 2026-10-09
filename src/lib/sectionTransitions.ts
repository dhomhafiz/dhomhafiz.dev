import { navigateToSection } from "./sectionNavigation";

export interface SectionTransitionProfile {
  desktopScale: number;
  mobileScale: number;
  desktopRadius: number;
  mobileRadius: number;
}

export const sectionTransitionProfile: Readonly<SectionTransitionProfile> = {
  desktopScale: .96, mobileScale: .98, desktopRadius: 32, mobileRadius: 20,
};

type Entry = {
  stage: HTMLElement;
  panel: HTMLElement;
  frame: HTMLElement;
  profile: Readonly<SectionTransitionProfile>;
  start: number;
  height: number;
  progress: number;
};

// One scheduler owns browser events; components only register their surfaces.
export function createSectionTransitionController() {
  const entries = new Set<Entry>();
  let observer: ResizeObserver | undefined;
  let preference: MediaQueryList | undefined;
  let raf = 0;
  let dirty = true;
  let viewport = 0;
  let clearance = 0;
  let initialHashPending = false;

  function scrollToTarget(hash: string, behavior: ScrollBehavior) {
    let target: HTMLElement | null;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return false; }
    if (!target) return false;
    // Feature components retain ownership of their internal anchor behaviors.
    const entry = [...entries].find(item => item.frame.firstElementChild === target);
    if (!entry) return false;
    navigateToSection(target, behavior);
    return true;
  }
  function navigate(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || !scrollToTarget(link.hash, preference?.matches ? "instant" : "smooth")) return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    document.getElementById(decodeURIComponent(link.hash.slice(1)))?.focus({ preventScroll: true });
  }
  function hashChanged() { scrollToTarget(location.hash, preference?.matches ? "instant" : "smooth"); }

  function render() {
    raf = 0;
    const reduced = preference?.matches;
    if (dirty) {
      viewport = window.innerHeight;
      clearance = (document.querySelector<HTMLElement>(".cinematic-header")?.offsetHeight ?? 0) + 8;
      for (const entry of entries) {
        entry.height = entry.frame.offsetHeight;
        entry.start = window.scrollY + entry.stage.getBoundingClientRect().top;
        entry.panel.style.top = `${Math.min(0, viewport - entry.height)}px`;
        entry.progress = -1;
      }
      dirty = false;
    }
    const mobile = window.innerWidth < 768;
    for (const entry of entries) {
      // A tall section is read in normal flow before its bottom pins.
      const rawProgress = reduced ? 0 : Math.max(0, Math.min(1,
        (window.scrollY - entry.start - entry.height + viewport) / viewport));
      const progress = rawProgress < .001 ? 0 : rawProgress > .999 ? 1 : rawProgress;
      if (progress === entry.progress) continue;
      entry.progress = progress;
      const scale = 1 - (1 - (mobile ? entry.profile.mobileScale : entry.profile.desktopScale)) * progress;
      const radius = (mobile ? entry.profile.mobileRadius : entry.profile.desktopRadius) * progress / scale;
      const inset = Math.max(0, entry.height - viewport) + clearance * Math.min(1, progress / .3);
      entry.frame.style.transform = progress === 0 ? "none" : `scale(${scale})`;
      entry.frame.style.clipPath = progress === 0 ? "none" : `inset(${inset}px 0 0 round ${radius}px)`;
      entry.frame.style.willChange = progress > 0 && progress < 1 ? "transform" : "auto";
    }
    if (initialHashPending) {
      initialHashPending = false;
      scrollToTarget(location.hash, "instant");
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(render); }
  function measure() { dirty = true; schedule(); }
  function start() {
    preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    initialHashPending = Boolean(location.hash);
    observer = new ResizeObserver(measure);
    // Changes in the hero, filters or FAQ can move every following stage.
    const main = document.getElementById("main");
    if (main) observer.observe(main);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("click", navigate);
    window.addEventListener("hashchange", hashChanged);
    preference.addEventListener("change", measure);
  }
  function stop() {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    document.removeEventListener("click", navigate);
    window.removeEventListener("hashchange", hashChanged);
    preference?.removeEventListener("change", measure);
    observer?.disconnect();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  return {
    register(stage: HTMLElement, panel: HTMLElement, frame: HTMLElement, profile: Readonly<SectionTransitionProfile>) {
      if (!entries.size) start();
      const entry: Entry = { stage, panel, frame, profile, start: 0, height: 0, progress: -1 };
      entries.add(entry);
      observer?.observe(frame);
      measure();
      return () => {
        observer?.unobserve(frame);
        entries.delete(entry);
        panel.style.removeProperty("top");
        frame.style.removeProperty("transform");
        frame.style.removeProperty("clip-path");
        frame.style.removeProperty("will-change");
        if (!entries.size) stop();
      };
    },
  };
}
