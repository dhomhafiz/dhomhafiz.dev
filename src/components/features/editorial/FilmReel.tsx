"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type MouseEvent } from "react";
import { workHref, type WorkProject } from "@/lib/workProjects";

const positionKey = "dhomhafiz-film-frame";

export function FilmReel({ projects }: { projects: readonly WorkProject[] }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState<number | null>(null);
  const dragging = useRef<{ id: number; x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const suppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (index: number) => {
    const reel = viewport.current;
    const cell = reel?.querySelector<HTMLElement>(".film-cell");
    if (!reel || !cell) return;
    const next = Math.max(0, Math.min(projects.length - 1, index));
    reel.scrollTo({ left: next * cell.offsetWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setRevealed(null);
  };

  useEffect(() => {
    const reel = viewport.current;
    if (!reel) return;
    let request = 0;
    let current = 0;
    let saved = "";
    try { saved = sessionStorage.getItem(positionKey) ?? ""; } catch { /* Storage is optional. */ }
    const cell = reel.querySelector<HTMLElement>(".film-cell");
    if (cell) {
      current = Math.max(0, projects.findIndex(p => p.slug === saved));
      reel.scrollLeft = current * cell.offsetWidth;
      setActive(current);
    }
    const resize = new ResizeObserver(() => {
      if (dragging.current) return;
      const cell = reel.querySelector<HTMLElement>(".film-cell");
      if (cell) reel.scrollTo({ left: current * cell.offsetWidth, behavior: "instant" });
    });
    resize.observe(reel);
    const scroll = () => {
      if (request) return;
      request = requestAnimationFrame(() => {
        request = 0;
        const cell = reel.querySelector<HTMLElement>(".film-cell");
        if (!cell) return;
        const index = Math.max(0, Math.min(projects.length - 1, Math.round(reel.scrollLeft / cell.offsetWidth)));
        if (index !== current) {
          current = index;
          setActive(index);
          setRevealed(value => value === index ? value : null);
        }
        try { sessionStorage.setItem(positionKey, projects[index].slug); } catch { /* Native Back still restores scroll. */ }
      });
    };
    const outside = (event: globalThis.PointerEvent) => {
      const expanded = root.current?.querySelector('.film-window[data-revealed="true"]');
      if (expanded && !expanded.contains(event.target as Node)) setRevealed(null);
    };
    const resetTransition = () => {
      reel.querySelectorAll<HTMLElement>(".film-image").forEach(image => image.style.removeProperty("view-transition-name"));
      setRevealed(null);
    };
    reel.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("pointerdown", outside);
    window.addEventListener("pageshow", resetTransition);
    return () => {
      cancelAnimationFrame(request);
      resize.disconnect();
      reel.removeEventListener("scroll", scroll);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("pageshow", resetTransition);
      if (suppressTimer.current) clearTimeout(suppressTimer.current);
    };
  }, [projects]);

  const dismiss = (index: number) => {
    setRevealed(null);
    root.current?.querySelector<HTMLButtonElement>(`[data-reveal="${index}"]`)?.focus({ preventScroll: true });
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".film-information")) {
      if (event.key === "Escape" && revealed !== null) { event.preventDefault(); dismiss(revealed); }
      return;
    }
    if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : active + (event.key === "ArrowRight" ? 1 : -1);
      goTo(index);
      if ((event.target as HTMLElement).matches("[data-reveal]")) root.current?.querySelector<HTMLButtonElement>(`[data-reveal="${Math.max(0, Math.min(projects.length - 1, index))}"]`)?.focus({ preventScroll: true });
    }
    if (event.key === "Escape" && revealed !== null) { event.preventDefault(); dismiss(revealed); }
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as HTMLElement).closest("a, .film-close")) return;
    dragging.current = { id: event.pointerId, x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
    suppressClick.current = false;
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragging.current;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 6 && !drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
      setRevealed(null);
    }
    if (drag.moved) {
      event.preventDefault(); suppressClick.current = true;
      event.currentTarget.scrollLeft = drag.scroll - delta;
    }
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragging.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragging.current = null;
    delete event.currentTarget.dataset.dragging;
    if (drag.moved) {
      const cell = event.currentTarget.querySelector<HTMLElement>(".film-cell");
      if (cell) goTo(Math.round(event.currentTarget.scrollLeft / cell.offsetWidth));
      if (suppressTimer.current) clearTimeout(suppressTimer.current);
      suppressTimer.current = setTimeout(() => { suppressClick.current = false; }, 250);
    }
  };
  const enterProject = (event: MouseEvent<HTMLAnchorElement>, item: WorkProject) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const image = event.currentTarget.closest(".film-cell")?.querySelector<HTMLElement>(".film-image");
    if (image && !matchMedia("(prefers-reduced-motion: reduce)").matches) image.style.viewTransitionName = `project-${item.slug}`;
    try { sessionStorage.setItem(positionKey, item.slug); } catch { /* Navigation works without storage. */ }
    // Keep the real anchor: native shared-element enhancement, reliable Back,
    // and ordinary navigation when animation APIs or JavaScript are unavailable.
  };

  return <div ref={root} className="film-reel" role="region" aria-roledescription="carousel" aria-label="Selected works film reel" onKeyDown={keyboard}>
    <div className="film-viewport" ref={viewport} id="project-film-viewport" tabIndex={0}
      aria-label="Project frames. Swipe or use the left and right arrow keys."
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}
      onPointerLeave={() => { if (dragging.current && !dragging.current.moved) dragging.current = null; }}
      onDragStart={event => event.preventDefault()}
      onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <div className="film-track">
        {projects.map((item, index) => {
          const number = String(index + 1).padStart(2, "0");
          const expanded = revealed === index;
          const image = item.project.image;
          return <article key={item.slug} className="film-cell" role="group" aria-roledescription="slide"
            aria-label={`${index + 1} of ${projects.length}: ${item.title}`} data-active={active === index}>
            <div className="film-edge film-edge-top" aria-hidden="true"><span>DH / SELECTED WORK</span><span>35MM · {number}</span></div>
            <div className={`film-window ${item.slug === "still-dental" ? "film-dental" : ""}`} data-revealed={expanded}
              onPointerEnter={event => { if (event.pointerType === "mouse" && !dragging.current) setRevealed(index); }}
              onPointerLeave={event => { if (event.pointerType === "mouse" && !event.currentTarget.contains(document.activeElement)) setRevealed(null); }}
              onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setRevealed(null); }}>
              <img className="film-image" src={image.src} srcSet={image.srcSet} sizes="(max-width: 700px) 84vw, (max-width: 1474px) 76vw, 1120px"
                width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" draggable={false} />
              <button type="button" className="film-reveal" data-reveal={index} aria-expanded={expanded} aria-controls={`film-details-${item.slug}`}
                onClick={() => setRevealed(index)}>
                <span className="film-caption"><span>{number} / {item.title}</span><span aria-hidden="true">+</span></span>
                <span className="sr-only">Show project information</span>
              </button>
              <div id={`film-details-${item.slug}`} className="film-information" inert={!expanded} aria-hidden={!expanded}>
                <button type="button" className="film-close" aria-label={`Close ${item.title} information`} onClick={() => dismiss(index)}>×</button>
                <div className="film-information-copy">
                  <p className="film-category">{item.category}</p><h3>{item.title}</h3>
                  <p className="film-location">{item.project.location}</p>
                  <p>{item.project.description}</p>
                  <ul aria-label="Project technologies">{item.project.technologies.map(tag => <li key={tag}>{tag}</li>)}</ul>
                  {image.credit && image.sourceUrl && <p className="film-credit">Image: <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.credit}<span className="sr-only"> (opens in a new tab)</span></a></p>}
                </div>
                <a className="film-project-link" href={workHref(item.slug)} onClick={event => enterProject(event, item)}>View Project <span aria-hidden="true">↗</span><span className="sr-only">: {item.title}</span></a>
              </div>
            </div>
            <div className="film-edge film-edge-bottom" aria-hidden="true"><span>{number} <span className="film-marker">▴</span></span><span>DHOMHAFIZ.DEV / {number}A</span></div>
          </article>;
        })}
      </div>
    </div>
    <div className="film-toolbar">
      <p className="film-hint"><span className="film-desktop-hint">Drag to explore</span><span className="film-mobile-hint">Swipe to explore</span> <span aria-hidden="true">↔</span><span className="film-touch-hint"> / Tap a frame for details</span></p>
      <p className="film-counter" aria-live="polite" aria-atomic="true"><span>{String(active + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")}<span className="sr-only"> — {projects[active]?.title}</span></p>
      <div className="film-buttons"><button type="button" aria-label="Previous project" aria-controls="project-film-viewport" disabled={active === 0} onClick={() => goTo(active - 1)}>←</button><button type="button" aria-label="Next project" aria-controls="project-film-viewport" disabled={active === projects.length - 1} onClick={() => goTo(active + 1)}>→</button></div>
    </div>
    <noscript><div className="film-noscript">{projects.map(item => <a key={item.slug} href={workHref(item.slug)}>{item.title} ↗</a>)}</div></noscript>
  </div>;
}
