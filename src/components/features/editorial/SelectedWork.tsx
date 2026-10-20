import type { PersonalProject } from "@/types/portfolio";
import { getWorkProjects } from "@/lib/workProjects";
import { FilmReel } from "./FilmReel";
import "./film.css";

export function SelectedWork({ projects }: { projects: readonly PersonalProject[] }) {
  return <section id="works" className="editorial-section film-section" aria-labelledby="works-heading">
    <span id="works-film" className="route-film-anchor" aria-hidden="true" />
    <div className="section-heading film-section-heading">
      <div><p className="film-eyebrow">THE SELECTED ARCHIVE / 35MM</p><h2 id="works-heading" tabIndex={-1}>Selected Works</h2></div>
      <p className="film-section-note">A few frames from my work.<br />Different mediums. Same curiosity.</p>
    </div>
    <FilmReel projects={getWorkProjects(projects)} />
  </section>;
}
