import { ButtonLink } from "@/components/common/Button";
import type { HeroCopy as HeroCopyModel } from "@/types/portfolio";

// SRP/ISP: copy rendering depends only on its small content contract and destination.
export function HeroCopy({ eyebrow, heading, highlight, description, portrait, hostingHighlight, hostingNote }: HeroCopyModel) {
  return <div className="relative z-10 max-w-5xl motion-safe:animate-reveal">
    <p className="mb-8 flex items-center gap-3 text-xs tracking-[0.18em] text-cyber-cyan md:text-sm">
      <span className="h-px w-8 bg-cyber-cyan" aria-hidden="true" />{eyebrow}
    </p>
    <h1 className={`font-display ${portrait ? "text-[clamp(2rem,4.6vw,3.6rem)]" : "text-[clamp(2.25rem,6vw,5rem)]"} font-medium leading-[1.12] tracking-[-0.045em]`}>
      <span className="block">{heading}</span>
      <span className="block text-cyber-cyan">{highlight}</span>
    </h1>
    <p className="mt-8 max-w-xl text-base leading-8 text-cyber-muted">{description}</p>
    {hostingHighlight && <div className="mt-6 max-w-xl rounded-xl border border-cyber-cyan/25 bg-cyber-dark/75 p-4">
      <p className="flex items-center gap-3 font-display text-lg font-semibold text-cyber-cyan"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-cyber-cyan" />{hostingHighlight}</p>
      {hostingNote && <p className="mt-2 text-xs leading-6 text-cyber-muted">{hostingNote}</p>}
    </div>}
    <div className="mt-10 flex flex-wrap gap-4">
      <ButtonLink href="#services">Find my website package <span aria-hidden="true">↓</span></ButtonLink>
      <ButtonLink href="#live-demo" variant="secondary">See a live demo <span aria-hidden="true">↓</span></ButtonLink>
    </div>
  </div>;
}
