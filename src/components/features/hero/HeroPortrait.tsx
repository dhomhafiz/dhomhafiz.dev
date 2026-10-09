import type { HeroCopy } from "@/types/portfolio";

// Static export: pre-encoded responsive images avoid a runtime image server.
export function HeroPortrait({ src, alt, webpSrcSet }: NonNullable<HeroCopy["portrait"]>) {
  return <img className="hero-photograph" src={src} srcSet={webpSrcSet}
    sizes="(min-width: 1024px) 58vw, (min-width: 768px) 65vw, 100vw"
    alt={alt} width={1122} height={1402} fetchPriority="high" loading="eager" decoding="async" />;
}
