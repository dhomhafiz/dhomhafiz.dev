"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ProjectCategory } from "@/types/portfolio";
import { getDocumentTop } from "@/lib/sectionNavigation";

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
  const [demoNavigation, setDemoNavigation] = useState(0);
  const firstDemoId = items.find(item => item.category === "template")?.id;
  const visible = items.filter(item => active === "all" || item.category === active);

  useEffect(() => {
    const navigateToDemo = () => {
      if (window.location.hash !== "#live-demo") return;
      setActive("template");
      setDemoNavigation(value => value + 1);
    };
    navigateToDemo();
    window.addEventListener("hashchange", navigateToDemo);
    return () => window.removeEventListener("hashchange", navigateToDemo);
  }, []);

  // Wait for the filtered cards to commit before measuring their new positions.
  useEffect(() => {
    if (!demoNavigation) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById("live-demo") ?? document.getElementById("project-results");
      if (!target) return;
      target.focus({ preventScroll: true });
      const headerHeight = document.querySelector("body > header")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({
        top: getDocumentTop(target) - headerHeight - 24,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [demoNavigation]);

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
              onClick={() => {
                setActive(value);
                // A later hero click must navigate again, even after a manual filter change.
                if (window.location.hash === "#live-demo") {
                  window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
                }
              }}
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
      <div id="project-results" tabIndex={-1} className="space-y-8">
        {visible.map(item => <div key={item.id} id={item.id === firstDemoId ? "live-demo" : undefined} tabIndex={item.id === firstDemoId ? -1 : undefined} className="scroll-mt-6">{item.content}</div>)}
        {visible.length === 0 && (
          <p className="rounded-xl border border-cyber-border/15 p-8 text-sm text-cyber-muted">
            No projects in this category yet. Select All to explore the available work.
          </p>
        )}
      </div>
    </>
  );
}
