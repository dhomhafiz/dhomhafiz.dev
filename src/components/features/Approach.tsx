import { GlassCard } from "@/components/common/GlassCard";
import type { Capability } from "@/types/portfolio";

// SRP/OCP: a small, config-driven supporting section gives the hero anchor a real destination.
export function Approach({ items }: { items: readonly Capability[] }) {
  return <section id="approach" aria-labelledby="approach-title" className="mx-auto max-w-[1440px] scroll-mt-8 px-6 py-16 md:px-12 lg:px-20">
    <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4">
      <h2 id="approach-title" className="font-mono text-3xl tracking-tight">Good design. Solid engineering.</h2>
      <p className="text-xs uppercase tracking-[0.15em] text-cyber-muted">The approach / 04</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">{items.map((item, index) => <GlassCard key={item.label} className="p-6">
      <p aria-hidden="true" className="mb-8 text-sm text-cyber-cyan">0{index + 1} /</p>
      <h3 className="font-display text-xl">{item.label}</h3>
      <p className="mt-3 text-sm leading-7 text-cyber-muted">{item.description}</p>
    </GlassCard>)}</div>
  </section>;
}
