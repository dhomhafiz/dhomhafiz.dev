"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// SRP: playback, reduced-motion preference, and media failure are isolated from UI.
export function useBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const userPaused = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    }).connection;
    let loaded = document.readyState === "complete";
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
    const sync = () => {
      cancel();
      const constrained = connection?.saveData || ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
      if (preference.matches || constrained) {
        videoRef.current?.pause();
        setAllowed(false);
        setReady(false);
        return;
      }
      if (!loaded) return;
      // Give the portrait, fonts, and initial content priority over decorative motion.
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setAllowed(true), { timeout: 1500 });
      else timer = setTimeout(() => setAllowed(true), 200);
    };
    const onLoad = () => { loaded = true; sync(); };
    sync();
    window.addEventListener("load", onLoad);
    preference.addEventListener("change", sync);
    connection?.addEventListener("change", sync);
    return () => {
      cancel();
      window.removeEventListener("load", onLoad);
      preference.removeEventListener("change", sync);
      connection?.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!allowed || !video) return;
    let inView = true;
    const syncPlayback = () => {
      if (!inView || document.hidden || userPaused.current) video.pause();
      else void video.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [allowed]);

  const toggle = useCallback(async () => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (!video.paused) { userPaused.current = true; video.pause(); }
    else {
      userPaused.current = false;
      try { await video.play(); } catch { setPlaying(false); }
    }
  }, [failed]);

  return { videoRef, ready, playing, failed, allowed, toggle,
    onReady: () => setReady(true), onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false), onError: () => { setFailed(true); setPlaying(false); },
  };
}
