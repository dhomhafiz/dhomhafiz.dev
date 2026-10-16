import type { PortfolioProvider } from "@/types/portfolio";
import { HeroVideo } from "./editorial/HeroVideo";
import { SelectedWork } from "./editorial/SelectedWork";
import { EditorialServices } from "./editorial/EditorialServices";
import { HireMe } from "./editorial/HireMe";

import { assetPath } from "@/lib/assetPath";
import "./editorial/editorial.css";

export async function PortfolioPage({ provider }: { provider: PortfolioProvider }) {
  const content = await provider.getPortfolio();
  return <div className="editorial-page" id="top">
    <header className="editorial-header"><a className="editorial-brand" href="#top"><img src={assetPath("/images/hafiz-cinematic-avatar.webp")} width={48} height={48} alt="Dhom Hafiz" /><span>{content.brand}<small>©2026</small></span></a><nav aria-label="Main navigation"><a href="#works">Projects</a><a href="#contact">Contact</a></nav></header>
    <main id="main"><section className="editorial-hero" aria-labelledby="intro-heading"><HeroVideo /><div className="hero-copy-block"><div className="intro-label"><span>Independent webdesigner</span><span>Klang Valley, MY</span></div><h1 id="intro-heading">I’m Mohd Hafiz, a webdesigner based in Klang Valley. <span>I build Fast Landing Pages for businesses ready for their next chapter.</span></h1></div><a className="hero-scroll-arrow" href="#works" aria-label="Scroll to Selected Work"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 5v22M7 18l9 9 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a></section><SelectedWork projects={content.projects} /><EditorialServices /><HireMe email={content.contactEmail} socials={content.hero.portrait?.socials} /></main>
    <footer className="editorial-footer"><a href="#top">{content.brand}</a><span>© 2026 · Designed with intention.</span><a href="#top">Back to top ↑</a></footer>
  </div>;
}
