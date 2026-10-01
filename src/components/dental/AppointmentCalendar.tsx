"use client";

import { useEffect, useState } from "react";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AppointmentCalendar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [today, setToday] = useState<Date | null>(null);
  const [offset, setOffset] = useState(0);
  // Resolve the visitor's local date after hydration, including on static hosting.
  useEffect(() => { const now = new Date(); now.setHours(0, 0, 0, 0); setToday(now); }, []);
  if (!today) return <div className="flex min-h-80 items-center justify-center text-sm text-[#5a6b61]" role="status">Loading appointment dates…</div>;
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const title = month.toLocaleDateString("en-MY", { month: "long", year: "numeric" });
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = (month.getDay() + 6) % 7;
  return <div className="rounded-xl border border-[#183f39]/15 p-3 sm:p-4">
    <div className="mb-3 flex items-center justify-between"><button type="button" disabled={offset === 0} aria-label="Previous month" onClick={() => setOffset(offset - 1)} className="h-11 w-11 rounded-full transition-colors hover:bg-[#eff1e9]">←</button><p aria-live="polite" className="text-sm font-semibold">{title}</p><button type="button" disabled={offset === 2} aria-label="Next month" onClick={() => setOffset(offset + 1)} className="h-11 w-11 rounded-full transition-colors hover:bg-[#eff1e9]">→</button></div>
    <div className="grid grid-cols-7 gap-1 text-center text-xs">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day} className="pb-2 text-[#5a6b61]" aria-hidden="true">{day.slice(0, 1)}</span>)}{Array.from({ length: leading }, (_, i) => <span key={`blank-${i}`} aria-hidden="true" />)}{Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
      const key = dateKey(date);
      const disabled = date <= today || date.getDay() === 0;
      return <button type="button" key={key} disabled={disabled} aria-pressed={value === key} aria-label={date.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} onClick={() => onChange(key)} className={`min-h-11 rounded-lg transition-colors disabled:opacity-30 ${value === key ? "bg-[#183f39] font-semibold text-white" : "enabled:hover:bg-[#e6eddf]"}`}>{i + 1}</button>;
    })}</div><p className="mt-3 text-xs leading-5 text-[#5a6b61]">Sample availability · Tomorrow onwards · Closed Sundays</p>
  </div>;
}
