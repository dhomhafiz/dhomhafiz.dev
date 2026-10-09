import type { IconType } from "react-icons";

// ISP: small domain contracts prevent primitives from depending on an entire page.
export interface HeroCopy {
  heading: string;
  highlight: string;
  description: string;
  portrait?: { src: string; alt: string; avifSrcSet?: string; webpSrcSet?: string; socials?: readonly SocialLink[] };
}
export interface SocialLink { platform: "github" | "linkedin" | "instagram" | "facebook"; href: string }
export interface ToolkitTechnology { name: string; icon: IconType }
export interface VideoSource {
  src: string;
  type: string;
}
export interface Capability { label: string; description: string }
export type PromotionType = "fixed" | "percentage";
export type ServiceFeature = string | { label: string; tooltip: string; infoLabel: string };
export interface ServiceTier {
  id: string;
  title: string;
  audience: string;
  /** Numeric MYR price, or a display label such as "Custom quote". */
  price: number | string;
  promotionEnabled: boolean;
  promotionType?: PromotionType;
  promotionalPrice?: number;
  discountPercent?: number;
  /** Inclusive end date in the visitor's local calendar, formatted YYYY-MM-DD. */
  promotionEndDate?: string;
  pricePrefix?: string;
  priceSuffix?: string;
  delivery: string;
  features: readonly ServiceFeature[];
  scopeNote: string;
  cta: string;
  recommended?: boolean;
  comingSoon?: boolean;
}
export interface ServiceOffer {
  tiers: readonly ServiceTier[];
}
export interface FAQItem { question: string; answer: string }
export type ProjectCategory = "enterprise" | "template";
interface ProjectBase {
  id: string;
  category: ProjectCategory;
  context: string;
  title: string;
  description: string;
  location: string;
  technologies: readonly string[];
  image: { src: string; srcSet?: string; alt: string; width: number; height: number; sourceUrl?: string; credit?: string };
}
export interface EnterpriseProject extends ProjectBase { category: "enterprise" }
export interface TemplateProject extends ProjectBase {
  category: "template";
  presentation?: "dental";
  demoHref: string;
  sourceHref?: string;
  lighthouseScores?: readonly { label: string; score: number }[];
}
export type PersonalProject = EnterpriseProject | TemplateProject;
export interface PortfolioContent {
  brand: string;
  availability: string;
  contactEmail: string;
  hero: HeroCopy;
  technologies: readonly ToolkitTechnology[];
  capabilities: readonly Capability[];
  projects: readonly PersonalProject[];
  services: ServiceOffer;
  faqs: readonly FAQItem[];
}
// DIP: any CMS, API, or local adapter may satisfy this boundary.
export interface PortfolioProvider { getPortfolio(): Promise<PortfolioContent> }
