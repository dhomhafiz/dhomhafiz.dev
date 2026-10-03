import type { ServiceTier } from "../types/portfolio";

export function getActivePromotion(tier: ServiceTier, now: Date) {
  const price = tier.promotionalPrice;
  const end = tier.promotionEndDate;
  // Only fixed RM prices support a discount; custom quotes retain their normal UI.
  const baseMatch = /^RM\s+(\d+(?:,\d{3})*(?:\.\d{1,2})?)$/.exec(tier.price);
  if (!tier.promotionEnabled || typeof price !== "number" || !Number.isFinite(price) ||
      price < 0 || !baseMatch || price >= Number(baseMatch[1].replaceAll(",", "")) ||
      !end || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isFinite(now.getTime())) return null;

  const [year, month, day] = end.split("-").map(Number);
  // Construct calendar parts locally instead of parsing a date-only string as UTC.
  const endDate = new Date(0);
  endDate.setFullYear(year, month - 1, day);
  endDate.setHours(12, 0, 0, 0);
  if (endDate.getFullYear() !== year || endDate.getMonth() !== month - 1 || endDate.getDate() !== day) return null;
  const today = `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (today > end) return null;

  return {
    price: `RM ${price.toLocaleString("en-MY", { maximumFractionDigits: 2 })}`,
    endDate: end,
    endLabel: endDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}
