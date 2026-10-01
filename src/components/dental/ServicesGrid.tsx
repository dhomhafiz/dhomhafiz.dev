import { Arrow, Container, Eyebrow, ToothMark } from "./ui";

const services = [
  { number: "01", title: "Everyday essentials", description: "Check-ups, cleaning, and the little things that keep your smile feeling like you.", detail: "Check-ups · Scale & polish" },
  { number: "02", title: "A smile, reimagined", description: "Explore your smile goals with a personal consultation and a clear plan for your care.", detail: "Whitening · Clear aligners" },
  { number: "03", title: "Care for every chapter", description: "A welcoming place to ask questions and plan care around your changing needs.", detail: "Personal care · Ongoing support" },
];

export function ServicesGrid() {
  return <section id="care" aria-labelledby="care-heading" className="py-16 sm:py-24"><Container>
    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Eyebrow>Made around you</Eyebrow><h2 id="care-heading" className="dental-display text-4xl tracking-tight sm:text-5xl">Small details. Better care.</h2></div><p className="max-w-xs text-sm leading-6 text-[#5a6b61]">From a simple check-up to a new smile goal, let’s take the next step together.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{services.map((service, index) => <article key={service.number} className={`group rounded-2xl border border-[#183f39]/10 p-6 transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg sm:p-8 ${index === 1 ? "bg-[#e8eddf]" : "bg-[#fffdf8]"}`}><div className="mb-9 flex items-center justify-between"><ToothMark className="h-10 w-10 text-[#65856d]" /><span className="text-xs text-[#5a6b61]">/ {service.number}</span></div><h3 className="dental-display text-2xl">{service.title}</h3><p className="mt-3 text-sm leading-6 text-[#5a6b61]">{service.description}</p><p className="mt-6 border-t border-[#183f39]/10 pt-5 text-xs text-[#5a6b61]">{service.detail}</p><a href="#pricing" className="mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-semibold">Explore {index === 0 ? "essential" : index === 1 ? "cosmetic" : "personal"} care <Arrow className="transition-transform group-hover:translate-x-1" /></a></article>)}</div>
  </Container></section>;
}
