import { ButtonLink } from "@/components/common/Button";
import type { HeroCopy as HeroCopyModel } from "@/types/portfolio";

// SRP/ISP: copy rendering depends only on its small content contract and destination.
export function HeroCopy({ eyebrow, heading, highlight, description, portrait, contactEmail }: HeroCopyModel & { contactEmail: string }) {
  return <div className="relative z-10 max-w-5xl motion-safe:animate-reveal">
    <p className="mb-8 flex items-center gap-3 text-xs tracking-[0.18em] text-cyber-cyan md:text-sm">
      <span className="h-px w-8 bg-cyber-cyan" aria-hidden="true" />{eyebrow}
    </p>
    <h1 className={`font-display ${portrait ? "text-[clamp(2.5rem,6vw,5rem)] lg:text-[clamp(2.5rem,4.7vw,4.25rem)]" : "text-[clamp(3rem,7.5vw,7.5rem)]"} font-medium leading-[1.05] tracking-[-0.055em]`}>
      <span className="block">{heading}</span>
      <span className="block text-cyber-cyan">{highlight}</span>
    </h1>
    <p className="mt-8 max-w-xl text-base leading-8 text-cyber-muted">{description}</p>
    <div className="mt-10 flex flex-wrap gap-4">
      <ButtonLink href={`mailto:${contactEmail}`}>Let’s build something <span aria-hidden="true">↗</span></ButtonLink>
      <ButtonLink href="#approach" variant="secondary">Explore my approach <span aria-hidden="true">↓</span></ButtonLink>
    </div>
  </div>;
}
