import { HeroBackdrop } from "./HeroBackdrop";
import { HeroCopy } from "./HeroCopy";
import type { HeroCopy as HeroCopyModel } from "@/types/portfolio";

interface HeroProps { copy: HeroCopyModel }

// Compose the introduction, backdrop, and portrait.
export function Hero({ copy }: HeroProps) {
  return <section aria-label="Hero" className="cinematic-hero isolate border-b border-cyber-border/10">
    <div className="hero-horizontal-frame">
    <HeroBackdrop portrait={copy.portrait} />
    <div className="hero-overlay relative mx-auto flex h-full flex-col" tabIndex={0} role="region" aria-label="Hero details">
      <div className="hero-composition">
        <HeroCopy {...copy} />
      </div>
    </div>
    </div>
  </section>;
}
