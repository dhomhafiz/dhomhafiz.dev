import type { PersonalProject } from "@/types/portfolio";
import { assetPath } from "./assetPath";

export type WorkProject = PersonalProject;

export function getWorkProjects(projects: readonly PersonalProject[]): WorkProject[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const project of projects) {
    if (!project.id.trim() || ids.has(project.id)) throw new Error(`Project IDs must be non-empty and unique: "${project.id}".`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) {
      throw new Error(`Project slugs must be unique kebab-case values: "${project.slug}".`);
    }
    if (!Number.isFinite(project.displayOrder)) throw new Error(`Project "${project.id}" requires a finite displayOrder.`);
    ids.add(project.id);
    slugs.add(project.slug);
  }
  return [...projects].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function workHref(slug: string) { return assetPath(`/work/${slug}/`); }

// A serializable view of the same portfolio record used by the film strip.
export interface GalleryProject {
  slug: string;
  title: string;
  category: string;
  href: string;
  preview: { src: string; width: number; height: number; alt: string };
}

export function getGalleryProject(projects: readonly PersonalProject[], slug?: string): GalleryProject | null {
  const project = getWorkProjects(projects).find(item => slug ? item.slug === slug : item.category === "template" && item.presentation === "dental");
  if (!project) return null;
  return { slug: project.slug, title: project.displayTitle ?? project.title,
    category: project.displayCategory ?? project.context, href: workHref(project.slug),
    preview: project.gallery?.[0] ?? project.image };
}
