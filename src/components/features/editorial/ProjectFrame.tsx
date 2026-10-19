"use client";

import type { MouseEvent, PointerEvent } from "react";
import type { WorkProject } from "@/lib/workProjects";
import { workHref } from "@/lib/workProjects";

interface ProjectFrameProps {
  project: WorkProject;
  index: number;
  number: string;
  active: boolean;
  expanded: boolean;
  total: number;
  idPrefix: string;
  onHover: (index: number) => void;
  onReveal: (index: number) => void;
  onDismiss: (index: number) => void;
  onClose: (index: number) => void;
  onProjectNavigate: (event: MouseEvent<HTMLAnchorElement>, project: WorkProject) => void;
}

export function ProjectFrame({
  project,
  index,
  number,
  active,
  expanded,
  total,
  idPrefix,
  onHover,
  onReveal,
  onDismiss,
  onClose,
  onProjectNavigate,
}: ProjectFrameProps) {
  const image = project.image;
  const detailsId = `${idPrefix}-film-details-${project.slug}`;
  const title = project.displayTitle ?? project.title;

  return <article className="film-cell" role="group" aria-roledescription="slide"
    aria-label={`${index + 1} of ${total}: ${title}`}
    data-active={active} data-project-slug={project.slug}>
    <div className="film-edge film-edge-top" aria-hidden="true"><span>DH / SELECTED WORK</span><span>35MM · {number}</span></div>
    <div className="film-window" data-revealed={expanded}
      onPointerEnter={event => { if (event.pointerType === "mouse") onHover(index); }}
      onPointerLeave={event => { if (event.pointerType === "mouse" && !event.currentTarget.contains(document.activeElement)) onDismiss(index); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onDismiss(index); }}>
      <img className="film-image" src={image.src} srcSet={image.srcSet} sizes="(max-width: 700px) 84vw, (max-width: 1474px) 76vw, 1120px"
        width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" draggable={false}
        style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined} />
      <button type="button" className="film-reveal" data-reveal={index} aria-expanded={expanded} aria-controls={detailsId}
        onClick={() => onReveal(index)}>
        <span className="film-caption"><span>{number} / {title}</span><span aria-hidden="true">+</span></span>
        <span className="sr-only">Show project information</span>
      </button>
      <div id={detailsId} className="film-information" inert={!expanded} aria-hidden={!expanded}>
        <button type="button" className="film-close" aria-label={`Close ${title} information`} onClick={() => onClose(index)}>×</button>
        <div className="film-information-copy">
          <p className="film-category">{project.displayCategory ?? project.context}</p><h3>{title}</h3>
          <p className="film-location">{project.location}</p>
          <p>{project.description}</p>
          <ul aria-label="Project technologies">{project.technologies.map(tag => <li key={tag}>{tag}</li>)}</ul>
          {image.credit && image.sourceUrl && <p className="film-credit">Image: <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.credit}<span className="sr-only"> (opens in a new tab)</span></a></p>}
        </div>
        <a className="film-project-link" href={workHref(project.slug)} onClick={event => onProjectNavigate(event, project)}>View Project <span aria-hidden="true">↗</span><span className="sr-only">: {title}</span></a>
      </div>
    </div>
    <div className="film-edge film-edge-bottom" aria-hidden="true"><span>{number} <span className="film-marker">▴</span></span><span>DHOMHAFIZ.DEV / {number}A</span></div>
  </article>;
}
