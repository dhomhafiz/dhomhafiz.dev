import { ButtonLink } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import type { PersonalProject } from "@/types/portfolio";
import { ProjectBadge } from "./ProjectBadge";

export function ProjectCard({ project }: { project: PersonalProject }) {
  return (
    <article aria-labelledby={`${project.id}-title`}>
      <GlassCard className="overflow-hidden transition duration-300 hover:border-cyber-cyan/30 motion-safe:hover:-translate-y-1">
        <div className="flex justify-end border-b border-cyber-border/10 px-4 py-3 sm:px-6">
          <ProjectBadge category={project.category} />
        </div>
        <div className="grid lg:grid-cols-2">
          <figure className="min-w-0 border-b border-cyber-border/10 bg-cyber-surface/60 lg:border-b-0 lg:border-r">
            <img src={project.image.src} srcSet={project.image.srcSet}
              sizes="(min-width: 1440px) 638px, (min-width: 1024px) calc((100vw - 160px) / 2), (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)"
              alt={project.image.alt} width={project.image.width} height={project.image.height}
              loading="lazy" decoding="async" className="aspect-[4/3] w-full object-contain" />
            {project.image.sourceUrl && project.image.credit && (
              <figcaption className="px-6 py-3 text-xs text-cyber-muted">
                Image source: <a href={project.image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-cyber-border/30 underline-offset-4 hover:text-cyber-cyan">
                  {project.image.credit}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </figcaption>
            )}
          </figure>
          <div className="flex min-w-0 flex-col justify-center p-6 md:p-9 lg:p-10">
            <p className="text-xs leading-6 text-cyber-cyan">{project.location}</p>
            <h3 id={`${project.id}-title`} className="mt-4 font-display text-2xl leading-tight tracking-tight md:text-3xl">{project.title}</h3>
            <p className="mt-3 text-xs leading-6 text-cyber-muted"><span className="text-cyber-text/80">Context:</span> {project.context}</p>
            <p className="mt-6 text-sm leading-7 text-cyber-muted">{project.description}</p>
            <ul aria-label="Project technologies and disciplines" className="mt-8 flex flex-wrap gap-2">
              {project.technologies.map(technology => (
                <li key={technology} className="rounded-full border border-cyber-border/15 bg-cyber-surface/60 px-3 py-1.5 text-xs leading-5 text-cyber-text">{technology}</li>
              ))}
            </ul>
            {project.category === "template" && (
              <div className="mt-7 flex flex-col gap-3 xl:flex-row">
                <ButtonLink href={project.demoHref} className="flex-1 text-center text-xs">Live Interactive Demo</ButtonLink>
                {project.sourceHref && <ButtonLink href={project.sourceHref} target="_blank" rel="noopener noreferrer" variant="secondary" className="flex-1 text-center text-xs">
                  View Source Code<span className="sr-only"> (opens in a new tab)</span>
                </ButtonLink>}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </article>
  );
}
