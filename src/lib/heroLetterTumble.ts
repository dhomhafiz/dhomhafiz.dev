interface LetterTrajectory {
  x: number; y: number; z: number;
  rx: number; ry: number; rz: number;
  delay: number;
}

// Fixed choreography: nine different directions, depth and stagger values.
export const heroLetterTrajectories: readonly LetterTrajectory[] = [
  { x: -26, y: 126, z: 52, rx: 110, ry: -28, rz: -18, delay: 0 },
  { x: 20, y: 152, z: -65, rx: -125, ry: 32, rz: 16, delay: .035 },
  { x: -35, y: 112, z: 24, rx: 48, ry: -110, rz: -25, delay: .065 },
  { x: 30, y: 142, z: 70, rx: 132, ry: 35, rz: 22, delay: .018 },
  { x: -28, y: 160, z: -75, rx: -115, ry: -40, rz: -15, delay: .05 },
  { x: 35, y: 122, z: 38, rx: 55, ry: 120, rz: 26, delay: .08 },
  { x: -18, y: 145, z: 60, rx: 145, ry: -25, rz: -20, delay: .028 },
  { x: 24, y: 165, z: -55, rx: -135, ry: 45, rz: 18, delay: .058 },
  { x: 45, y: 138, z: 85, rx: 95, ry: -85, rz: 38, delay: .01 },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function createHeroLetterTumble(root: HTMLElement) {
  const layout = root.querySelector<HTMLElement>("[data-hero-letter-layout]");
  const heading = layout?.parentElement;
  const letters = [...root.querySelectorAll<HTMLElement>("[data-hero-letter]")];
  return {
    measure() {
      const text = layout?.firstChild;
      if (!layout || !text || !layout.offsetWidth) return;
      const box = layout.getBoundingClientRect();
      const scale = box.width / layout.offsetWidth;
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, 1);
      const firstLineTop = range.getBoundingClientRect().top;
      for (const letter of letters) {
        const index = Number(letter.dataset.heroLetter);
        range.setStart(text, index);
        range.setEnd(text, index + 1);
        const rect = range.getBoundingClientRect();
        letter.style.left = `${(rect.left - box.left) / scale}px`;
        // Match line-box baselines, rather than adding the font's glyph-box ascent twice.
        letter.style.top = `${(rect.top - firstLineTop) / scale}px`;
      }
      if (heading) heading.dataset.lettersReady = "true";
    },
    render(progress: number, width: number) {
      const mobile = width < 768;
      const movement = mobile ? .42 : width < 1024 ? .7 : 1;
      const rotation = mobile ? .55 : .9;
      letters.forEach((letter, index) => {
        const config = heroLetterTrajectories[index % heroLetterTrajectories.length];
        // Begin slightly before 30% so the rising foreground doesn't hide the detachment.
        const start = .24 + config.delay;
        const p = clamp((progress - start) / (.85 - start));
        const ease = p * p * (3 - 2 * p);
        const gravity = p * p;
        const fade = clamp((progress - .58 - config.delay * .5) / (.85 - .58 - config.delay * .5));
        letter.style.transform = p === 0 ? "none" : `translate3d(${config.x * movement * ease}px, ${config.y * movement * gravity}px, ${config.z * movement * ease}px) rotateX(${config.rx * rotation * ease}deg) rotateY(${config.ry * rotation * ease}deg) rotateZ(${config.rz * rotation * ease}deg) scale(${1 - .08 * ease})`;
        letter.style.opacity = `${1 - fade * fade * (3 - 2 * fade)}`;
        letter.style.willChange = p > 0 && p < 1 ? "transform, opacity" : "auto";
      });
    },
    destroy() {
      if (heading) delete heading.dataset.lettersReady;
      for (const letter of letters) for (const property of ["left", "top", "transform", "opacity", "will-change"]) letter.style.removeProperty(property);
    },
  };
}
