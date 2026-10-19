import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localPortfolioProvider } from "@/config/portfolio";
import { site } from "@/config/seo";
import { assetPath } from "@/lib/assetPath";
import { getWorkProjects, workHref } from "@/lib/workProjects";
import "@/components/features/editorial/film.css";
import "./work.css";

export const dynamicParams = false;
async function projects() { return getWorkProjects((await localPortfolioProvider.getPortfolio()).projects); }
export async function generateStaticParams() { return (await projects()).map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = (await projects()).find(item => item.slug === slug);
  if (!item) notFound();
  const title = `${item.title} | Mohd Hafiz`;
  const description = item.introduction;
  const image = item.project.image;
  const url = `/work/${slug}/`;
  return {
    title, description, alternates: { canonical: url }, keywords: [...item.project.technologies, item.title, site.owner],
    openGraph: { title, description, url, siteName: site.name, locale: site.locale, type: "website", images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image.src, alt: image.alt }] },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const archive = await projects();
  const index = archive.findIndex(item => item.slug === slug);
  if (index < 0) notFound();
  const item = archive[index];
  const project = item.project;
  const image = project.image;
  const previous = archive[index - 1];
  const next = archive[index + 1];
  return <div className="case-study">
    <header className="case-header"><a className="case-brand" href={assetPath("/")}>dhomhafiz.dev</a><nav aria-label="Project navigation"><a href={assetPath("/#works")}>← Back to Projects</a><a href={assetPath("/#contact")}>Contact ↗</a></nav></header>
    <main id="main">
      <div className="case-heading">
        <p className="case-kicker">SELECTED ARCHIVE <span>FRAME {String(index + 1).padStart(2, "0")} / {String(archive.length).padStart(2, "0")}</span></p>
        <p className="case-category">{item.category}</p>
        <h1>{item.title}</h1>
        <div className="case-intro"><p>{item.introduction}</p><p>{project.location}</p></div>
      </div>
      <figure className={`case-hero ${slug === "still-dental" ? "case-dental" : ""}`}>
        <img src={image.src} srcSet={image.srcSet} sizes="100vw" alt={image.alt} width={image.width} height={image.height}
          fetchPriority="high" style={{ viewTransitionName: `project-${slug}` } as CSSProperties} />
        <figcaption><span>{String(index + 1).padStart(2, "0")}A / {project.context}</span>{image.sourceUrl && image.credit && <span>Image: <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.credit}<span className="sr-only"> (opens in a new tab)</span></a></span>}</figcaption>
      </figure>
      <div className="case-body">
        <aside className="case-facts"><p className="case-kicker">PROJECT NOTES</p><p>{project.context}</p><ul aria-label="Project technologies">{project.technologies.map(tag => <li key={tag}>{tag}</li>)}</ul>
          {project.category === "template" && <a className="case-action" href={project.demoHref}>Explore interactive demo ↗</a>}
        </aside>
        <div className="case-story">{item.sections.map((section, i) => <section key={section.title}><p className="case-section-number">{String(i + 1).padStart(2, "0")}</p><h2>{section.title}</h2><p>{section.text}</p></section>)}</div>
      </div>
      {item.gallery && <section className="case-gallery" aria-labelledby="gallery-heading"><div className="case-gallery-heading"><p className="case-kicker">A CLOSER LOOK</p><h2 id="gallery-heading">Inside the experience.</h2></div><div className="case-gallery-grid">{item.gallery.map(shot => <figure key={shot.src}><img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" /><figcaption>{shot.caption}</figcaption></figure>)}</div></section>}
      <nav className="case-pagination" aria-label="More projects">
        <p className="case-kicker">CONTINUE THROUGH THE ARCHIVE</p>
        <div>{previous && <a href={workHref(previous.slug)}><span>← Previous Project</span><strong>{previous.title}</strong></a>}{next && <a href={workHref(next.slug)}><span>Next Project →</span><strong>{next.title}</strong></a>}</div>
        <a className="case-back" href={assetPath("/#works")}>Back to Projects ↗</a>
      </nav>
      <div className="case-contact"><p>Have something in mind?</p><a href={assetPath("/#contact")}>Let’s make it happen. ↗</a></div>
    </main>
  </div>;
}
