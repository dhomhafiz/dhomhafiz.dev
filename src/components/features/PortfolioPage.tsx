import { GalleryPresentationProvider, GalleryPresentation } from "./immersive/GalleryPresentation";
import type { PortfolioProvider } from "@/types/portfolio";
import { ImmersiveHero } from "./immersive/ImmersiveHero";
import { SelectedWork } from "./editorial/SelectedWork";
import { HireMe } from "./editorial/HireMe";
import { assetPath } from "@/lib/assetPath";
import { getGalleryProject } from "@/lib/workProjects";
import { billboardDestinations } from "./immersive/routeBillboardSettings";
import localFont from "next/font/local";
import "./editorial/editorial.css";
import "./immersive/immersive.css";

const heroFont = localFont({
  src: "../../app/fonts/BarlowCondensed-ExtraBold.ttf",
  weight: "800",
  variable: "--font-hero",
  display: "swap",
});

export async function PortfolioPage({ provider }: { provider: PortfolioProvider }) {
  const content = await provider.getPortfolio();
  return <GalleryPresentationProvider><div className="editorial-page" id="top">
    <header className="editorial-header">
      <a className="editorial-brand" href="#top"><img src={assetPath("/images/hafiz-cinematic-avatar.webp")} width={44} height={44} alt="Dhom Hafiz" decoding="async" /><span>{content.brand}</span></a>
      <nav aria-label="Main navigation">
        <a href="#top"><span className="editorial-nav-label">Home</span></a>
        <a href="#works"><span className="editorial-nav-label">Projects</span></a>
        <a href="#contact"><span className="editorial-nav-label">Contact</span></a>
      </nav>
    </header>
    <main id="main">
      <div className="route-journey"><section className={`editorial-hero immersive-hero ${heroFont.variable}`} aria-labelledby="intro-heading">
        <ImmersiveHero projects={billboardDestinations.map(destination => getGalleryProject(content.projects, destination.projectSlug)).filter(project => project !== null)} />
        <div className="route-caption" aria-hidden="true"><span></span><span></span></div>
        <div className="hero-copy-block editorial-hero-copy">
          <h1 id="intro-heading">I AM HAFIZ.</h1>
          <p className="hero-role">Independent Web Designer</p>
          <p className="hero-tagline">Interactive websites with character.</p>
        </div>
        <div className="hero-scroll-arrow hero-scroll-indicator" aria-hidden="true">
          <svg className="hero-scroll-mouse" width="24" height="36" viewBox="0 0 24 36" fill="none">
            <rect x="2.75" y="1.75" width="18.5" height="32.5" rx="9.25" stroke="currentColor" strokeWidth="1.25" />
            <rect className="hero-scroll-wheel" x="11" y="8" width="2" height="6" rx="1" />
          </svg>
          <svg className="hero-scroll-swipe" width="24" height="28" viewBox="0 0 24 28" fill="none">
            <path d="M12 24V13" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.25" strokeLinecap="round" />
            <g className="hero-scroll-gesture" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 12 6-6 6 6M12 7v11" />
            </g>
          </svg>
          <span>Scroll to explore</span>
        </div>
      </section>
      <GalleryPresentation><SelectedWork projects={content.projects} /></GalleryPresentation></div>
      <HireMe email={content.contactEmail} socials={content.hero.portrait?.socials} />
    </main>
  </div></GalleryPresentationProvider>;
}
