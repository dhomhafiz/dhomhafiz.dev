# Still Dental demo

Route: `/demo-dental/`. All clinic content and prices are fictional examples.

- `src/app/demo-dental/page.tsx`: server composition and route metadata.
- `DentalShell`, `Hero`, `ServicesGrid`, `FAQ`: semantic static sections.
- `BookingExperience`: coordinates treatment selection between pricing and form.
- `PricingTable`: category filter and treatment selection.
- `AppointmentCalendar`: local-date-aware, keyboard-accessible date buttons; tomorrow through the next two calendar months; Sundays excluded.
- `BookingForm`: native field validation, date/time validation, and local preview confirmation. No API requests or persistence.
- `content.ts`: typed treatment and FAQ data; replace with verified clinic content.
- `ui.tsx`: shared layout and visual primitives.
- `public/images/dental/studio.svg`: local scalable illustration displayed with Next Image and reserved intrinsic dimensions. SVG uses `unoptimized` for static export compatibility.

The visual theme is scoped to `.dental-site`. Interactions use Tailwind transitions and respect the existing global reduced-motion preference. Native details elements keep FAQs usable without JavaScript.

Before using for a real clinic, replace demo branding and prices, connect the form to a booking service, validate and reserve availability server-side, add appropriate privacy information, and replace demo metadata. Do not represent the preview as a confirmed appointment.

Validation: `npm run typecheck` and `npm run build`. Audit a production preview at desktop and mobile widths; a 90+ Lighthouse score is a target, not a guarantee. The route adds no UI or animation dependencies, remote imagery, or third-party scripts.

Verified locally with the production export, gzip compression (as used by `serve`), and the existing `serve.json` cache headers: mobile Lighthouse performance **98**, accessibility **100**, best practices **100**, SEO **100**. LCP was 2.4 seconds. Results depend on deployment and audit conditions. The initial uncompressed preview scored 83 for performance, so retain compression on the production host.

Browser checks passed at 320, 390, 768, and 1440 pixels: no horizontal overflow, loaded illustration, pricing-to-form selection, date/time selection, successful preview submission, and no HTTP or JavaScript errors. Screenshots and the Lighthouse report are in `audits/dental-*`.
