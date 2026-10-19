import type { MetadataRoute } from "next";
import { pageSeo, site } from "@/config/seo";
import { localPortfolioProvider } from "@/config/portfolio";
import { getWorkProjects } from "@/lib/workProjects";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = getWorkProjects((await localPortfolioProvider.getPortfolio()).projects);
  return [...Object.values(pageSeo).map(page => ({
    url: new URL(page.path, site.url).href,
    // Update with substantive page edits; rebuilding alone does not change this date.
    lastModified: page.lastModified,
  })), ...projects.map(project => ({ url: new URL(`/work/${project.slug}/`, site.url).href }))];
}
