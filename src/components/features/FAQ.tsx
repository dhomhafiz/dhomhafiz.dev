import type { FAQItem } from "@/types/portfolio";

export function FAQ({ items }: { items: readonly FAQItem[] }) {
  return <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[1440px] scroll-mt-8 px-6 py-16 md:px-12 lg:px-20">
    <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4">
      <h2 id="faq-title" className="font-mono text-3xl tracking-tight">Frequently Asked Questions</h2>
      <p className="text-xs uppercase tracking-[0.15em] text-cyber-muted">Before we begin / 03</p>
    </div>
    <div className="space-y-3">
      {items.map(item => <details key={item.question} className="group rounded-2xl border border-cyber-border/15 bg-cyber-surface/55 open:border-cyber-cyan/40">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 rounded-2xl px-6 py-5 text-sm font-medium leading-6 text-cyber-text transition-colors hover:text-cyber-cyan md:px-8 [&::-webkit-details-marker]:hidden">
          {item.question}
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 shrink-0 text-cyber-cyan">
            <path d="M4 10h12" /><path d="M10 4v12" className="group-open:hidden" />
          </svg>
        </summary>
        <p className="max-w-4xl px-6 pb-6 text-sm leading-7 text-cyber-muted md:px-8">{item.answer}</p>
      </details>)}
    </div>
  </section>;
}
