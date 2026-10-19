"use client";

import { useEffect } from "react";

export function ContactMotion() {
  useEffect(() => {
    const section = document.getElementById("contact");
    if (!section) return;
    const title = section.querySelector<HTMLElement>(".contact-title");
    const stage = section.querySelector<HTMLElement>(".contact-stage");
    if (!title || !stage) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let nearby = false;
    let disposed = false;

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
        section.style.removeProperty("--contact-anchor-offset");
        return;
      }
      const height = window.innerHeight;
      const header = parseFloat(getComputedStyle(section).getPropertyValue("--header-height")) || 0;
      const top = section.getBoundingClientRect().top;
      // Render the current scroll position directly, with no easing or catch-up timer.
      const progress = Math.max(0, Math.min(1, (height - top) / (height - header)));
      // Keep the compressed panel's bottom at the viewport edge as it enters.
      // The grey surface and heading grow together; contact controls retain their size.
      section.style.setProperty("--contact-anchor-offset", `${Math.min(0, header - top)}px`);
      section.style.setProperty("--contact-rise", String(.035 + .965 * progress));
      section.setAttribute("data-contact-motion", "ready");
    };
    const schedule = () => {
      if (nearby || motion.matches) update();
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
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", schedule);
      section.removeAttribute("data-contact-motion");
      for (const property of ["--contact-font-size", "--contact-rise", "--contact-anchor-offset"]) section.style.removeProperty(property);
    };
  }, []);
  return null;
}
