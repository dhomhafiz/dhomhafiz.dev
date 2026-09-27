// OCP: adding technologies is a data change, not a layout change.
export function TechnologyStrip({ items }: { items: readonly string[] }) {
  return <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-cyber-border/10 pt-7">
    <p className="text-xs uppercase tracking-[0.14em] text-cyber-muted">My everyday toolkit</p>
    <ul className="flex flex-wrap gap-x-7 gap-y-3">
      {items.map(item => <li key={item} className="font-display text-base text-cyber-text/85">{item}</li>)}
    </ul>
  </div>;
}
