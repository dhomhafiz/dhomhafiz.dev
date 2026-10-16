"use client";

import { useEffect, useRef } from "react";
import { editorialServices } from "@/config/editorial";

export function EditorialServices() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = section.current!;
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".service-row"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};

    function configure() {
      dispose();
      if (motion.matches) return;
      root.dataset.motion = "ready";
      let frame = 0;
      const update = () => {
        frame = 0;
        const headerBottom = document.querySelector(".editorial-header")?.getBoundingClientRect().bottom ?? 0;
        const focusLine = headerBottom + (innerHeight - headerBottom) * .45;
        const bounds = rows.map(row => row.getBoundingClientRect());
        let nearest = 0;
        bounds.forEach((rect, i) => {
          if (Math.abs(rect.top + rect.height / 2 - focusLine) < Math.abs(bounds[nearest].top + bounds[nearest].height / 2 - focusLine)) nearest = i;
        });
        rows.forEach((row, i) => {
          row.dataset.active = String(i === nearest);
          row.style.setProperty("--service-progress", String(Math.max(0, Math.min(1, (focusLine - bounds[i].top) / bounds[i].height))));
        });
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.entered = "true"; observer.unobserve(entry.target); }
        });
      }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
      rows.forEach(row => observer.observe(row));
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      update();
      dispose = () => {
        observer.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        cancelAnimationFrame(frame);
        delete root.dataset.motion;
        rows.forEach(row => { delete row.dataset.active; delete row.dataset.entered; row.style.removeProperty("--service-progress"); });
      };
    }

    configure();
    motion.addEventListener("change", configure);
    return () => { dispose(); motion.removeEventListener("change", configure); };
  }, []);

  return <section ref={section} className="editorial-section services-editorial" aria-labelledby="services-heading">
    <div className="services-heading-block"><p className="eyebrow">How I can help</p><h2 id="services-heading">Good design.<br />Built with purpose.</h2><p className="services-intro">From a first impression to a real conversation. I design and build websites that make your next step clear.</p></div>
    <div className="services-sequence">{editorialServices.map((service, i) => <article className="service-row" key={service.title}><span className="service-number">0{i + 1}</span><div><h3>{service.title}</h3><p>{service.text}</p></div></article>)}</div>
  </section>;
}
