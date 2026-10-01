import type { PersonalProject } from "@/types/portfolio";
import { DentalProjectCard } from "./DentalProjectCard";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilter } from "./ProjectFilter";

export function PersonalProjects({ projects }: { projects: readonly PersonalProject[] }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="mx-auto max-w-[1440px] scroll-mt-8 px-6 py-16 md:px-12 lg:px-20">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="projects-title" className="font-mono text-3xl tracking-tight">Personal Projects</h2>
        <p className="text-xs uppercase tracking-[0.15em] text-cyber-muted">Selected work / 01</p>
      </div>
      <ProjectFilter items={projects.map(project => ({
        id: project.id,
        category: project.category,
        content: project.category === "template" && project.presentation === "dental"
          ? <DentalProjectCard project={project} />
          : <ProjectCard project={project} />,
      }))} />
    </section>
  );
}
