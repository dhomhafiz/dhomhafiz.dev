import type { ProjectCategory } from "@/types/portfolio";

export function ProjectBadge({ category }: { category: ProjectCategory }) {
  const isTemplate = category === "template";
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase leading-5 tracking-widest ${
      isTemplate
        ? "border-emerald-800/40 bg-emerald-950/30 text-emerald-400 [[data-theme=light]_&]:border-emerald-700/20 [[data-theme=light]_&]:bg-emerald-50 [[data-theme=light]_&]:text-emerald-800"
        : "border-zinc-700/50 bg-zinc-800/40 text-zinc-300 [[data-theme=light]_&]:border-zinc-300/60 [[data-theme=light]_&]:bg-zinc-100 [[data-theme=light]_&]:text-zinc-700"
    }`}>
      <span
        aria-hidden="true"
        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
          isTemplate
            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.25)] [[data-theme=light]_&]:bg-emerald-600"
            : "bg-zinc-400"
        }`}
      />
      <span className="min-w-0 break-words">
        {isTemplate ? "Premium Commercial Demo" : "Enterprise Production"}
      </span>
    </span>
  );
}
