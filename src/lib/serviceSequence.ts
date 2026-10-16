export function initServiceSequence(root: HTMLElement) {
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
}
