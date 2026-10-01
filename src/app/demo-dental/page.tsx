import type { Metadata } from "next";
import Link from "next/link";
import { DentalHeader, DentalFooter } from "@/components/dental/DentalShell";
import { Hero } from "@/components/dental/Hero";
import { ServicesGrid } from "@/components/dental/ServicesGrid";
import { BookingExperience } from "@/components/dental/BookingExperience";
import { FAQ } from "@/components/dental/FAQ";
import "./dental.css";

export const metadata: Metadata = {
  title: "Still Dental | A little more care. A lot more smile.",
  description: "Explore Still Dental, a modern dental clinic template with transparent sample pricing and an appointment booking preview.",
  alternates: { canonical: "/demo-dental/" },
  keywords: ["dental clinic template", "dental appointment demo", "Still Dental"],
  openGraph: { title: "Still Dental | Care that feels different", description: "A thoughtfully designed dental clinic demo. Explore care, sample pricing, and appointment booking.", url: "/demo-dental/", siteName: "Still Dental", type: "website" },
  twitter: { card: "summary", title: "Still Dental", description: "A thoughtfully designed dental clinic demo." },
};

export default function DentalDemoPage() {
  return (
    <div className="dental-site bg-[#faf9f6] text-[#183f39]">
      <nav
        aria-label="Portfolio navigation"
        className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/95 px-3 py-1.5 backdrop-blur-md sm:px-5"
      >
        <Link
          href="/"
          className="group inline-flex min-h-11 max-w-full items-center gap-2 rounded-md px-3 font-mono text-xs text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:text-white sm:text-sm"
        >
          <span aria-hidden="true" className="transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5">←</span>
          <span>Back to dhomhafiz.dev</span>
        </Link>
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
