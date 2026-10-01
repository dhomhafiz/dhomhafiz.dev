import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/common/GlassCard";
import type { TemplateProject } from "@/types/portfolio";
import { ProjectBadge } from "./ProjectBadge";

export function DentalProjectCard({ project }: { project: TemplateProject }) {
  return (
    <article aria-labelledby={`${project.id}-title`} className="group min-w-0">
      <GlassCard className="overflow-hidden transition duration-300 hover:border-cyber-cyan/30 hover:shadow-[0_16px_48px_-24px_rgb(var(--cyber-cyan)/0.2)] motion-safe:hover:-translate-y-1">
        <div className="flex justify-end border-b border-cyber-border/10 px-4 py-3 sm:px-6">
          <ProjectBadge category={project.category} />
        </div>
        <div className="grid lg:grid-cols-2">
          <figure className="flex min-w-0 flex-col border-b border-cyber-border/10 bg-cyber-surface/60 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 border-b border-cyber-border/10 px-6 py-4 text-[10px] text-cyber-muted">
              <span aria-hidden="true" className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyber-border/25" />
                <span className="h-2 w-2 rounded-full bg-cyber-border/20" />
                <span className="h-2 w-2 rounded-full bg-cyber-border/15" />
              </span>
              <span>{project.demoHref}</span>
              <span className="uppercase tracking-wider">Preview</span>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#faf9f6] p-6 shadow-2xl transition-transform duration-500 motion-safe:group-hover:scale-[1.015]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4e6d60]">Still Dental</p>
                <p className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#183f39]">
                  A little more care.<br />
                  <span className="italic text-[#638570]">A lot more smile.</span>
                </p>
                <div className="mt-6 overflow-hidden rounded-t-[42%] rounded-b-xl bg-[#dce5da]">
                  <Image
                    src={project.image.src}
                    alt={project.image.alt}
                    width={project.image.width}
                    height={project.image.height}
                    sizes="(max-width: 767px) calc(100vw - 144px), 334px"
                    unoptimized
                    className="aspect-[4/3] w-full object-cover object-center"
                  />
                </div>
                <p className="mt-4 text-center font-sans text-xs text-[#4e6d60]">Thoughtful care. A calmer experience.</p>
              </div>
            </div>
            <figcaption className="border-t border-cyber-border/10 px-6 py-3 text-xs leading-5 text-cyber-muted">
              Clinic landing page / Interactive booking preview
            </figcaption>
          </figure>

          <div className="flex min-w-0 flex-col justify-center p-6 md:p-9 lg:p-10">
            <p className="text-xs leading-6 text-cyber-cyan">{project.location}</p>
            <h3 id={`${project.id}-title`} className="mt-4 font-display text-2xl leading-tight tracking-tight md:text-3xl">
              {project.title}
            </h3>
            <p className="mt-3 text-xs leading-6 text-cyber-muted"><span className="text-cyber-text/80">Context:</span> {project.context}</p>
            <p className="mt-5 text-sm leading-7 text-cyber-muted">
              {project.description}
            </p>
            <div className="mt-7 w-full">
              <Link
                href={project.demoHref}
                className="block min-h-11 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-center font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Live Interactive Demo
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </article>
  );
}
