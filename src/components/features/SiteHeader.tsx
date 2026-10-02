import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ButtonLink } from "@/components/common/Button";

// ISP: the header receives primitives instead of a whole portfolio object.
export function SiteHeader({ brand, overlay = false }: { brand: string; overlay?: boolean }) {
  return <header className={`${overlay ? "fixed inset-x-0" : "sticky"} top-0 z-50 border-b border-cyber-border/10 bg-cyber-dark/95 backdrop-blur-md`}>
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-12 lg:px-20">
      <a id="site-home" href="#main" aria-label={`${brand} home`} className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight">
        <span aria-hidden="true" className="text-cyber-cyan">//</span>{brand}
      </a>
      <div className="flex items-center gap-3"><ThemeToggle /><ButtonLink href="#contact" variant="secondary" className="!min-h-11 !px-4 !py-2">Let’s talk <span aria-hidden="true">↗</span></ButtonLink></div>
    </div>
  </header>;
}
