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
