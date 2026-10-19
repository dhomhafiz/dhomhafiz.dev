import type { PortfolioProvider } from "@/types/portfolio";
import { HeroVideo } from "./editorial/HeroVideo";
import { SelectedWork } from "./editorial/SelectedWork";
import { HireMe } from "./editorial/HireMe";
import { displayFont } from "@/lib/displayFont";
import { WaterText } from "@/components/common/WaterText";
import "./editorial/editorial.css";

export async function PortfolioPage({ provider }: { provider: PortfolioProvider }) {
  const content = await provider.getPortfolio();
  return <div className="editorial-page" id="top">
    <main id="main">
      <section className={`editorial-hero ${displayFont.variable}`} aria-labelledby="intro-heading">
        <HeroVideo />
        <h1 id="intro-heading" className="hero-display-name"><WaterText text="MOHD HAFIZ" /></h1>
        <div className="hero-bottom-bar">
          <nav aria-label="Main navigation"><a href="#works"><WaterText text="Projects" phase={.6} /></a><a href="#contact"><WaterText text="Contact" phase={1.2} /></a></nav>
          <p className="hero-bottom-brand"><WaterText text="dhomhafiz.dev" phase={1.8} /></p>
          <p className="hero-bottom-location"><WaterText text="Kuala Lumpur, MY" phase={2.4} /></p>
        </div>
      </section>
      <SelectedWork projects={content.projects} />
      <HireMe email={content.contactEmail} socials={content.hero.portrait?.socials} />
    </main>
  </div>;
}
