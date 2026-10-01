export type Treatment = {
  id: string;
  name: string;
  category: "essentials" | "cosmetic";
  description: string;
  price: number;
  duration: string;
  included: readonly string[];
};

// Template content and sample prices; replace with verified clinic information.
export const treatments: readonly Treatment[] = [
  { id: "checkup", name: "New patient check-up", category: "essentials", description: "A fresh start for your smile.", price: 90, duration: "30 minutes", included: ["Oral health assessment", "Time for your questions", "Personal care plan"] },
  { id: "clean", name: "Scale & polish", category: "essentials", description: "That just-cleaned feeling.", price: 150, duration: "45 minutes", included: ["Professional cleaning", "Polish and finishing", "At-home care guidance"] },
  { id: "whitening", name: "Whitening consultation", category: "cosmetic", description: "Explore a brighter smile.", price: 100, duration: "30 minutes", included: ["Suitability assessment", "Shade consultation", "Treatment options & quote"] },
  { id: "aligners", name: "Clear aligner consultation", category: "cosmetic", description: "A plan made around you.", price: 120, duration: "45 minutes", included: ["Smile assessment", "Discuss your goals", "Treatment options & quote"] },
];

export const faqs = [
  { question: "What happens at my first visit?", answer: "This template is designed around an unhurried first visit: a conversation about your goals, an oral health assessment, and time to discuss your care plan. Replace this copy with your clinic’s actual process." },
  { question: "I feel nervous about visiting the dentist. Can you help?", answer: "Use the optional appointment note to share any concerns. In a live clinic website, the care team can use this to discuss how to make your visit more comfortable." },
  { question: "Are these the final treatment prices?", answer: "The prices shown are illustrative template content in Malaysian ringgit. A real clinic should confirm the full cost after an assessment and before treatment begins." },
  { question: "Does this form book a real appointment?", answer: "No. This is a portfolio demo. Dates and times are sample availability, and the form only creates an on-screen preview. No information is sent or stored by this form." },
];
