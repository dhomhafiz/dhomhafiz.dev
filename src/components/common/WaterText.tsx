import type { CSSProperties } from "react";

export function WaterText({ text, phase = 0 }: { text: string; phase?: number }) {
  return <span className="water-text">
    <span className="sr-only">{text}</span>
    <span className="water-visual" aria-hidden="true">{Array.from(text).map((letter, index) =>
      <span className="water-letter" key={index} style={{ "--wave-delay": `${-phase - index * .16}s` } as CSSProperties}>{letter}</span>
    )}</span>
  </span>;
}
