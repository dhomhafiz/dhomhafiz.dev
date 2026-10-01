import { Arrow, Container, primaryButton, ToothMark } from "./ui";

export function DentalHeader() {
  return <header className="border-b border-[#183f39]/10">
    <Container className="flex min-h-24 flex-wrap items-center justify-between gap-3 py-4">
      <a href="#main" className="flex items-center gap-2"><ToothMark className="h-10 w-10" /><span className="text-2xl font-semibold tracking-tight">still<span className="ml-1 text-sm font-normal tracking-normal"> dental</span></span></a>
      <nav aria-label="Dental clinic" className="hidden items-center gap-8 text-sm md:flex"><a className="transition-colors hover:text-[#578570]" href="#care">Our care</a><a className="transition-colors hover:text-[#578570]" href="#pricing">Pricing</a><a className="transition-colors hover:text-[#578570]" href="#questions">Good to know</a></nav>
      <a href="#booking" className={`${primaryButton} px-4 sm:px-6`}>Book a visit <Arrow /></a>
      <nav aria-label="Dental clinic mobile" className="flex w-full justify-center gap-6 border-t border-[#183f39]/10 pt-3 text-sm md:hidden"><a href="#care">Our care</a><a href="#pricing">Pricing</a><a href="#questions">FAQs</a></nav>
    </Container>
  </header>;
}

export function DentalFooter() {
  return <footer className="bg-[#183f39] py-10 text-[#e6eee6]"><Container className="flex flex-col justify-between gap-6 sm:flex-row"><div><a href="#main" className="flex items-center gap-2 text-2xl font-semibold"><ToothMark className="h-9 w-9" />still dental</a><p className="mt-3 text-sm text-[#cad9cf]">Good care. A calmer you.</p></div><div className="max-w-sm text-sm leading-relaxed text-[#cad9cf]"><p>Still Dental is a fictional clinic. This website is a design and booking demo.</p><a href="#booking" className="mt-3 inline-block underline decoration-white/40 underline-offset-4 hover:text-white">Explore the appointment preview</a></div></Container></footer>;
}
