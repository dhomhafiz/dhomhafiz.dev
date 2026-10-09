import { ButtonLink } from "@/components/common/Button";
import { SocialLinks } from "@/components/common/SocialLinks";
import type { HeroCopy as HeroCopyModel } from "@/types/portfolio";

// SRP/ISP: copy rendering depends only on its small content contract and destination.
export function HeroCopy({ eyebrow, heading, highlight, description, portrait, hostingHighlight, hostingNote }: HeroCopyModel) {
  return <div className="hero-copy relative z-10 motion-safe:animate-reveal">
    <p className="mb-8 flex items-center gap-3 text-xs tracking-[0.18em] text-cyber-cyan md:text-sm">
      <span className="h-px w-8 bg-cyber-cyan" aria-hidden="true" />{eyebrow}
    </p>
    <h1 className="font-display hero-title">
      <span className="block">{heading}</span>
      <span className="hero-heading-accent hero-role block">{highlight}</span>
    </h1>
    <p className="mt-8 max-w-xl text-base leading-8 text-cyber-muted">{description}</p>
    {hostingHighlight && <div className="mt-6 max-w-xl rounded-xl border border-cyber-cyan/25 bg-cyber-dark/75 p-4">
      <p className="flex items-center gap-3 font-display text-lg font-semibold text-cyber-cyan"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-cyber-cyan" />{hostingHighlight}</p>
      {hostingNote && <p className="mt-2 text-xs leading-6 text-cyber-muted">{hostingNote}</p>}
    </div>}
    <div className="mt-10 flex flex-wrap gap-4">
      <ButtonLink href="#projects">View My Work <span aria-hidden="true">↓</span></ButtonLink>
      <ButtonLink href="#contact" variant="secondary">Let’s Talk <span aria-hidden="true">↓</span></ButtonLink>
    </div>
    {portrait?.socials && <SocialLinks links={portrait.socials} />}
  </div>;
}
