import type { ReactNode } from "react";

export const primaryButton = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#183f39] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#285b50] motion-safe:hover:-translate-y-0.5 active:translate-y-0";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#4e6d60]">{children}</p>;
}

export function Arrow({ className = "" }: { className?: string }) {
  return <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function ToothMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 10C8 2 4 14 9 24c3 7 3 12 7 11 3-1 0-12 4-12s1 11 4 12c4 1 4-4 7-11 5-10 1-22-11-14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m16 9 8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
