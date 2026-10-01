import { faqs } from "./content";
import { Container, Eyebrow } from "./ui";

export function FAQ() {
  return <section id="questions" aria-labelledby="faq-heading" className="py-16 sm:py-24"><Container className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]"><div><Eyebrow>A little clarity</Eyebrow><h2 id="faq-heading" className="dental-display text-4xl tracking-tight sm:text-5xl">Good questions.<br /><span className="italic text-[#638570]">Honest answers.</span></h2><p className="mt-5 max-w-xs text-sm leading-6 text-[#5a6b61]">Getting comfortable starts with knowing what to expect.</p></div><div>{faqs.map(({ question, answer }) => <details key={question} className="group border-b border-[#183f39]/15 py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-medium [&::-webkit-details-marker]:hidden">{question}<span className="text-xl font-normal transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-4 pr-6 text-sm leading-7 text-[#5a6b61]">{answer}</p></details>)}</div></Container></section>;
}
