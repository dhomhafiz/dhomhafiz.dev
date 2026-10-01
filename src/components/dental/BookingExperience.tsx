"use client";

import { useState } from "react";
import { BookingForm } from "./BookingForm";
import { PricingTable } from "./PricingTable";
import { treatments } from "./content";
import { Container, Eyebrow } from "./ui";

export function BookingExperience() {
  const [treatmentId, setTreatmentId] = useState(treatments[0].id);
  return <>
    <PricingTable selectedId={treatmentId} onSelect={treatment => {
      setTreatmentId(treatment.id);
      document.getElementById("booking")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      document.getElementById("treatment")?.focus({ preventScroll: true });
    }} />
    <section id="booking" aria-labelledby="booking-heading" className="py-16 sm:py-24"><Container className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"><div className="lg:sticky lg:top-20"><Eyebrow>Your next happy hello</Eyebrow><h2 id="booking-heading" className="dental-display text-4xl leading-tight tracking-tight sm:text-5xl">A healthier smile<br />starts with <span className="italic text-[#638570]">a hello.</span></h2><p className="mt-5 max-w-sm text-base leading-7 text-[#5a6b61]">Choose your visit. Pick a time. Take that first step at your own pace.</p><ol className="mt-9 space-y-6">{["Find the right care for you", "Choose a day that fits your life", "Preview your appointment details"].map((text, index) => <li key={text} className="flex items-center gap-4 text-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#183f39]/20 text-xs">0{index + 1}</span>{text}</li>)}</ol><div className="mt-10 rounded-2xl bg-[#e8eddf] p-6"><p className="dental-display text-2xl">A note about this space</p><p className="mt-3 text-sm leading-6 text-[#5a6b61]">This is a fictional clinic template. Treatments, prices, and appointment times are examples to help you explore the experience.</p></div></div><BookingForm treatmentId={treatmentId} onTreatmentChange={setTreatmentId} /></Container></section>
  </>;
}
