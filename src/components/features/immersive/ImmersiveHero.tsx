"use client";

import { useGalleryPresentation } from "./GalleryPresentation";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useHeroVideoTransition } from "@/hooks/useHeroVideoTransition";
import { assetPath } from "@/lib/assetPath";
import { useImmersiveJourney } from "./useImmersiveJourney";
import type { GalleryProject } from "@/lib/workProjects";
import { billboardDestinations } from "./routeBillboardSettings";
import { ViewAllProjectsButton } from "./ViewAllProjectsButton";
import { RoutePerformancePanel } from "./RoutePerformancePanel";
import { routeDiagnosticDeviceInfo, routePerformanceDiagnostics, routeWebGLApiAvailability } from "./routePerformanceDiagnostics";

// This boundary owns the optional enhancement; portfolio HTML never depends on it.
const RouteScene = dynamic(() => import("./RouteScene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: (reason: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { this.props.onFailure(error.message); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ImmersiveHero({ projects }: { projects: GalleryProject[] }) {
  const gallery = useGalleryPresentation();
  const [activeBillboard, setActiveBillboard] = useState(-1);
  const project = projects.find(item => item.slug === billboardDestinations[Math.max(0, activeBillboard)]?.projectSlug);
  const [eligible, setEligible] = useState(false);
  const [mobileProfile, setMobileProfile] = useState(false);
  const [deferredDownload, setDeferredDownload] = useState(false);
  const [loadRequested, setLoadRequested] = useState(false);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const onHover = useCallback((slug: string, value: boolean) => setHovered(current => value ? slug : current === slug ? null : current), []);
  const poster = useRef<HTMLImageElement>(null);
  const [posterReady, setPosterReady] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const loadScene = eligible && (!deferredDownload || loadRequested);
  const revealed = loadScene && ready && posterReady && !failed;
  const frame = useHeroVideoTransition(revealed);
  const journey = useImmersiveJourney(frame, revealed && projects.length === billboardDestinations.length, setActiveBillboard, paused);
  const decodePoster = useCallback(() => {
    const image = poster.current;
    if (!image) return;
    void image.decode().then(() => { setPosterFailed(false); setPosterReady(true); },
      () => { setPosterFailed(true); setPosterReady(true); });
  }, []);
  useEffect(() => { if (poster.current?.complete) decodePoster(); }, [decodePoster]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    setShowPerformancePanel(new URLSearchParams(window.location.search).get("perf") === "1");
  }, []);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    // Primary touch input selects initial quality, never GPU eligibility.
    // Fine-pointer desktops retain their existing DPR even in narrow windows.
    const mobile = matchMedia("(pointer: coarse)");
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    };
    const update = () => {
      const allowed = !motion.matches;
      setMobileProfile(mobile.matches);
      // Network hints defer an optional download; they do not measure GPU power.
      const deferred = !!device.connection?.saveData || /(^|-)2g$/.test(device.connection?.effectiveType ?? "");
      setDeferredDownload(deferred);
      setEligible(allowed);
      if (!allowed || (deferred && !loadRequested)) setReady(false);
    };
    const visibility = () => setVisible(!document.hidden && inView);
    let inView = true;
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      visibility();
    });
    if (frame.current) observer.observe(frame.current);
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    device.connection?.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    update();
    visibility();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      device.connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [frame, loadRequested]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !showPerformancePanel) return;
    const diagnostics = routePerformanceDiagnostics();
    if (!diagnostics) return;
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const blockers: string[] = [];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) blockers.push("Reduced-motion preference prevents 3D activation.");
    const deferReasons: string[] = [];
    if (device.connection?.saveData) deferReasons.push("Save-Data preference defers the optional 3D download.");
    if (/(^|-)2g$/.test(device.connection?.effectiveType ?? "")) deferReasons.push("A 2G network hint defers the optional 3D download.");
    diagnostics.updateRuntime({
      eligibility: {
        checked: true,
        eligible,
        blockers,
        deferred: deferredDownload,
        deferReasons,
        loadRequested,
        sceneRequested: loadScene && !!project && !failed,
      },
      capability: routeWebGLApiAvailability(),
      poster: { loaded: posterReady, failed: posterFailed },
      display: revealed ? "3d" : "poster-fallback",
      device: routeDiagnosticDeviceInfo(),
    });
  }, [deferredDownload, eligible, failed, loadRequested, loadScene, posterFailed, posterReady, project, revealed, showPerformancePanel]);

  const onSceneFailure = (reason: string) => {
    if (process.env.NODE_ENV === "development") {
      const diagnostics = routePerformanceDiagnostics();
      diagnostics?.recordError("scene-initialization", reason);
      if (diagnostics) {
        const runtime = diagnostics.report().runtime;
        if (runtime.canvas.rendererState === "pending" || runtime.canvas.rendererState === "not-mounted") {
          diagnostics.setRendererState("failed");
        }
        if (["compiling", "uploading", "waiting-gpu"].includes(runtime.readiness.state)) {
          diagnostics.setReadiness("failed", reason);
        }
      }
    }
    setFailed(true);
    setReady(false);
  };

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
      {loadScene && project && !failed && <SceneBoundary onFailure={onSceneFailure}><RouteScene active={visible && !paused && !gallery.active && posterReady} mobileProfile={mobileProfile} surface={frame} journey={journey} projects={projects} onHover={onHover}
        onReady={() => setReady(true)} onFailure={onSceneFailure} /></SceneBoundary>}
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
    {eligible && deferredDownload && !loadRequested && !failed && <div className="route-scene-consent">
      <p>3D is optional. Load it only if you want the extra download.</p>
      <button type="button" onClick={() => setLoadRequested(true)}>Load 3D scene</button>
    </div>}
    {loadScene && project && !revealed && !failed && <span className="route-loading-label" role="status">Preparing scene&#8230;</span>}
    {revealed && <button className="route-pause" type="button" aria-pressed={paused}
      onClick={() => setPaused(value => !value)}>{paused ? "Resume scene" : "Pause scene"}</button>}
    {process.env.NODE_ENV === "development" && showPerformancePanel && <RoutePerformancePanel />}
  </>;
}
