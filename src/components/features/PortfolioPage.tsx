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

// DIP: this server-side boundary accepts any provider implementing the interface.
// SRP: fetching occurs here, while the feature components only render their inputs.
export async function PortfolioPage({ provider }: { provider: PortfolioProvider }) {
  const content = await provider.getPortfolio();
  return <>
    <SiteHeader brand={content.brand} />
    <ServiceEnquiryProvider>
    <main id="main">
      <Hero copy={content.hero} sources={content.media.sources} poster={content.media.poster} />
      <PersonalProjects projects={content.projects} />
      <Services offer={content.services} />
      <FAQ items={content.faqs} />
      <Approach items={content.capabilities} />
      <Contact contactEmail={content.contactEmail} packages={content.services.tiers.filter(tier => !tier.comingSoon).map(({ id, title }) => ({ id, title }))} />
    </main>
    </ServiceEnquiryProvider>
    <footer className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 border-t border-cyber-border/10 px-6 py-7 text-xs text-cyber-muted md:px-12 lg:px-20">
      <span>© 2026 {content.brand} / Independent by design.</span>
      <a href={content.media.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-cyber-border/20 underline-offset-4 hover:text-cyber-cyan">Background footage / Pexels ↗</a>
    </footer>
    <BackToTop />
  </>;
}
