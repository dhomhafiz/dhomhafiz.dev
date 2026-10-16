import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { DentalHeader, DentalFooter } from "@/components/dental/DentalShell";
import { Hero } from "@/components/dental/Hero";
import { ServicesGrid } from "@/components/dental/ServicesGrid";
import { BookingExperience } from "@/components/dental/BookingExperience";
import { FAQ } from "@/components/dental/FAQ";
import "./dental.css";
import { pageSeo, site } from "@/config/seo";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const inherited = await parent;
  return {
  title: pageSeo.dental.title,
  description: pageSeo.dental.description,
  alternates: { canonical: pageSeo.dental.path },
  keywords: [...pageSeo.dental.keywords],
  openGraph: { title: pageSeo.dental.title, description: pageSeo.dental.description, url: pageSeo.dental.path, siteName: site.name, locale: site.locale, type: "website", images: inherited.openGraph?.images },
  twitter: { card: "summary_large_image", title: pageSeo.dental.title, description: pageSeo.dental.description, images: inherited.twitter?.images ?? inherited.openGraph?.images },
  };
}

export default function DentalDemoPage() {
  return (
    <div className="dental-site bg-[#faf9f6] text-[#183f39]">
      <nav
        aria-label="Portfolio navigation"
        className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-zinc-950/95 px-3 py-1.5 backdrop-blur-md sm:px-5"
      >
        <Link
          href="/"
          aria-label="Back to dhomhafiz.dev"
          className="group col-start-1 row-start-1 inline-flex min-h-11 max-w-full items-center gap-2 justify-self-start rounded-md px-3 font-mono text-xs text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:text-white sm:text-sm"
        >
          <span aria-hidden="true" className="transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5">←</span>
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to dhomhafiz.dev</span>
        </Link>
        <span className="col-start-2 row-start-1 whitespace-nowrap font-mono text-xs text-zinc-400 sm:text-sm">This is a demo website</span>
      </nav>
      <DentalHeader />
      <main id="main">
        <Hero />
        <ServicesGrid />
        <BookingExperience />
        <FAQ />
      </main>
      <DentalFooter />
    </div>
  );
}
