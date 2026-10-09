import { ButtonLink } from "@/components/common/Button";
import { SocialLinks } from "@/components/common/SocialLinks";
import { HeroHeading } from "./HeroHeading";
import type { HeroCopy as HeroCopyModel } from "@/types/portfolio";

// SRP/ISP: copy rendering depends only on its small content contract and destination.
export function HeroCopy({ heading, highlight, description, portrait }: HeroCopyModel) {
  return <div className="hero-copy relative z-10 motion-safe:animate-reveal">
    <h1 className="font-display hero-title">
      <HeroHeading text={heading} />
      <span data-hero-exit="subtitle" className="hero-heading-accent hero-role block">{highlight}</span>
    </h1>
    <p data-hero-exit="description" className="mt-8 max-w-xl text-base leading-8 text-cyber-muted">{description}</p>
    <div className="mt-10 flex flex-wrap gap-4">
      <ButtonLink data-hero-exit="primary" href="#services">Find my website package <span aria-hidden="true">↓</span></ButtonLink>
      <ButtonLink data-hero-exit="secondary" href="#live-demo" variant="secondary">See a live demo <span aria-hidden="true">↓</span></ButtonLink>
    </div>
    {portrait?.socials && <SocialLinks links={portrait.socials} />}
  </div>;
}
