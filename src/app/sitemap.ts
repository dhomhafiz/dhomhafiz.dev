import type { MetadataRoute } from "next";
import { pageSeo, site } from "@/config/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(pageSeo).map(page => ({
    url: new URL(page.path, site.url).href,
    // Update with substantive page edits; rebuilding alone does not change this date.
    lastModified: page.lastModified,
  }));
}
