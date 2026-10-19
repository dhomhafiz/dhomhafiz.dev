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
  const title = `${item.caseStudyTitle ?? item.title} | Mohd Hafiz`;
  const description = item.introduction;
  const image = item.image;
  const url = `/work/${slug}/`;
  return {
    title, description, alternates: { canonical: url }, keywords: [...item.technologies, item.caseStudyTitle ?? item.title, site.owner],
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
  const project = item;
  const image = project.image;
  const caseTitle = project.caseStudyTitle ?? project.title;
  const category = project.caseStudyCategory ?? project.context;
  const sections = project.sections?.filter(section => section.title.trim() && section.text.trim()) ?? [];
  const technologies = project.technologies.filter(technology => technology.trim());
  const gallery = project.gallery?.filter(shot => /^(https?:\/\/|\/)/i.test(shot.src) && shot.alt.trim() && shot.width > 0 && shot.height > 0) ?? [];
  const videos = project.videos?.filter(video => /^(https?:\/\/|\/)/i.test(video.src) && video.title.trim()) ?? [];
  const links = [
    ...(project.category === "template" && /^(https?:\/\/|\/)/i.test(project.demoHref) ? [{ label: "Explore interactive demo", href: project.demoHref }] : []),
    ...(project.category === "template" && project.sourceHref && /^(https?:\/\/|\/)/i.test(project.sourceHref) ? [{ label: "View source code", href: project.sourceHref }] : []),
    ...(project.externalLinks ?? []).filter(link => link.label.trim() && /^(https?:\/\/|\/|#)/i.test(link.href)),
  ];
  const previous = archive[index - 1];
  const next = archive[index + 1];
  return <div className="case-study">
    <header className="case-header"><a className="case-brand" href={assetPath("/")}>dhomhafiz.dev</a><nav aria-label="Project navigation"><a href={assetPath("/#works")}>← Back to Projects</a><a href={assetPath("/#contact")}>Contact ↗</a></nav></header>
    <main id="main">
      <div className="case-heading">
        <p className="case-kicker">SELECTED ARCHIVE <span>FRAME {String(index + 1).padStart(2, "0")} / {String(archive.length).padStart(2, "0")}</span></p>
        <p className="case-category">{category}</p>
        <h1>{caseTitle}</h1>
        <div className="case-intro"><p>{item.introduction}</p><p>{project.location}</p></div>
      </div>
      <figure className="case-hero">
        <img src={image.src} srcSet={image.srcSet} sizes="100vw" alt={image.alt} width={image.width} height={image.height}
          fetchPriority="high" style={{ viewTransitionName: `project-${slug}`, ...(image.objectPosition ? { objectPosition: image.objectPosition } : {}) } as CSSProperties} />
        <figcaption><span>{String(index + 1).padStart(2, "0")}A / {project.context}</span>{image.sourceUrl && image.credit && <span>Image: <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.credit}<span className="sr-only"> (opens in a new tab)</span></a></span>}</figcaption>
      </figure>
      <div className={`case-body${sections.length ? "" : " case-body-no-story"}`}>
        <aside className="case-facts"><p className="case-kicker">PROJECT NOTES</p><p>{project.context}</p>
          {technologies.length > 0 && <ul aria-label="Project technologies">{technologies.map(tag => <li key={tag}>{tag}</li>)}</ul>}
          {links.map(link => <a key={`${link.label}-${link.href}`} className="case-action" href={link.href}
            {...(/^https?:\/\//i.test(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {link.label}{/^https?:\/\//i.test(link.href) && <><span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></>}
          </a>)}
        </aside>
        {sections.length > 0 && <div className="case-story">{sections.map((section, i) => <section key={section.title}><p className="case-section-number">{String(i + 1).padStart(2, "0")}</p><h2>{section.title}</h2><p>{section.text}</p></section>)}</div>}
      </div>
      {gallery.length > 0 && <section className="case-gallery" aria-labelledby="gallery-heading"><div className="case-gallery-heading"><p className="case-kicker">A CLOSER LOOK</p><h2 id="gallery-heading">Inside the experience.</h2></div><div className="case-gallery-grid">{gallery.map(shot => <figure key={shot.src}><img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" style={shot.objectPosition ? { objectPosition: shot.objectPosition } : undefined} />
        {(shot.caption || (shot.credit && shot.sourceUrl)) && <figcaption>{shot.caption}{shot.caption && shot.credit && shot.sourceUrl && " · "}{shot.credit && shot.sourceUrl && <>Image: <a href={shot.sourceUrl} target="_blank" rel="noopener noreferrer">{shot.credit}<span className="sr-only"> (opens in a new tab)</span></a></>}</figcaption>}
      </figure>)}</div></section>}
      {videos.length > 0 && <section className="case-videos" aria-labelledby="videos-heading"><div className="case-videos-heading"><p className="case-kicker">MOVING IMAGE</p><h2 id="videos-heading">Watch the project.</h2></div><div className="case-video-grid">{videos.map(video => <figure key={video.src}>
        <video aria-label={video.title} controls preload="metadata" poster={video.poster}><source src={video.src} type={video.type} />Your browser does not support the video element.</video>
        {(video.caption || (video.credit && video.sourceUrl)) && <figcaption>{video.caption}{video.caption && video.credit && video.sourceUrl && " · "}{video.credit && video.sourceUrl && <>Video: <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer">{video.credit}<span className="sr-only"> (opens in a new tab)</span></a></>}</figcaption>}
      </figure>)}</div></section>}
      <nav className="case-pagination" aria-label="More projects">
        <p className="case-kicker">CONTINUE THROUGH THE ARCHIVE</p>
        <div>{previous && <a href={workHref(previous.slug)}><span>← Previous Project</span><strong>{previous.displayTitle ?? previous.title}</strong></a>}{next && <a href={workHref(next.slug)}><span>Next Project →</span><strong>{next.displayTitle ?? next.title}</strong></a>}</div>
        <a className="case-back" href={assetPath("/#works")}>Back to Projects ↗</a>
      </nav>
      <div className="case-contact"><p>Have something in mind?</p><a href={assetPath("/#contact")}>Let’s make it happen. ↗</a></div>
    </main>
  </div>;
}
