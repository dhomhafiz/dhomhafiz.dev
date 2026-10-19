"use client";

import { useEffect } from "react";

export function ContactMotion() {
  useEffect(() => {
    const section = document.getElementById("contact");
    if (!section) return;
    const title = section.querySelector<HTMLElement>(".contact-title");
    const stage = section.querySelector<HTMLElement>(".contact-stage");
    const titleContainer = title?.parentElement;
    if (!title || !stage || !titleContainer) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let nearby = false;
    let disposed = false;
    let scheduledFrame = 0;

    const fitTitle = () => {
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
        return;
      }
      const height = window.innerHeight;
      const header = parseFloat(getComputedStyle(section).getPropertyValue("--header-height")) || 0;
      const top = section.getBoundingClientRect().top;
      // Render the current scroll position directly, with no easing or catch-up timer.
      const progress = Math.max(0, Math.min(1, (height - top) / (height - header)));
      const mobile = matchMedia("(max-width: 700px)").matches;
      const easedProgress = mobile ? progress ** 2 * (3 - 2 * progress) : progress ** 2;
      // Keep a 24px reveal above the heading while compressing, then expand the
      // grey panel to the top edge as the contact section reaches its final state.
      section.style.setProperty("--contact-anchor-offset", `${Math.min(0, header - top)}px`);
      section.style.setProperty("--contact-title-rise", String(.01 + .99 * easedProgress));
      section.setAttribute("data-contact-motion", "ready");
      const titleTop = titleContainer.getBoundingClientRect().bottom - title.offsetHeight - stage.getBoundingClientRect().top;
      const closeStart = mobile ? .3 : .97;
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
    const observer = new IntersectionObserver(([entry]) => { nearby = entry.isIntersecting; if (nearby) schedule(); }, { rootMargin: "200px 0px" });
    observer.observe(section);
    fitTitle();
    void document.fonts.ready.then(() => { if (!disposed) resize(); });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    motion.addEventListener("change", schedule);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(scheduledFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", schedule);
      section.removeAttribute("data-contact-motion");
      for (const property of ["--contact-font-size", "--contact-rise", "--contact-title-rise", "--contact-anchor-offset"]) section.style.removeProperty(property);
    };
  }, []);
  return null;
}
