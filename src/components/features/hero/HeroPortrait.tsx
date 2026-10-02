import type { HeroCopy } from "@/types/portfolio";
import { SocialLinks } from "@/components/common/SocialLinks";

// Match Hero's grid, gutters, and the portrait's mobile width cap.
const portraitSizes = "(min-width: 1440px) 553px, (min-width: 1280px) calc((100vw - 224px) / 2.2), (min-width: 1024px) calc((100vw - 208px) / 2.2), (min-width: 488px) 440px, calc(100vw - 48px)";

export function HeroPortrait({ src, alt, socials, avifSrcSet, webpSrcSet }: NonNullable<HeroCopy["portrait"]>) {
  return <div className="hero-profile relative z-10 mx-auto w-full">
    <div className="relative">
    <div aria-hidden="true" className="absolute -inset-6 rounded-full bg-cyber-cyan/10 blur-3xl" />
    <div aria-hidden="true" className="absolute -inset-3 rotate-3 rounded-[2.25rem] border border-cyber-cyan/25" />
    <figure className="hero-portrait relative overflow-hidden rounded-[1.75rem] border border-cyber-border/20 bg-cyber-surface shadow-[0_24px_80px_-24px_rgb(var(--cyber-cyan)/0.3)]">
      <picture>
        {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={portraitSizes} />}
        <img src={src} srcSet={webpSrcSet} sizes={portraitSizes} alt={alt} width={1024} height={1024} loading="eager" fetchPriority="high" decoding="async"
          className="aspect-square w-full object-cover" />
      </picture>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
    </figure>
    </div>
    <div className="relative mx-4 -mt-5 sm:mx-6">
    <span className="inline-block rounded-xl border border-cyber-border/15 bg-cyber-surface/95 px-4 py-3 font-mono text-xs text-cyber-text shadow-lg backdrop-blur-md">
      <span className="mr-2 text-cyber-cyan">//</span> dhomhafiz.dev
    </span>
    {socials && socials.length > 0 && <SocialLinks links={socials} />}
    </div>
  </div>;
}
