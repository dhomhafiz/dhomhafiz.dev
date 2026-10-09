import { assetPath, assetSrcSet } from "@/lib/assetPath";
import type { PortfolioContent, PortfolioProvider } from "@/types/portfolio";
import { FaJava } from "react-icons/fa6";
import { SiApachemaven, SiHibernate, SiNextdotjs, SiNodedotjs, SiPostman, SiReact, SiSpringboot, SiTailwindcss, SiTypescript } from "react-icons/si";
import { TbAiAgent } from "react-icons/tb";
import { VscVscode } from "react-icons/vsc";

// SRP: editable sample content lives outside rendering and interaction code.
const content: PortfolioContent = {
  brand: "dhomhafiz.dev",
  availability: "Available for select projects",
  contactEmail: "dhomhafiz@gmail.com",
  hero: {
    heading: "MOHD HAFIZ",
    highlight: "Freelance Web Designer Malaysia",
    portrait: {
      socials: [
        { platform: "linkedin", href: "https://www.linkedin.com/in/mohd-hafiz-abd-rahim-b23a9667/?isSelfProfile=true" },
        { platform: "facebook", href: "https://www.facebook.com/profile.php?id=100064737337327" },
        { platform: "instagram", href: "https://www.instagram.com/dhomhafiz/" },
      ],
      src: assetPath("/images/hafiz-cinematic-1122.webp"),
      webpSrcSet: assetSrcSet("/images/hafiz-cinematic-560.webp 560w, /images/hafiz-cinematic-840.webp 840w, /images/hafiz-cinematic-1122.webp 1122w"),
      alt: "Mohd Hafiz smiling in a cap and glasses, with arms crossed in a monochrome studio portrait.",
    },
    description: "Turn local visitors into your next customers. Give them a fast, mobile-friendly website that makes your services clear and contacting you easy.",
  },
  technologies: [
    { name: "Next.js", icon: SiNextdotjs },
    { name: "React", icon: SiReact },
    { name: "TypeScript", icon: SiTypescript },
    { name: "Tailwind CSS", icon: SiTailwindcss },
    { name: "Java", icon: FaJava },
    { name: "Spring Boot", icon: SiSpringboot },
    { name: "Hibernate", icon: SiHibernate },
    { name: "Maven", icon: SiApachemaven },
    { name: "Postman", icon: SiPostman },
    { name: "Agentic AI", icon: TbAiAgent },
    { name: "VS Code", icon: VscVscode },
    { name: "Node.js", icon: SiNodedotjs },
  ],
  services: {
    tiers: [
      {
        id: "essential",
        title: "Essential Landing Page",
        audience: "Best for simple business, personal, campaign, or service landing pages.",
        pricePrefix: "One time",
        price: 799,
        promotionEnabled: true,
        // "fixed" uses promotionalPrice; "percentage" uses discountPercent.
        promotionType: "fixed",
        promotionalPrice: 599,
        discountPercent: 15,
        promotionEndDate: "2026-10-31",
        priceSuffix: "per project",
        delivery: "3–5 working days",
        features: [
          "One responsive landing page tailored to your brand with up to six focused sections",
          "WhatsApp click-to-chat, call, and primary CTA buttons",
          "Basic entrance animations and hover effects",
          "Contact form with a clear enquiry journey and thank-you state",
          "On-page SEO: page title, meta description, heading structure, and local business details",
          "Performance-focused delivery for fast mobile loading",
          "RM0 static hosting setup on an eligible free plan",
          "Two revision rounds",
        ],
        scopeNote: "Excludes databases, advanced product filtering, user accounts, payment systems, and complex custom functionality.",
        cta: "Build My Landing Page",
      },
      {
        id: "business",
        title: "Custom Business Website",
        audience: "Best for growing businesses that need multiple pages and more interactive functionality.",
        pricePrefix: "From",
        price: 2499,
        promotionEnabled: true,
        promotionType: "fixed",
        promotionalPrice: 1999,
        discountPercent: 15,
        promotionEndDate: "2026-10-31",
        priceSuffix: "per project",
        delivery: "1–2 weeks",
        recommended: true,
        features: [
          "Includes the core features from Essential Landing Page, plus:",
          "Up to three responsive pages with a more customised multi-page experience",
          {
            label: "One agreed interactive feature",
            tooltip: "Examples include a product showcase, booking embed, or service calculator.",
            infoLabel: "More information about interactive feature",
          },
          "Optimised for fast loading across desktop and mobile",
          "Smooth page transitions and premium interactions",
          "More engaging scroll animations to showcase your content",
        ],
        scopeNote: "Excludes custom backend systems, user accounts, payment processing, complex databases, and advanced application features unless quoted separately.",
        cta: "Build My Website",
      },
      {
        id: "application",
        comingSoon: false,
        title: "Custom Web Application",
        audience: "For businesses that need purpose-built tools, connected systems, or workflows beyond a standard website.",
        price: "Custom quote",
        pricePrefix: "Custom pricing",
        promotionEnabled: false,
        delivery: "Timeline based on scope",
        features: [
          "Discovery and a defined project specification",
          "Custom interface designed around your workflow",
          "Database-backed features scoped to your needs",
          "Options for dashboards, user accounts, and API integrations",
          "Agreed testing, deployment, and handover plan",
        ],
        scopeNote: "Features, revision rounds, milestones, and support are agreed in your proposal before development begins.",
        cta: "Let’s Discuss",
      },
    ],
  },
  faqs: [
    { question: "When does the delivery timeline start?", answer: "Delivery starts after scope approval and receipt of your copy, images, brand assets, and required access. Feedback delays may shift the timeline." },
    { question: "What does RM0 Free Lifetime Hosting include?", answer: "Eligible static websites are set up on a free hosting plan, with no recurring hosting fee while the site stays within that plan’s limits and the provider continues to offer it. Domain registration and renewals, paid services, databases, and backend hosting are separate. Any expected recurring costs are confirmed in your proposal." },
    { question: "What is covered by revisions and support?", answer: "Revisions cover the agreed scope. Extra features and ongoing maintenance are quoted separately; post-launch bug-fix support is defined in your proposal." },
    { question: "How do payments and performance targets work?", answer: "Deposit and payment milestones are agreed before work starts. Lighthouse targets use an agreed device profile and test setup; third-party scripts and later content changes can affect results." },
  ],
  projects: [
    {
      id: "netflix-squid-game-2",
      category: "enterprise",
      context: "Client Experiential Marketing Installation",
      title: "Netflix Squid Game 2 Interactive Poll System",
      description: "Engineered a Python-based interactive installation for Netflix’s promotional event at Ampang Park MRT Station, KL. Integrated physical hardware inputs (Blue for Continue, Red for Withdraw) to replicate the show's iconic voting mechanic, delivering an immersive experiential marketing activation for the public.",
      location: "Ampang Park MRT Station, Kuala Lumpur",
      technologies: ["Python", "Hardware integration", "Interactive installation"],
      image: {
        src: assetPath("/images/squid-game-2-installation.webp"),
        srcSet: assetSrcSet("/images/squid-game-2-480.webp 480w, /images/squid-game-2-640.webp 640w, /images/squid-game-2-768.webp 768w, /images/squid-game-2-installation.webp 1024w"),
        alt: "Squid Game 2 promotional installation with a voting console between two costumed guards at Ampang Park MRT Station.",
        width: 1024,
        height: 768,
        sourceUrl: "https://www.therakyatpost.com/wp-content/webp-express/webp-images/uploads/2024/12/image-77-1024x768.png.webp",
        credit: "The Rakyat Post",
      },
    },
    {
      id: "dental-project",
      category: "template",
      presentation: "dental",
      context: "High-Conversion Niche Blueprint",
      title: "🩺 Dental Clinic Website Demo",
      description: "Help local patients explore your services, understand your pricing, and take the next step towards a visit. Preview a welcoming, mobile-friendly clinic website with an easy-to-use appointment booking demo.",
      location: "Web experience / Healthcare",
      technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Static Site Generation (SSG)"],
      image: {
        src: assetPath("/images/dental/studio.svg"),
        alt: "Still Dental concept illustration: a sage green dental chair in a calm studio with an arched window and plants",
        width: 640,
        height: 720,
      },
      demoHref: assetPath("/demo-dental/"),
      lighthouseScores: [
        { label: "Performance", score: 98 },
        { label: "Accessibility", score: 100 },
        { label: "Best Practices", score: 100 },
        { label: "SEO", score: 100 },
      ],
    },
  ],
  capabilities: [
    { label: "Interfaces that feel right", description: "Thoughtful interaction. Every screen, every size." },
    { label: "Built for what’s next", description: "Clean architecture that grows with your product." },
    { label: "Performance by design", description: "Fast, accessible experiences from the first render." },
  ],
};

// DIP: this is the replaceable infrastructure adapter, not a UI dependency.
export const localPortfolioProvider: PortfolioProvider = {
  async getPortfolio() { return content; },
};
