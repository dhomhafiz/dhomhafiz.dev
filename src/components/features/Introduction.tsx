import { assetPath } from "@/lib/assetPath";

export function Introduction() {
  return <section id="introduction" aria-labelledby="introduction-title" className="introduction">
    <div className="introduction-inner">
      <p className="intro-label">Introduction / 01</p>
      <h2 id="introduction-title">Independent<br />web design<br />studio.</h2>
      <div className="introduction-copy">
        <img className="introduction-portrait" src={assetPath("/images/hafiz-introduction.webp")} width={720} height={867} alt="Hafiz smiling while seated in a chair, in a monochrome studio portrait." />
        <p>I’m Hafiz, a freelance web designer in Malaysia. I design and build distinctive web experiences for businesses ready to make their own mark.</p>
        <p className="text-cyber-muted">Thoughtful interaction. Fast performance. Clean implementation.</p>
      </div>
    </div>
  </section>;
}
