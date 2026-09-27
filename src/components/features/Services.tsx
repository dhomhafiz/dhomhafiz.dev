import { ButtonLink } from "@/components/common/Button";
import type { ServiceOffer } from "@/types/portfolio";

export function Services({ offer, contactEmail }: { offer: ServiceOffer; contactEmail: string }) {
  return <section id="services" aria-labelledby="services-title" className="mx-auto max-w-[1440px] scroll-mt-8 px-6 py-16 md:px-12 lg:px-20">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
      <h2 id="services-title" className="font-mono text-3xl tracking-tight">My Services</h2>
      <p className="text-xs uppercase tracking-[0.15em] text-cyber-muted">Built for your next step / 02</p>
    </div>
    <p className="mb-10 max-w-2xl text-sm leading-7 text-cyber-muted">From your first landing page to a custom business website. Choose a starting point, and we’ll shape the details together.</p>
    <div className="grid gap-6 lg:grid-cols-3">
      {offer.tiers.map((tier, index) => <article key={tier.id} aria-labelledby={tier.comingSoon ? `service-${tier.id}-status` : `service-${tier.id}`} className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-6 md:p-8 lg:p-6 xl:p-8 ${tier.recommended ? "border-cyber-cyan/60 bg-cyber-surface shadow-neon-cyan" : "border-cyber-border/15 bg-cyber-surface/55"}`}>
        <div inert={tier.comingSoon || undefined} aria-hidden={tier.comingSoon || undefined} className={`flex flex-1 flex-col ${tier.comingSoon ? "pointer-events-none select-none opacity-40 blur-[7px]" : ""}`}>
        <div className="mb-7 flex min-h-7 items-center justify-between gap-3">
          <span aria-hidden="true" className="text-xs text-cyber-cyan">0{index + 1} /</span>
          {tier.recommended && <span className="rounded-full bg-cyber-cyan px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyber-on-accent">Recommended</span>}
        </div>
        <h3 id={`service-${tier.id}`} className="font-display text-2xl leading-tight lg:min-h-[3.75rem]">{tier.title}</h3>
        <p className="mt-4 text-sm leading-7 text-cyber-muted lg:min-h-[8.75rem]">{tier.audience}</p>
        <div className="my-7">
          <p className="min-h-5 text-xs text-cyber-muted">{tier.pricePrefix || <span aria-hidden="true">&nbsp;</span>}</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight xl:text-4xl">{tier.price}</p>
          <p className="mt-2 min-h-5 text-xs text-cyber-muted">{tier.priceSuffix || "Scoped around your requirements"}</p>
          <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-cyber-text">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 text-cyber-cyan"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {tier.delivery}
          </p>
        </div>
        <ul className="space-y-4 border-t border-cyber-border/10 pt-6">
          {tier.features.map(feature => <li key={feature} className="flex items-start gap-3 text-sm leading-6">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="mt-1 h-4 w-4 shrink-0 text-cyber-cyan"><path d="m4 10 4 4 8-8" /></svg>
            <span>{feature}</span>
          </li>)}
        </ul>
        <div className="mt-auto pt-7">
          <p className="mb-6 text-xs leading-6 text-cyber-muted">{tier.scopeNote}</p>
          {tier.comingSoon ? <span className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-cyber-border/20 px-5 py-3 text-sm">{tier.cta}</span> : <ButtonLink variant={tier.recommended ? "primary" : "secondary"} className="w-full" href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Project enquiry: ${tier.title}`)}`} aria-label={`${tier.cta} — enquire about ${tier.title} by email`}>
            {tier.cta}<span aria-hidden="true">↗</span>
          </ButtonLink>}
        </div>
        </div>
        {tier.comingSoon && <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-surface/20 px-6 text-center">
          <div className="rounded-2xl border border-cyber-cyan/30 bg-cyber-surface/90 px-8 py-7 shadow-neon-cyan backdrop-blur-md">
            <h3 id={`service-${tier.id}-status`} className="font-mono text-4xl font-semibold tracking-[0.2em] text-cyber-text"><span className="sr-only">Tier {index + 1}: </span>TBA</h3>
            <p className="mt-3 text-xs text-cyber-muted">Not available yet</p>
          </div>
        </div>}
      </article>)}
    </div>
  </section>;
}
