import type { ToolkitTechnology } from "@/types/portfolio";

// OCP: adding technologies is a data change, not a layout change.
export function TechnologyStrip({ items }: { items: readonly ToolkitTechnology[] }) {
  return <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-cyber-border/10 pt-7">
    <p className="text-xs uppercase tracking-[0.14em] text-cyber-muted">My everyday toolkit</p>
    <ul className="flex flex-wrap gap-x-7 gap-y-3">
      {items.map(item => {
        const Icon = item.icon;
        return <li key={item.name} className="flex items-center gap-2 font-display text-base text-cyber-text/85">
          <Icon aria-hidden="true" focusable="false" className="size-5 shrink-0" />
          <span>{item.name}</span>
        </li>;
      })}
    </ul>
  </div>;
}
