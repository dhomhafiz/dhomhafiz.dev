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
    eyebrow: "WEBSITES FOR LOCAL BUSINESSES",
    heading: "Ultra-fast landing pages",
    highlight: "built to grow your sales.",
    hostingHighlight: "RM0 Free Lifetime Hosting",
    hostingNote: "For eligible static sites on a free hosting plan, subject to provider limits and continued availability. Domain renewals and paid services are separate.",
    portrait: {
      socials: [
        { platform: "linkedin", href: "https://www.linkedin.com/in/mohd-hafiz-abd-rahim-b23a9667/?isSelfProfile=true" },
        { platform: "instagram", href: "https://www.instagram.com/frantickill/" },
      ],
      src: assetPath("/images/minime-fisheye-3-768.webp"),
      avifSrcSet: assetSrcSet("/images/minime-fisheye-3-480.avif 480w, /images/minime-fisheye-3-560.avif 560w, /images/minime-fisheye-3-640.avif 640w, /images/minime-fisheye-3-768.avif 768w, /images/minime-fisheye-3-1024.avif 1024w, /images/minime-fisheye-3-1254.avif 1254w"),
      webpSrcSet: assetSrcSet("/images/minime-fisheye-3-480.webp 480w, /images/minime-fisheye-3-560.webp 560w, /images/minime-fisheye-3-640.webp 640w, /images/minime-fisheye-3-768.webp 768w, /images/minime-fisheye-3-1024.webp 1024w, /images/minime-fisheye-3-1254.webp 1254w"),
      alt: "Hafiz smiling with arms crossed in a neon-lit coding workspace, surrounded by miniature cartoon versions of himself.",
    },
    description: "Turn local visitors into your next customers. Give them a fast, mobile-friendly website that makes your services clear and contacting you easy.",
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
        price: 799,
        promotionEnabled: false,
        // "fixed" uses promotionalPrice; "percentage" uses discountPercent.
        promotionType: "percentage",
        promotionalPrice: 399,
        discountPercent: 15,
        promotionEndDate: "2026-10-31",
        priceSuffix: "/ project",
        delivery: "3–5 working days",
        features: [
          "One responsive page with up to six focus sections",
          "WhatsApp click-to-chat and call buttons",
          "One contact form with spam protection and email notification setup",
          "On-page SEO: page title, meta description, headings, and local business details",
          "Performance-focused delivery for fast mobile loading",
          "RM0 static hosting setup on an eligible free plan",
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
        price: 2499,
        promotionEnabled: false,
        promotionType: "percentage",
        promotionalPrice: 2199,
        discountPercent: 15,
        promotionEndDate: "2026-10-31",
        priceSuffix: "/ project",
        delivery: "1–2 weeks",
        recommended: true,
        features: [
          "Up to three responsive pages, custom-designed for your brand",
          "One agreed interactive feature: product showcase, booking embed, or service calculator",
          "Contact form and clear enquiry journey with a thank-you state",
          "Refined micro-interactions and smooth transitions",
          "On-page SEO and performance-focused development",
          "RM0 hosting for eligible static pages; paid integrations quoted separately",
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
