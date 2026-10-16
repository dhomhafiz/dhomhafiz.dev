import { assetPath } from "@/lib/assetPath";

// Set a verified international number, with country code and digits only.
export const contact = { whatsappNumber: "60197860823", message: "Hi Dhom Hafiz, I'd like to discuss a landing page for my business." };
export function whatsappHref(number = contact.whatsappNumber) {
  return /^[1-9]\d{7,14}$/.test(number) ? `https://wa.me/${number}?text=${encodeURIComponent(contact.message)}` : undefined;
}
export const heroVideo = {
  title: "Modern programmer workspace with code display",
  src: assetPath("/videos/workspace-34279733.mp4"),
  mobileSrc: assetPath("/videos/workspace-34279733-mobile.mp4"),
  poster: assetPath("/images/workspace-34279733.webp"),
  mobilePoster: assetPath("/images/workspace-34279733-mobile.webp"),
} as const;
export const editorialServices = [
  { title: "Landing page design", text: "A clear story, considered typography and a visual direction that feels like your business." },
  { title: "Responsive development", text: "Thoughtful layouts and accessible interactions, from the smallest phone to the biggest screen." },
  { title: "Performance in the details", text: "Lean pages, optimised media and purposeful motion. Built to make browsing feel effortless." },
  { title: "An easier way to enquire", text: "A clear path from interest to conversation, with WhatsApp enquiries shaped around your offer." },
] as const;
