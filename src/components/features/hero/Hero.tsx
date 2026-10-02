import { HeroBackdrop } from "./HeroBackdrop";
import { HeroCopy } from "./HeroCopy";
import { HeroPortrait } from "./HeroPortrait";
import type { HeroCopy as HeroCopyModel, VideoSource } from "@/types/portfolio";

interface HeroProps { copy: HeroCopyModel; sources: readonly VideoSource[]; poster?: string }

// Compose the introduction, backdrop, and portrait.
export function Hero({ copy, sources, poster }: HeroProps) {
  return <section aria-label="Introduction" className="cinematic-hero isolate border-b border-cyber-border/10">
    <div className="hero-next-world" aria-hidden="true"><span className="hero-next-label">01 / Personal Projects — Selected work</span></div>
    <HeroBackdrop sources={sources} poster={poster} />
    <div className="hero-overlay relative mx-auto flex h-full flex-col" tabIndex={0} role="region" aria-label="Hero details">
      <div className={copy.portrait ? "hero-composition grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16" : "hero-composition"}>
        <HeroCopy {...copy} />
        {copy.portrait && <HeroPortrait {...copy.portrait} />}
      </div>
    </div>
  </section>;
}
