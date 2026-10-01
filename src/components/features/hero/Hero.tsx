import { HeroBackdrop } from "./HeroBackdrop";
import { HeroCopy } from "./HeroCopy";
import { HeroPortrait } from "./HeroPortrait";
import type { HeroCopy as HeroCopyModel, VideoSource } from "@/types/portfolio";

interface HeroProps { copy: HeroCopyModel; sources: readonly VideoSource[]; poster?: string; contactEmail: string }

// Compose the introduction, backdrop, and portrait.
export function Hero({ copy, sources, poster, contactEmail }: HeroProps) {
  return <section aria-label="Introduction" className="relative isolate overflow-hidden border-b border-cyber-border/10">
    <HeroBackdrop sources={sources} poster={poster} />
    <div className="relative mx-auto flex min-h-[min(850px,calc(100svh-88px))] max-w-[1440px] flex-col justify-center px-6 pb-28 pt-20 md:px-12 lg:px-20 lg:pt-28">
      <div className={copy.portrait ? "grid items-center gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16" : undefined}>
        <HeroCopy {...copy} contactEmail={contactEmail} />
        {copy.portrait && <HeroPortrait {...copy.portrait} />}
      </div>
    </div>
  </section>;
}
