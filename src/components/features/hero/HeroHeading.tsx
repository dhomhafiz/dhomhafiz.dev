export function HeroHeading({ text }: { text: string }) {
  return <span data-hero-exit="heading" className="hero-tumble-heading block">
    <span className="sr-only">{text}</span>
    <span data-hero-letter-layout aria-hidden="true" className="hero-letter-layout block">{text}</span>
    <span aria-hidden="true" className="hero-letter-stage">
      {Array.from(text).map((letter, index) => letter.trim()
        ? <span key={index} data-hero-letter={index} className="hero-letter">{letter}</span>
        : null)}
    </span>
  </span>;
}
