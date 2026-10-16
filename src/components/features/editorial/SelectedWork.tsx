import { assetPath } from "@/lib/assetPath";
import type { PersonalProject } from "@/types/portfolio";
import { WorkCard } from "./WorkCard";

export function SelectedWork({ projects }: { projects: readonly PersonalProject[] }) {
  const netflix = projects.find(project => project.id === "netflix-squid-game-2");
  return <section id="works" className="editorial-section" aria-labelledby="works-heading">
    <div className="section-heading"><h2 id="works-heading">Personal Projects</h2><p>Considered design. Working experiences.</p></div>
    <div className="selected-work-grid">
      <WorkCard className="dental-work" label="Still Dental concept project">
        <div className="work-image"><img src={assetPath("/images/dental/doctor-patient-15688027.webp")} width={640} height={720} loading="lazy" alt="A dentist performing a dental procedure on a patient in a clinic" /></div>
        <div className="work-overlay">
          <p className="work-overlay-category">Concept Project · Healthcare</p>
          <h3>Still Dental</h3><p>A calmer kind of care, from first click to appointment.</p>
          <a className="work-overlay-link" href={assetPath("/demo-dental/")} aria-label="Explore Still Dental interactive website demo">Explore interactive demo</a>
        </div>
      </WorkCard>
      {netflix && <WorkCard className="netflix-work" label={netflix.title}>
        <div className="work-image"><img src={netflix.image.src} srcSet={netflix.image.srcSet} sizes="(min-width: 900px) 50vw, 100vw" width={netflix.image.width} height={netflix.image.height} alt={netflix.image.alt} loading="lazy" decoding="async" /></div>
        <div className="work-overlay">
          <p className="work-overlay-category">Interactive Installation · Python</p>
          <h3>{netflix.title}</h3><p>{netflix.location}</p><p>{netflix.description}</p>
          <ul aria-label="Project technologies">{netflix.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
          {netflix.image.sourceUrl && netflix.image.credit && <p className="work-photo-credit">Image: <a href={netflix.image.sourceUrl} target="_blank" rel="noopener noreferrer">{netflix.image.credit}<span className="sr-only"> (opens in a new tab)</span></a></p>}
        </div>
      </WorkCard>}
    </div>
  </section>;
}
