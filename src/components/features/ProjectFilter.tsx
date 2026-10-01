"use client";

import { useState, type ReactNode } from "react";
import type { ProjectCategory } from "@/types/portfolio";

type ProjectFilterValue = "all" | ProjectCategory;
const filters: readonly { value: ProjectFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "enterprise", label: "Enterprise Systems" },
  { value: "template", label: "Live Interactive Demo" },
];

// Cards are rendered by the server; this island owns only filtering state.
export function ProjectFilter({ items }: {
  items: readonly { id: string; category: ProjectCategory; content: ReactNode }[];
}) {
  const [active, setActive] = useState<ProjectFilterValue>("all");
  const visible = items.filter(item => active === "all" || item.category === active);

  return (
    <>
      <div className="mb-8 flex min-w-0 flex-wrap items-center justify-between gap-4 border-b border-cyber-border/10 pb-5">
        <div role="group" aria-label="Filter personal projects" className="flex max-w-full flex-wrap gap-2">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={active === value}
              aria-controls="project-results"
              onClick={() => setActive(value)}
              className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition-colors duration-200 ${
                active === value
                  ? "border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan"
                  : "border-cyber-border/15 text-cyber-muted hover:border-cyber-border/30 hover:bg-cyber-border/5 hover:text-cyber-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p role="status" className="text-xs text-cyber-muted">
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div id="project-results" className="space-y-8">
        {visible.map(item => <div key={item.id}>{item.content}</div>)}
        {visible.length === 0 && (
          <p className="rounded-xl border border-cyber-border/15 p-8 text-sm text-cyber-muted">
            No projects in this category yet. Select All to explore the available work.
          </p>
        )}
      </div>
    </>
  );
}
