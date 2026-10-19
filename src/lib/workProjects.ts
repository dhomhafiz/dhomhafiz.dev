import type { PersonalProject } from "@/types/portfolio";
import { assetPath } from "./assetPath";

export interface WorkProject {
  slug: string;
  title: string;
  category: string;
  introduction: string;
  project: PersonalProject;
  sections: readonly { title: string; text: string }[];
  gallery?: readonly { src: string; alt: string; caption: string; width: number; height: number }[];
}

// Presentation copy builds on the original records; images, descriptions, tags
// and attribution remain owned by the portfolio provider.
export function getWorkProjects(projects: readonly PersonalProject[]): WorkProject[] {
  return [...projects].sort((a, b) => Number(b.id === "dental-project") - Number(a.id === "dental-project"))
    .map(project => {
      if (project.id === "dental-project") return {
        slug: "still-dental", title: "Still Dental", category: "Concept Project · Healthcare",
        introduction: "A calmer kind of care, from first click to appointment.", project,
        sections: [
          { title: "Overview", text: project.description },
          { title: "The experience", text: "A fictional dental clinic website demo with services, sample pricing and an appointment booking flow. The interface lets visitors explore a clinic experience on desktop and mobile." },
          { title: "Design & implementation", text: "A responsive concept website built with Next.js, TypeScript and Tailwind CSS, delivered with static site generation. The booking experience is a demonstration, rather than a live clinic appointment service." },
        ],
        gallery: [
          { src: assetPath("/images/dental-home.webp"), alt: "Still Dental website homepage", caption: "The clinic website concept.", width: 1440, height: 1000 },
          { src: assetPath("/images/dental-booking.webp"), alt: "Still Dental appointment booking demo interface", caption: "The appointment booking demo.", width: 1440, height: 1000 },
        ],
      };
      if (project.id === "netflix-squid-game-2") return {
        slug: project.id, title: project.title, category: "Interactive Installation · Python",
        introduction: "A physical voting interaction, brought into a public promotional experience.", project,
        sections: [
          { title: "Overview", text: project.description },
          { title: "My contribution", text: "I engineered the Python-based interactive voting system and integrated the physical hardware inputs. This case study focuses on that implementation contribution within the wider promotional event." },
          { title: "The interaction", text: "The installation needed to translate the show's voting mechanic into a physical interaction: blue for Continue and red for Withdraw, at Ampang Park MRT Station in Kuala Lumpur." },
          { title: "Technical approach", text: "Python connected the physical button inputs to the interactive poll system, replicating the voting mechanic for members of the public." },
        ],
      };
      return { slug: project.id, title: project.title, category: project.context,
        introduction: project.description, project,
        sections: [{ title: "Overview", text: project.description }],
      };
    });
}

export function workHref(slug: string) { return assetPath(`/work/${slug}/`); }
