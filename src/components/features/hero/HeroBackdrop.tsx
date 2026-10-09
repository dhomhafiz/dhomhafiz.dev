"use client";

import { useHeroScrub } from "@/hooks/useHeroScrub";
import { HeroPortrait } from "./HeroPortrait";
import type { HeroCopy } from "@/types/portfolio";

// DIP/ISP: receives only a media contract; never imports the local content adapter.
export function HeroBackdrop({ portrait }: { portrait: HeroCopy["portrait"] }) {
  const frameRef = useHeroScrub();
  return <div ref={frameRef} className="hero-media pointer-events-none">
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {portrait && <HeroPortrait {...portrait} />}
      <div className="hero-scrim absolute inset-0" />
    </div>
  </div>;
}
