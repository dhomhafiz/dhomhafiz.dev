"use client";

import { useEffect } from "react";

export function ContactMotion() {
  useEffect(() => {
    const section = document.getElementById("contact");
    if (!section) return;
    const title = section.querySelector<HTMLElement>(".contact-title");
    const stage = section.querySelector<HTMLElement>(".contact-stage");
    const titleContainer = title?.parentElement;
    const vector = title?.querySelector<SVGSVGElement>(".contact-title-vector");
    const vectorText = vector?.querySelector("text");
    if (!title || !stage || !titleContainer) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 700px)");
    let nearby = false;
    let disposed = false;
    let scheduledFrame = 0;
    let fittedWidth = 0;
    let mobileInkHeight = 0;
    let mobileViewportHeight = 0;

    const fitTitle = (force = false) => {
      if (!force && fittedWidth === stage.clientWidth) return;
      fittedWidth = stage.clientWidth;
      mobileInkHeight = 0;
      mobileViewportHeight = 0;
      // Fit native Anton glyphs at up to 628px; never stretch their proportions.
      section.style.setProperty("--contact-font-size", "628px");
      const width = title.offsetWidth;
      const available = stage.clientWidth * .96;
      section.style.setProperty("--contact-font-size", `${Math.min(628, 628 * available / width)}px`);
    };
    const update = () => {
      if (motion.matches) {
        section.removeAttribute("data-contact-motion");
        section.style.removeProperty("--contact-rise");
        section.style.removeProperty("--contact-title-rise");
        section.style.removeProperty("--contact-anchor-offset");
        section.style.removeProperty("--contact-vector-height");
        return;
      }
      if (mobile.matches && vector && vectorText) {
        section.setAttribute("data-contact-motion", "ready");
        const header = parseFloat(getComputedStyle(section).getPropertyValue("--header-height")) || 0;
        if (!mobileInkHeight) {
          const bounds = vectorText.getBBox();
          if (bounds.width && bounds.height) {
            vector.setAttribute("viewBox", `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
            mobileInkHeight = bounds.height * parseFloat(getComputedStyle(title).fontSize) / 628;
            mobileViewportHeight = stage.clientHeight + header;
          }
        }
        const height = mobileViewportHeight || stage.clientHeight + header;
        // Begin when the heading baseline enters the screen so the squash is
        // visible, rather than finishing while the heading is still offscreen.
        const progress = Math.max(0, Math.min(1, (height - title.getBoundingClientRect().bottom) / Math.max(1, mobileInkHeight * 2)));
        const release = progress * progress * (3 - 2 * progress);
        const pixels = window.devicePixelRatio || 1;
        const inkHeight = Math.round(mobileInkHeight * (.025 + .975 * release) * pixels) / pixels;
        // Resize the SVG viewport so the font is drawn as vectors at its displayed
        // height, with no scaled text layer or changing heading layout.
        section.style.setProperty("--contact-vector-height", `${Math.max(1 / pixels, inkHeight)}px`);
        return;
      }
      const height = window.innerHeight;
      const header = parseFloat(getComputedStyle(section).getPropertyValue("--header-height")) || 0;
      const top = section.getBoundingClientRect().top;
      // Render the current scroll position directly, with no easing or catch-up timer.
      // Native anchor scrolling rounds fractional section positions to pixels.
      // Finish within that last pixel even when the reel above has a fluid height.
      const progress = top - header <= 1 ? 1 : Math.max(0, Math.min(1, (height - top) / (height - header)));
      const easedProgress = progress ** 2;
      // Keep a 24px reveal above the heading while compressing, then expand the
      // grey panel to the top edge as the contact section reaches its final state.
      section.style.setProperty("--contact-anchor-offset", `${Math.min(0, header - top)}px`);
      section.style.setProperty("--contact-title-rise", String(.01 + .99 * easedProgress));
      section.setAttribute("data-contact-motion", "ready");
      const titleTop = titleContainer.getBoundingClientRect().bottom - title.offsetHeight - stage.getBoundingClientRect().top;
      const closeStart = .97;
      const gapCloseProgress = Math.max(0, Math.min(1, (progress - closeStart) / (1 - closeStart)));
      const easedGapClose = gapCloseProgress ** 2 * (3 - 2 * gapCloseProgress);
      const riseForTitleGap = 1 - (titleTop - 24) / stage.clientHeight;
      const panelRise = riseForTitleGap + (1 - riseForTitleGap) * easedGapClose;
      section.style.setProperty("--contact-rise", String(Math.max(0, Math.min(1, panelRise))));
    };
    const schedule = () => {
      if (scheduledFrame || (!nearby && !motion.matches)) return;
      scheduledFrame = requestAnimationFrame(() => {
        scheduledFrame = 0;
        update();
      });
    };
    const resize = () => { fitTitle(); schedule(); };
    const scroll = () => schedule();
    const observer = new IntersectionObserver(([entry]) => { nearby = entry.isIntersecting; if (nearby) schedule(); }, { rootMargin: "200px 0px" });
    observer.observe(section);
    fitTitle();
    void document.fonts.ready.then(() => { if (!disposed) { fitTitle(true); schedule(); } });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    mobile.addEventListener("change", resize);
    motion.addEventListener("change", schedule);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(scheduledFrame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      mobile.removeEventListener("change", resize);
      motion.removeEventListener("change", schedule);
      section.removeAttribute("data-contact-motion");
      for (const property of ["--contact-font-size", "--contact-rise", "--contact-title-rise", "--contact-anchor-offset", "--contact-vector-height"]) section.style.removeProperty(property);
    };
  }, []);
  return null;
}
