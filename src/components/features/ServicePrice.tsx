"use client";

import { useEffect, useState } from "react";
import { getActivePromotion } from "@/lib/servicePricing";
import type { ServiceTier } from "@/types/portfolio";

export function ServicePrice({ tier }: { tier: ServiceTier }) {
  // Resolve the visitor's calendar after hydration, including on static exports.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const current = new Date();
      setNow(current);
      clearTimeout(timer);
      const midnight = new Date(current);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(refresh, midnight.getTime() - current.getTime());
    };
    refresh();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const promotion = now ? getActivePromotion(tier, now) : null;

  if (!promotion) return <p className="mt-1 font-display text-3xl font-semibold tracking-tight xl:text-4xl">{tier.price}</p>;

  return <>
    <p className="mt-1 font-display text-lg text-cyber-muted"><span className="sr-only">Original price: </span><s>{tier.price}</s></p>
    <p className="mt-1 break-words font-display text-3xl font-semibold tracking-tight xl:text-4xl"><span className="sr-only">Promotional price: </span>{promotion.price}</p>
    <p className="mt-2 text-xs leading-5 text-cyber-cyan">Promo until <time dateTime={promotion.endDate}>{promotion.endLabel}</time></p>
  </>;
}
