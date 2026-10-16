"use client";

import { useState, type ReactNode } from "react";

export function WorkCard({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  const [revealed, setRevealed] = useState(false);
  return <article className={`work-card ${className}`} tabIndex={0} aria-label={label} data-revealed={revealed || undefined}
    onPointerDown={event => {
      if (event.pointerType === "touch" && !(event.target as HTMLElement).closest("a")) setRevealed(value => !value);
    }}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setRevealed(value => !value); }
      if (event.key === "Escape") { setRevealed(false); event.currentTarget.blur(); }
    }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setRevealed(false); }}>
    {children}
  </article>;
}
