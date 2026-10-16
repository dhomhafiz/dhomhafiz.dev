"use client";
import { useEffect, useRef, useState } from "react";
import { heroVideo } from "@/config/editorial";

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const intent = useRef(true);
  const visible = useRef(true);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("Video preview.");

  useEffect(() => {
    const media = video.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let active = true;
    intent.current = !motion.matches && !connection?.saveData;
    const play = () => {
      if (!intent.current || document.hidden || !visible.current) return;
      void media.play().catch(() => { if (active) setStatus("Autoplay unavailable. Poster shown."); });
    };
    if (intent.current) { media.src = heroVideo.src; play(); }
    const visibility = () => { if (document.hidden) media.pause(); else play(); };
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; if (!entry.isIntersecting) media.pause(); else play(); }, { threshold: .15 });
    observer.observe(media);
    const reduce = () => { if (motion.matches) { intent.current = false; media.pause(); } };
    motion.addEventListener("change", reduce);
    document.addEventListener("visibilitychange", visibility);
    return () => { active = false; media.pause(); observer.disconnect(); motion.removeEventListener("change", reduce); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  return <div className="hero-video">
    <video ref={video} poster={heroVideo.poster} muted playsInline loop preload="none" aria-label={heroVideo.title}
      onPlaying={() => setStatus("Video playing.")}
      onError={() => { setFailed(true); setStatus("Video unavailable. Poster shown; explore the interactive demo below."); }} />
    {failed && <img className="hero-video-fallback" src={heroVideo.poster} alt={heroVideo.title} />}
    <p className="reel-status" role="status">{status}</p>
  </div>;
}
