const comparisons = [
  {
    title: "Speed",
    benefit: "Make a great first impression.",
    modern: "Prebuilt pages delivered from a CDN, with carefully sized images and fewer moving parts.",
    traditional: "Database-driven pages may need extra caching and plugin tuning to stay fast.",
  },
  {
    title: "Security",
    benefit: "Keep the public site simpler.",
    modern: "Static pages need no public CMS login or database server. Forms and integrations are secured separately.",
    traditional: "A CMS, its plugins, and its database need ongoing updates and access management.",
  },
  {
    title: "Lifetime hosting savings",
    benefit: "Put more of your budget into your business.",
    modern: "RM0 hosting for eligible static sites on a free plan, within provider limits and availability.",
    traditional: "Paid server plans, premium plugins, and maintenance can add recurring costs.",
  },
];

export function WebsiteComparison() {
  return (
    <section aria-labelledby="comparison-title" className="mb-12 rounded-2xl border border-cyber-border/15 bg-cyber-surface/60 p-5 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">Built for long-term value</p>
      <h3 id="comparison-title" className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">Next.js vs Traditional Systems</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-cyber-muted">A lean website can do more for your business budget. Here’s how my static website approach compares with a typical database-driven CMS.</p>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {comparisons.map(item => (
          <article key={item.title} className="min-w-0 overflow-hidden rounded-xl border border-cyber-border/15 bg-cyber-dark">
            <div className="p-5"><h4 className="font-display text-lg font-semibold">{item.title}</h4><p className="mt-2 text-xs leading-6 text-cyber-muted">{item.benefit}</p></div>
            <dl>
              <div className="border-y border-cyber-cyan/20 bg-cyber-cyan/10 p-5">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">My Next.js static sites</dt>
                <dd className="mt-3 text-sm leading-7 text-cyber-text">{item.modern}</dd>
              </div>
              <div className="p-5">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-cyber-muted">Traditional CMS</dt>
                <dd className="mt-3 text-sm leading-7 text-cyber-muted">{item.traditional}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <p className="mt-5 text-xs leading-6 text-cyber-muted">Results depend on implementation. No website is risk-free. Domains, paid services, and backend hosting are separate; custom applications are scoped individually.</p>
    </section>
  );
}
