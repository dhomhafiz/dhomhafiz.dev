"use client";
import { useEffect, useRef, useState } from "react";
import { heroVideo } from "@/config/editorial";

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("Video preview.");

  useEffect(() => {
    const media = video.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const permitsVideo = () => !motion.matches && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType ?? "");
    let active = true;
    let visible = true;
    let ready = false;
    let idle: number | undefined;
    let frame = 0;
    const play = () => {
      if (!active || !ready || !permitsVideo() || document.hidden || !visible || media.error) return;
      if (!media.getAttribute("src")) media.src = matchMedia("(max-width: 700px)").matches ? heroVideo.mobileSrc : heroVideo.src;
      void media.play().catch(() => { if (active) setStatus("Autoplay unavailable. Poster shown."); });
    };
    const afterLoad = async () => {
      await Promise.all([poster.current?.decode().catch(() => {}), document.fonts.ready]);
      if (!active) return;
      // Let the prioritised poster and text paint before requesting optional footage.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const start = () => { ready = true; play(); };
          if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 2000 });
          else start();
        });
      });
    };
    if (document.readyState === "complete") void afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    const visibility = () => { if (document.hidden) media.pause(); else play(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) media.pause(); else play(); }, { threshold: .15 });
    observer.observe(media);
    const preference = () => { if (!permitsVideo()) media.pause(); else play(); };
    motion.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      active = false;
      media.pause();
      observer.disconnect();
      cancelAnimationFrame(frame);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.removeEventListener("load", afterLoad);
      motion.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <>
    <link rel="preload" as="image" href={heroVideo.mobilePoster} media="(max-width: 700px)" fetchPriority="high" />
    <link rel="preload" as="image" href={heroVideo.poster} media="(min-width: 701px)" fetchPriority="high" />
    <div className="hero-video" data-playing={playing && !failed || undefined}>
      <picture className={failed ? "hero-video-fallback" : "hero-video-poster"}>
        <source media="(max-width: 700px)" srcSet={heroVideo.mobilePoster} />
        <img ref={poster} src={heroVideo.poster} width={1120} height={630} fetchPriority="high" loading="eager" decoding="async" alt="" />
      </picture>
      <video ref={video} muted playsInline loop preload="none" aria-label={heroVideo.title}
        onPlaying={() => { setPlaying(true); setStatus("Video playing."); }}
        onError={() => { setFailed(true); setStatus("Video unavailable. Poster shown; explore the interactive demo below."); }} />
      <p className="reel-status" role="status">{status}</p>
    </div>
  </>;
}
