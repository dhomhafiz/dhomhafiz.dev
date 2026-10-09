interface ExitProfile {
  selector: string;
  start: number;
  end: number;
  fadeStart?: number;
  travel: number;
  shrink?: number;
}

// Windows overlap within the existing hero cover progress, never elapsed time.
export const heroContentExitProfile: readonly ExitProfile[] = [
  { selector: '.hero-copy nav[aria-label="Social profiles"]', start: .15, end: .34, travel: 15 },
  { selector: '[data-hero-exit="primary"]', start: .17, end: .43, travel: 18 },
  { selector: '[data-hero-exit="secondary"]', start: .19, end: .46, travel: 18 },
  { selector: '[data-hero-exit="description"]', start: .21, end: .52, travel: 18 },
  { selector: '[data-hero-exit="subtitle"]', start: .25, end: .58, travel: 22 },
  { selector: '[data-hero-exit="heading"]', start: .15, fadeStart: .65, end: .9, travel: 32, shrink: .07 },
];

export function createHeroContentExit(root: HTMLElement) {
  const entries = heroContentExitProfile.flatMap(profile => {
    const element = root.querySelector<HTMLElement>(profile.selector);
    if (!element) return [];
    const properties = ["opacity", "transform", "transform-origin", "will-change", "pointer-events"];
    const original = properties.map(property => ({ property, value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) }));
    return [{ profile, element, original, inert: element.inert }];
  });

  return {
    render(progress: number, width: number) {
      const mobile = width < 768;
      const movement = mobile ? .5 : width < 1024 ? .75 : 1;
      for (const { profile, element, inert } of entries) {
        const linear = Math.max(0, Math.min(1, (progress - profile.start) / (profile.end - profile.start)));
        const eased = linear * linear * (3 - 2 * linear);
        // Let the heading move slowly from the start, but dissolve after the subtitle.
        const fadeStart = profile.fadeStart ?? profile.start;
        const fade = Math.max(0, Math.min(1, (progress - fadeStart) / (profile.end - fadeStart)));
        const opacity = 1 - fade * fade * (3 - 2 * fade);
        const scale = 1 - (profile.shrink ?? 0) * (mobile ? .43 : 1) * eased;
        element.style.opacity = `${opacity}`;
        element.style.transform = linear === 0 ? "none" : `translate3d(0, ${-profile.travel * movement * eased}px, 0) scale(${scale})`;
        element.style.transformOrigin = "left center";
        element.style.willChange = linear > 0 && linear < 1 ? "transform, opacity" : "auto";
        // Inert removes invisible links from keyboard navigation as well as hit testing.
        element.inert = inert || opacity <= .01;
        element.style.pointerEvents = opacity <= .01 ? "none" : "";
      }
    },
    destroy() {
      for (const { element, original, inert } of entries) {
        element.inert = inert;
        for (const { property, value, priority } of original) {
          if (value) element.style.setProperty(property, value, priority);
          else element.style.removeProperty(property);
        }
      }
    },
  };
}
