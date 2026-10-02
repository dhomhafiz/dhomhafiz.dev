"use client";

import { VideoPlayer } from "@/components/common/VideoPlayer";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import { useHeroScrub } from "@/hooks/useHeroScrub";
import type { VideoSource } from "@/types/portfolio";

// DIP/ISP: receives only a media contract; never imports the local content adapter.
export function HeroBackdrop({ sources, poster }: { sources: readonly VideoSource[]; poster?: string }) {
  const playback = useBackgroundVideo();
  const frameRef = useHeroScrub();
  return <div ref={frameRef} className="hero-media pointer-events-none">
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-fallback absolute inset-0" />
      {poster && <img src={poster} alt="" width={1280} height={676} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-[var(--hero-video-opacity)]" />}
      {!playback.failed && <VideoPlayer
        ref={playback.videoRef} sources={playback.allowed ? sources : []} poster={poster} muted autoPlay loop playsInline preload="none"
        tabIndex={-1} onCanPlay={playback.onReady} onPlay={playback.onPlay}
        onPause={playback.onPause} onError={playback.onError}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playback.ready ? "opacity-[var(--hero-video-opacity)]" : "opacity-0"}`}
      />}
      <div className="hero-scrim absolute inset-0" />
    </div>
  </div>;
}
