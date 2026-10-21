"use client";
import { Button } from "@/components/common/Button";
import { useGalleryPresentation } from "./GalleryPresentation";
export function ViewAllProjectsButton() {
  const gallery = useGalleryPresentation();
  return <Button className="route-gallery-all-projects" variant="secondary" aria-haspopup="dialog"
    onClick={event => gallery.open(event.currentTarget)}>
    View All Projects <span aria-hidden="true">&#8599;</span>
  </Button>;
}
