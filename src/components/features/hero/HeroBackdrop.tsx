"use client";

import { VideoPlayer } from "@/components/common/VideoPlayer";
import { Button } from "@/components/common/Button";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import type { VideoSource } from "@/types/portfolio";

// DIP/ISP: receives only a media contract; never imports the local content adapter.
export function HeroBackdrop({ sources, poster }: { sources: readonly VideoSource[]; poster?: string }) {
  const playback = useBackgroundVideo();
  return <>
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-fallback absolute inset-0" />
      {poster && <img src={poster} alt="" width={1280} height={676} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-[var(--hero-video-opacity)]" />}
      {playback.allowed && !playback.failed && <VideoPlayer
        ref={playback.videoRef} sources={sources} muted autoPlay loop playsInline preload="metadata"
        tabIndex={-1} onCanPlay={playback.onReady} onPlay={playback.onPlay}
        onPause={playback.onPause} onError={playback.onError}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playback.ready ? "opacity-[var(--hero-video-opacity)]" : "opacity-0"}`}
      />}
      <div className="hero-scrim absolute inset-0" />
      <div className="radial-grid absolute inset-0 opacity-30" />
    </div>
    {playback.allowed && !playback.failed && playback.ready && <Button
      variant="secondary" onClick={playback.toggle}
      aria-label={playback.playing ? "Pause motion — background video" : "Play motion — background video"}
      className="absolute bottom-6 right-6 z-20 !min-h-11 !px-3 !py-2 text-xs backdrop-blur-md md:right-12"
    ><span aria-hidden="true">{playback.playing ? "Ⅱ" : "▷"}</span> {playback.playing ? "Pause motion" : "Play motion"}</Button>}
  </>;
}
