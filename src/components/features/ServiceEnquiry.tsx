"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/common/Button";

const EnquiryContext = createContext<{
  packageId: string;
  setPackageId: (id: string) => void;
} | null>(null);

export function ServiceEnquiryProvider({ children }: { children: ReactNode }) {
  const [packageId, setPackageId] = useState("");
  return <EnquiryContext.Provider value={{ packageId, setPackageId }}>{children}</EnquiryContext.Provider>;
}

export function useServiceEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("Service enquiry controls require ServiceEnquiryProvider.");
  return context;
}

export function PackageEnquiryLink({ id, title, recommended, children }: {
  id: string; title: string; recommended?: boolean; children: ReactNode;
}) {
  const { setPackageId } = useServiceEnquiry();
  return (
    <ButtonLink
      href="#contact-form"
      variant={recommended ? "primary" : "secondary"}
      className="w-full"
      aria-label={`Enquire about ${title}`}
      onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const form = document.getElementById("contact-form");
        if (!form) return;
        event.preventDefault();
        setPackageId(id);
        document.getElementById("contact-package")?.focus({ preventScroll: true });
        // Start scrolling after focus and the selected package have been applied.
        // Focusing a control during a smooth scroll can cancel it in some browsers.
        requestAnimationFrame(() => {
          const headerHeight = document.querySelector("body > header")?.getBoundingClientRect().height ?? 0;
          window.scrollTo({
            top: window.scrollY + form.getBoundingClientRect().top - headerHeight - 24,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          });
        });
      }}
    >
      {children}<span aria-hidden="true">↓</span>
    </ButtonLink>
  );
}
