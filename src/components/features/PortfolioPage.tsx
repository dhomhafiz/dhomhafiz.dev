import type { PortfolioProvider } from "@/types/portfolio";
import { HeroVideo } from "./editorial/HeroVideo";
import { SelectedWork } from "./editorial/SelectedWork";
import { HireMe } from "./editorial/HireMe";
import { assetPath } from "@/lib/assetPath";
import "./editorial/editorial.css";

export async function PortfolioPage({ provider }: { provider: PortfolioProvider }) {
  const content = await provider.getPortfolio();
  return <div className="editorial-page" id="top">
    <header className="editorial-header">
      <a className="editorial-brand" href="#top"><img src={assetPath("/images/hafiz-cinematic-avatar.webp")} width={48} height={48} alt="Dhom Hafiz" /><span>{content.brand}</span></a>
      <nav aria-label="Main navigation"><a href="#works">Projects</a><a href="#contact">Contact</a></nav>
    </header>
    <main id="main">
      <section className="editorial-hero" aria-labelledby="intro-heading">
        <HeroVideo />
        <div className="hero-copy-block">
          <div className="intro-label"><span>Independent webdesigner</span><span>Kuala Lumpur, MY</span></div>
          <h1 id="intro-heading"><span className="hero-heading-line hero-heading-line-first">I am Mohd Hafiz, a webdesigner based in Kuala Lumpur.</span><span className="hero-heading-line hero-heading-line-second">I build <strong>fast landing pages</strong> for businesses ready for their next chapter.</span></h1>
        </div>
        <a className="hero-scroll-arrow" href="#works" aria-label="Scroll to Selected Work"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 5v22M7 18l9 9 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
      </section>
      <SelectedWork projects={content.projects} />
      <HireMe email={content.contactEmail} socials={content.hero.portrait?.socials} />
    </main>
  </div>;
}
