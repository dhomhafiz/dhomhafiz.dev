import { GlassCard } from "@/components/common/GlassCard";
import type { PersonalProject } from "@/types/portfolio";

export function PersonalProjects({ projects }: { projects: readonly PersonalProject[] }) {
  if (projects.length === 0) return null;

  return <section id="projects" aria-labelledby="projects-title" className="mx-auto max-w-[1440px] scroll-mt-8 px-6 py-16 md:px-12 lg:px-20">
    <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4">
      <h2 id="projects-title" className="font-mono text-3xl tracking-tight">Personal Projects</h2>
      <p className="text-xs uppercase tracking-[0.15em] text-cyber-muted">Selected work / 01</p>
    </div>
    <div className="space-y-8">
      {projects.map(project => <article key={project.id} aria-labelledby={`${project.id}-title`}>
        <GlassCard className="overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <figure className="min-w-0 border-b border-cyber-border/10 bg-cyber-surface/60 lg:border-b-0 lg:border-r">
              <img src={project.image.src} srcSet={project.image.srcSet} sizes="(min-width: 1440px) 638px, (min-width: 1024px) calc((100vw - 160px) / 2), (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)" alt={project.image.alt} width={project.image.width} height={project.image.height}
                loading="lazy" decoding="async" className="aspect-[4/3] w-full object-contain" />
              <figcaption className="px-6 py-3 text-xs text-cyber-muted">
                Image source: <a href={project.image.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-cyber-border/30 underline-offset-4 hover:text-cyber-cyan">{project.image.credit}<span className="sr-only"> (opens in a new tab)</span></a>
              </figcaption>
            </figure>
            <div className="flex flex-col justify-center p-6 md:p-9 lg:p-10">
              <p className="text-xs leading-6 text-cyber-cyan">{project.location}</p>
              <h3 id={`${project.id}-title`} className="mt-4 font-display text-2xl leading-tight tracking-tight md:text-3xl">{project.title}</h3>
              <p className="mt-6 text-sm leading-7 text-cyber-muted">{project.description}</p>
              <ul aria-label="Project technologies and disciplines" className="mt-8 flex flex-wrap gap-2">
                {project.technologies.map(technology => <li key={technology} className="rounded-full border border-cyber-border/15 bg-cyber-surface/60 px-3 py-1.5 text-xs leading-5 text-cyber-text">{technology}</li>)}
              </ul>
            </div>
          </div>
        </GlassCard>
      </article>)}
    </div>
  </section>;
}
