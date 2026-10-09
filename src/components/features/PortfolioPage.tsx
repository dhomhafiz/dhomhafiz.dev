import type { PortfolioProvider } from "@/types/portfolio";
import { SiteHeader } from "./SiteHeader";
import { Hero } from "./hero/Hero";
import { Approach } from "./Approach";
import { PersonalProjects } from "./PersonalProjects";
import { Services } from "./Services";
import { FAQ } from "./FAQ";
import { Contact } from "./Contact";
import { BackToTop } from "@/components/common/BackToTop";
import { ServiceEnquiryProvider } from "./ServiceEnquiry";
import { SectionTransition } from "@/components/common/SectionTransition";

// DIP: this server-side boundary accepts any provider implementing the interface.
// SRP: fetching occurs here, while the feature components only render their inputs.
export async function PortfolioPage({ provider }: { provider: PortfolioProvider }) {
  const content = await provider.getPortfolio();
  return <>
    <SiteHeader brand={content.brand} overlay />
    <ServiceEnquiryProvider>
    <main id="main" className="cinematic-page">
      <div className="hero-stage">
        <div data-hero-visibility aria-hidden="true" className="hero-visibility" />
        <Hero copy={content.hero} />
      </div>
      <div className="portfolio-content">
        <SectionTransition order={1} bottomSpace><PersonalProjects projects={content.projects} /></SectionTransition>
        <SectionTransition order={2} bottomSpace><Services offer={content.services} /></SectionTransition>
        <SectionTransition order={3}><FAQ items={content.faqs} /></SectionTransition>
        <SectionTransition order={4}><Approach items={content.capabilities} /></SectionTransition>
        <SectionTransition order={5} bottomSpace exit="flow"><Contact contactEmail={content.contactEmail} packages={content.services.tiers.filter(tier => !tier.comingSoon).map(({ id, title }) => ({ id, title }))} /></SectionTransition>
        <div className="section-transition-footer">
          <footer className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 border-t border-cyber-border/10 px-6 py-7 text-xs text-cyber-muted md:px-12 lg:px-20">
            <span>© 2026 {content.brand} / Independent by design.</span>
            <a href="#main" className="underline underline-offset-4 hover:text-cyber-cyan">Back to the beginning ↑</a>
          </footer>
        </div>
      </div>
    </main>
    </ServiceEnquiryProvider>
    <BackToTop />
  </>;
}
