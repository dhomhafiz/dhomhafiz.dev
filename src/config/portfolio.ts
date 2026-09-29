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
    eyebrow: "INDEPENDENT FULLSTACK DEVELOPER",
    heading: "Human ideas.",
    highlight: "Digital futures.",
    portrait: {
      src: assetPath("/images/hafiz-768.webp"),
      avifSrcSet: assetSrcSet("/images/hafiz-480.avif 480w, /images/hafiz-640.avif 640w, /images/hafiz-768.avif 768w, /images/hafiz-1024.avif 1024w"),
      webpSrcSet: assetSrcSet("/images/hafiz-480.webp 480w, /images/hafiz-640.webp 640w, /images/hafiz-768.webp 768w, /images/hafiz-1024.webp 1024w"),
      socials: [
        { platform: "github", href: "https://github.com/dhomhafiz" },
        { platform: "linkedin", href: "https://www.linkedin.com/in/mohd-hafiz-abd-rahim-b23a9667/" },
      ],
      alt: "Hafiz smiling in a neon-lit workspace with code displayed on the monitors behind him.",
    },
    description: "I turn ambitious ideas into fast, thoughtful web experiences. Built with precision. Designed to feel effortless.",
  },
  media: {
    // Compressed local copy of the credited Pexels footage.
    sources: [{ src: assetPath("/videos/hero-720p.mp4"), type: "video/mp4" }],
    poster: assetPath("/images/hero-poster.webp"),
    sourceUrl: "https://www.pexels.com/video/a-computer-screen-with-the-word-target-on-it-6037155/",
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
        audience: "For local startups, service professionals, and single-product launches that need a clear, fast web presence.",
        price: "RM 799",
        priceSuffix: "/ project",
        delivery: "3–5 working days",
        features: [
          "One responsive page with up to six focus sections",
          "WhatsApp click-to-chat and call buttons",
          "One contact form with spam protection and email notification setup",
          "On-page SEO: page title, meta description, headings, and local business details",
          "Performance-focused delivery for fast mobile loading",
          "Two revision rounds",
        ],
        scopeNote: "Excludes custom databases, advanced product filters, and custom interactive animations.",
        cta: "Get Started",
      },
      {
        id: "business",
        title: "Custom Business Website",
        audience: "For growing SMEs that need a distinctive website to support campaigns and turn interest into enquiries.",
        pricePrefix: "From",
        price: "RM 2,499",
        priceSuffix: "/ project",
        delivery: "1–2 weeks",
        recommended: true,
        features: [
          "Up to three responsive pages, custom-designed for your brand",
          "One agreed interactive feature: product showcase, booking embed, or service calculator",
          "Contact form and clear enquiry journey with a thank-you state",
          "Refined micro-interactions and smooth transitions",
          "On-page SEO and performance-focused development",
          "Two revision rounds",
        ],
        scopeNote: "Targets 90+ Lighthouse performance under agreed test conditions.",
        cta: "Build My Website",
      },
      {
        id: "application",
        comingSoon: false,
        title: "Custom Web Application",
        audience: "For businesses that need purpose-built tools, connected systems, or workflows beyond a standard website.",
        price: "Custom quote",
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
    { question: "Are hosting, domain, and running costs included?", answer: "Domain, hosting, and paid third-party services are separate. Any recurring costs are confirmed before you commit." },
    { question: "What is covered by revisions and support?", answer: "Revisions cover the agreed scope. Extra features and ongoing maintenance are quoted separately; post-launch bug-fix support is defined in your proposal." },
    { question: "How do payments and performance targets work?", answer: "Deposit and payment milestones are agreed before work starts. Lighthouse targets use an agreed device profile and test setup; third-party scripts and later content changes can affect results." },
  ],
  projects: [
    {
      id: "netflix-squid-game-2",
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
