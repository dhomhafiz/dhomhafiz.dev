import Image from "next/image";
import { assetPath } from "@/lib/assetPath";
import { Arrow, Container, Eyebrow, primaryButton } from "./ui";

export function Hero() {
  return <section aria-labelledby="hero-heading" className="overflow-hidden">
    <Container className="grid items-center gap-10 pb-14 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20 lg:pt-16">
      <div>
        <Eyebrow>A gentler kind of dentistry</Eyebrow>
        <h1 id="hero-heading" className="dental-display max-w-xl text-5xl leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">A little more care.<br /><span className="italic text-[#638570]">A lot more smile.</span></h1>
        <p className="mt-6 max-w-md text-base leading-7 text-[#5a6b61] sm:text-lg">Feel heard. Feel at ease. Discover thoughtful dental care that puts you first, from your first hello to your next happy smile.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5"><a className={primaryButton} href="#booking">Find your appointment <Arrow /></a><a href="#care" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline decoration-[#183f39]/30 underline-offset-4 transition-colors hover:text-[#638570]">Get to know our care</a></div>
        <div className="mt-9 flex items-center gap-3 border-t border-[#183f39]/10 pt-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6eddf] text-lg" aria-hidden="true">✓</span><p className="text-sm leading-6"><strong className="block font-semibold">Your comfort comes first.</strong><span className="text-[#5a6b61]">Clear conversations. Time to ask questions.</span></p></div>
      </div>
      <div className="relative mx-auto w-full max-w-lg pb-6">
        <div className="overflow-hidden rounded-t-[48%] rounded-b-3xl bg-[#dce5da]"><Image src={assetPath("/images/dental/studio.svg")} alt="Illustration of a calm dental studio with a sage green treatment chair, arched window, and indoor plants" width={640} height={720} sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 512px, 480px" preload fetchPriority="high" unoptimized className="h-auto w-full" /></div>
        <div className="absolute bottom-0 left-3 right-3 flex items-center justify-between gap-4 rounded-2xl border border-[#183f39]/10 bg-[#fffdf8] p-5 shadow-[0_12px_30px_-15px_#183f3940] sm:left-6 sm:right-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687868]">Space to feel at ease</p><p className="dental-display mt-1 text-xl">Come as you are. Leave smiling.</p></div><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf0e6]" aria-hidden="true"><Arrow className="-rotate-45" /></span></div>
      </div>
    </Container>
    <div className="border-y border-[#183f39]/10 bg-[#eff1e9]"><Container className="grid grid-cols-1 gap-4 py-5 text-center text-sm sm:grid-cols-3"><p>✦ &nbsp; Care at your pace</p><p>✦ &nbsp; Transparent treatment plans</p><p>✦ &nbsp; Every smile is welcome</p></Container></div>
  </section>;
}
