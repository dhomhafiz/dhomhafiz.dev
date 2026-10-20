import { ButtonLink } from "@/components/common/Button";

export function ViewAllProjectsButton() {
  return <ButtonLink className="route-gallery-all-projects" href="#works-film" variant="secondary">
    View All Projects <span aria-hidden="true">&#8595;</span>
  </ButtonLink>;
}
