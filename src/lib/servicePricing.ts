import type { ServiceTier } from "../types/portfolio";

function roundToCents(price: number) {
  return Math.round((price + Number.EPSILON) * 100) / 100;
}

export function formatServicePrice(price: ServiceTier["price"]) {
  if (typeof price === "string") return price;
  const rounded = roundToCents(price);
  return `RM ${rounded.toLocaleString("en-MY", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getPromotionalPrice(tier: ServiceTier): number | null {
  if (!tier.promotionEnabled) return null;
  // Accept existing formatted RM prices while preserving custom quote labels.
  const baseMatch = typeof tier.price === "string"
    ? /^RM\s+(\d+(?:,\d{3})*(?:\.\d{1,2})?)$/.exec(tier.price) : null;
  const base = typeof tier.price === "number" ? tier.price
    : baseMatch ? Number(baseMatch[1].replaceAll(",", "")) : NaN;
  if (!Number.isFinite(base) || base <= 0) return null;

  let price: number;
  // Missing mode retains compatibility with the original fixed-price configs.
  const mode = tier.promotionType ?? "fixed";
  if (mode === "fixed") {
    if (typeof tier.promotionalPrice !== "number") return null;
    price = tier.promotionalPrice;
  } else if (mode === "percentage") {
    const percent = tier.discountPercent;
    if (typeof percent !== "number" || !Number.isFinite(percent) || percent <= 0 || percent >= 100) return null;
    price = base * (1 - percent / 100);
  } else return null;

  if (!Number.isFinite(price) || price < 0 || price >= base) return null;
  const rounded = roundToCents(price);
  // A tiny discount that rounds back to the base price is not a displayed sale.
  return Number.isFinite(rounded) && rounded < roundToCents(base) ? rounded : null;
}

export function getActivePromotion(tier: ServiceTier, now: Date) {
  const price = getPromotionalPrice(tier);
  const end = tier.promotionEndDate;
  if (price === null || typeof end !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isFinite(now.getTime())) return null;

  const [year, month, day] = end.split("-").map(Number);
  // Construct calendar parts locally instead of parsing a date-only string as UTC.
  const endDate = new Date(0);
  endDate.setFullYear(year, month - 1, day);
  endDate.setHours(12, 0, 0, 0);
  if (endDate.getFullYear() !== year || endDate.getMonth() !== month - 1 || endDate.getDate() !== day) return null;
  const today = `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (today > end) return null;

  return {
    price: formatServicePrice(price),
    discountPercent: tier.promotionType === "percentage" ? tier.discountPercent : undefined,
    endDate: end,
    endLabel: endDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}
