"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useHeroVideoTransition } from "@/hooks/useHeroVideoTransition";
import { assetPath } from "@/lib/assetPath";
import { useImmersiveJourney } from "./useImmersiveJourney";
import type { GalleryProject } from "@/lib/workProjects";
import { billboardDestinations } from "./routeBillboardSettings";
import { ViewAllProjectsButton } from "./ViewAllProjectsButton";

// This boundary owns the optional enhancement; portfolio HTML never depends on it.
const RouteScene = dynamic(() => import("./RouteScene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ImmersiveHero({ projects }: { projects: GalleryProject[] }) {
  const [activeBillboard, setActiveBillboard] = useState(-1);
  const project = projects.find(item => item.slug === billboardDestinations[Math.max(0, activeBillboard)]?.projectSlug);
  const [eligible, setEligible] = useState(false);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const onHover = useCallback((slug: string, value: boolean) => setHovered(current => value ? slug : current === slug ? null : current), []);
  const poster = useRef<HTMLImageElement>(null);
  const [posterReady, setPosterReady] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const revealed = eligible && ready && posterReady && !failed;
  const frame = useHeroVideoTransition(revealed);
  const journey = useImmersiveJourney(frame, revealed && projects.length === billboardDestinations.length, setActiveBillboard);
  const decodePoster = useCallback(() => {
    const image = poster.current;
    if (!image) return;
    void image.decode().then(() => { setPosterFailed(false); setPosterReady(true); },
      () => { setPosterFailed(true); setPosterReady(true); });
  }, []);
  useEffect(() => { if (poster.current?.complete) decodePoster(); }, [decodePoster]);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const smallTouch = matchMedia("(max-width: 900px) and (pointer: coarse)");
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    };
    const update = () => {
      const constrained = smallTouch.matches || (device.deviceMemory ?? 8) <= 4 ||
        (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
        device.connection?.saveData || /(^|-)2g$/.test(device.connection?.effectiveType ?? "");
      const allowed = !motion.matches && !constrained;
      setEligible(allowed);
      if (!allowed) setReady(false);
    };
    const visibility = () => setVisible(!document.hidden && inView);
    let inView = true;
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      visibility();
    });
    if (frame.current) observer.observe(frame.current);
    motion.addEventListener("change", update);
    smallTouch.addEventListener("change", update);
    device.connection?.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    update();
    visibility();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      smallTouch.removeEventListener("change", update);
      device.connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [frame]);

  return <>
    <div ref={frame} className="route-surface" aria-hidden="true" data-scene={revealed ? "ready" : "fallback"}>
      <div className="route-fallback" data-poster-failed={posterFailed || undefined}>
        <picture>
          <source media="(max-width: 700px)" srcSet={assetPath("/images/route-666-placeholder-mobile.webp")} />
          <img ref={poster} src={assetPath("/images/route-666-placeholder-desktop.webp")} width={1440} height={1000}
            alt="" fetchPriority="high" loading="eager" decoding="async" onLoad={decodePoster}
            onError={() => { setPosterFailed(true); setPosterReady(true); }} />
        </picture>
      </div>
      {eligible && project && !failed && <SceneBoundary onFailure={() => setFailed(true)}><RouteScene active={visible && !paused && posterReady} surface={frame} journey={journey} projects={projects} onHover={onHover}
        onReady={() => setReady(true)} onFailure={() => { setFailed(true); setReady(false); }} /></SceneBoundary>}
      <div className="route-scrim" />
    </div>
    {project && <div className="route-gallery-ui" inert aria-hidden="true" data-hovered={hovered === project.slug || undefined}>
      <div className="route-gallery-heading"><p>Selected Works / Roadside billboard</p><h2 id="gallery-heading" tabIndex={-1}>{project.title}</h2><p>{project.category}</p></div>
      <div className="route-gallery-actions"><a className="route-gallery-project" href={project.href}>View {project.title} case study <span aria-hidden="true">&#8599;</span></a>
        <ViewAllProjectsButton />
        {activeBillboard > 0 && <a href="#works" data-billboard={billboardDestinations[activeBillboard - 1].projectSlug}>Previous project</a>}
        {activeBillboard >= 0 && activeBillboard < billboardDestinations.length - 1 && <a href="#works" data-billboard={billboardDestinations[activeBillboard + 1].projectSlug}>Next project</a>}
        <span>Scroll to continue along the highway</span></div>
    </div>}
    {eligible && project && !revealed && !failed && <span className="route-loading-label" role="status">Preparing scene&#8230;</span>}
    {revealed && <button className="route-pause" type="button" aria-pressed={paused}
      onClick={() => setPaused(value => !value)}>{paused ? "Resume scene" : "Pause scene"}</button>}
  </>;
}
