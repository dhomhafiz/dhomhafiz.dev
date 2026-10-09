// Anchor destinations must use document flow, even when their panel is pinned.
export function getDocumentTop(target: HTMLElement): number {
  const frame = target.closest<HTMLElement>(".section-transition-frame");
  const stage = target.closest<HTMLElement>(".section-transition-stage");
  if (!frame || !stage) return window.scrollY + target.getBoundingClientRect().top;
  let offset = 0;
  let node: HTMLElement | null = target;
  while (node && node !== frame) {
    offset += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return window.scrollY + stage.getBoundingClientRect().top + offset;
}

// Resolve sticky-frame anchors using live header geometry and the target's CSS gap.
export function navigateToSection(target: HTMLElement, behavior?: ScrollBehavior) {
  const headerHeight = document.querySelector(".cinematic-header")?.getBoundingClientRect().height ?? 0;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  target.focus({ preventScroll: true });
  window.scrollTo({
    top: getDocumentTop(target) - headerHeight - margin,
    behavior: behavior ?? (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"),
  });
}
