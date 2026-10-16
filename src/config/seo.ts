// Shared public identity and page copy keep search and social previews consistent.
export const site = {
  url: "https://dhomhafiz.dev",
  name: "dhomhafiz.dev",
  owner: "Mohd Hafiz Abd Rahim",
  locale: "en_MY",
} as const;

export const pageSeo = {
  home: {
    path: "/",
    title: "I Build Fast Landing Pages | Mohd Hafiz, Kuala Lumpur",
    description: "I build fast landing pages for businesses. Mohd Hafiz, a webdesigner in Kuala Lumpur, Malaysia, focused on responsive design and easy WhatsApp enquiries.",
    keywords: ["Mohd Hafiz Abd Rahim", "Dhom Hafiz", "dhomhafiz.dev", "webdesigner Kuala Lumpur", "landing page design Malaysia", "fast landing pages", "responsive web design", "business landing pages"],
    lastModified: "2026-10-17",
  },
  dental: {
    path: "/demo-dental/",
    title: "Still Dental | Dental Website Demo by Mohd Hafiz",
    description: "Explore Still Dental, a fictional dental clinic website demo by Mohd Hafiz. Preview responsive design, sample treatments, pricing and appointment booking.",
    keywords: ["Still Dental", "dental website demo", "dental clinic website design", "appointment booking demo", "Mohd Hafiz portfolio"],
    lastModified: "2026-10-17",
  },
} as const;
