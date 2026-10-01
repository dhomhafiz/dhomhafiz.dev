"use client";

import { useRef, useState, type FormEvent } from "react";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { treatments } from "./content";
import { Arrow, primaryButton } from "./ui";

const inputClass = "mt-2 min-h-12 w-full min-w-0 rounded-lg border border-[#183f39]/20 bg-white px-3 py-2 text-base transition-colors hover:border-[#638570]";
const slots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export function BookingForm({ treatmentId, onTreatmentChange }: { treatmentId: string; onTreatmentChange: (id: string) => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const calendarRef = useRef<HTMLFieldSetElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const chosen = date ? new Date(`${date}T00:00:00`) : null;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (!chosen || chosen <= now || !time) {
      setError("Please choose a future appointment date and a time.");
      calendarRef.current?.focus();
      return;
    }
    const treatment = treatments.find(item => item.id === treatmentId)!;
    setError("");
    setConfirmation(`${treatment.name} · ${chosen.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })} at ${time}`);
    event.currentTarget.reset();
  }

  if (confirmation) return <div role="status" className="rounded-2xl border border-[#183f39]/15 bg-[#fffdf8] p-8"><span aria-hidden="true" className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6eddf] text-xl">✓</span><h3 className="dental-display text-3xl">Your appointment preview</h3><p className="mt-5 text-base leading-7">{confirmation}</p><p className="mt-4 text-sm leading-6 text-[#5a6b61]">This is a demo, so no appointment has been booked. Your form details have not been sent or saved.</p><button type="button" className={`${primaryButton} mt-6`} onClick={() => { setConfirmation(""); setDate(""); setTime(""); }}>Explore another appointment <Arrow /></button></div>;

  return <form onSubmit={submit} className="min-w-0 rounded-2xl border border-[#183f39]/15 bg-[#fffdf8] p-5 sm:p-8">
    <h3 className="dental-display text-2xl">Let’s find a time for you.</h3>
    <p className="mt-2 text-xs leading-5 text-[#5a6b61]">Demo only. No data is sent or stored. All fields required unless marked optional.</p>
    <label className="mt-6 block text-sm font-medium" htmlFor="treatment">Your visit<select id="treatment" name="treatment" value={treatmentId} onChange={event => onTreatmentChange(event.target.value)} className={inputClass}>{treatments.map(item => <option key={item.id} value={item.id}>{item.name} — from RM {item.price}</option>)}</select></label>
    <fieldset ref={calendarRef} tabIndex={-1} aria-describedby={error ? "booking-error" : undefined} className="mt-6 min-w-0"><legend className="mb-3 text-sm font-medium">Choose your date and time</legend><AppointmentCalendar value={date} onChange={value => { setDate(value); setTime(""); setError(""); }} /><div role="group" aria-label="Appointment times" className="mt-3 grid grid-cols-3 gap-2">{slots.map(slot => <button key={slot} type="button" disabled={!date} aria-pressed={time === slot} onClick={() => { setTime(slot); setError(""); }} className={`min-h-11 rounded-lg border text-sm transition-colors ${time === slot ? "border-[#183f39] bg-[#183f39] text-white" : "border-[#183f39]/20 enabled:hover:bg-[#e6eddf]"}`}>{slot}</button>)}</div><p aria-live="polite" className="mt-3 text-xs text-[#5a6b61]">{date ? `Selected: ${date}${time ? ` at ${time}` : ". Now choose a time."}` : "Select a date to see sample times."} Times are in Malaysia time (MYT).</p></fieldset>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label htmlFor="patient-name" className="text-sm font-medium">Full name<input id="patient-name" name="name" autoComplete="name" required maxLength={100} className={inputClass} placeholder="Your name" /></label><label htmlFor="patient-email" className="text-sm font-medium">Email address<input id="patient-email" name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} placeholder="you@example.com" /></label></div>
    <label htmlFor="patient-note" className="mt-4 block text-sm font-medium">Anything we should know? <span className="font-normal text-[#5a6b61]">(optional)</span><textarea id="patient-note" name="note" rows={2} maxLength={500} className={`${inputClass} resize-y`} placeholder="For this demo, please avoid personal health details." /></label>
    {error && <p id="booking-error" role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
    <button type="submit" className={`${primaryButton} mt-5 w-full`}>Preview my appointment <Arrow /></button>
    <p className="mt-3 text-center text-xs text-[#5a6b61]">No payment. No real booking. Just a preview.</p>
  </form>;
}
