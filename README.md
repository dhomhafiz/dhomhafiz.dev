# Editorial portfolio — dhomhafiz.dev

Next.js App Router, TypeScript, React and Tailwind; static export to `out/`. No additional dependencies. Current home page is composed in `PortfolioPage.tsx` using the existing provider contract. Older cinematic components and pricing utilities are retained but are no longer rendered on the homepage.

## Local development

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run test:release
```

Node 20.9+ required. On Windows use `npm.cmd`. `npm run preview:validation` serves the export on http://127.0.0.1:4173. For an already running preview set `PLAYWRIGHT_BASE_URL` before browser tests. No deployment is needed for local review.

## Content and contact

- `src/config/portfolio.ts`: existing provider, owner image and email. Existing prices and promotional configuration remain here; their 78 checks remain under `npm test`.
- `src/config/editorial.ts`: services, the single hero video, and the single WhatsApp number setting. Set `contact.whatsappNumber` to the verified international number with country code, digits only. The URL builder validates the number and encodes the initial message. An empty number disables the WhatsApp CTA and shows an explicit notice; email remains available.
- `src/components/features/editorial/`: hero video behavior, selected work, services, contact and scoped styling. The hero loads one looping video, pauses when hidden/offscreen, and supports manual play, blocked autoplay, failure posters, reduced motion and Save-Data. Reduced motion and Save-Data do not request video until Play is pressed.
- `/demo-dental/`: retained fictional clinic with working local appointment preview. It sends and stores no personal data. The homepage labels it as Concept Project.

## Assets and sources

See [media sources](design/editorial-media-sources.md). Inter is self-hosted with `next/font/local` and its SIL OFL license. No build-time Google Fonts request is required. Website videos are recordings of this repository's own demo, not borrowed footage. `scripts/record-editorial.mjs` can reproduce source recordings against a local production preview on port 4174; raw media remains in ignored `.media-source/`. FFmpeg encodes H.264 MP4 at 1120px, 24fps, CRF 27 with faststart.

## Verification

Browser tests cover 320, 390, 768, 1440 and 1920px, actual video decoding/time advancement, playback controls, blocked autoplay, media errors, reduced motion, loaded local font, anchor navigation, WhatsApp placeholder state, and the dental booking interaction. Screenshots are generated at `artifacts/editorial-*.png`. Previous cinematic tests were replaced to reflect the current homepage; pricing regression checks are retained.

## SEO

`src/config/seo.ts` is the shared public identity and page metadata source. Home targets Mohd Hafiz's landing page design in Klang Valley, Malaysia. `/demo-dental/` has its own title, description, canonical URL and social text and explicitly describes a fictional demo. Site text is English; social locale is `en_MY`.

Root metadata is composed in `src/app/layout.tsx`; dental metadata is in `src/app/demo-dental/page.tsx`. Existing `src/app/opengraph-image.jpg` and `src/app/opengraph-image.alt.txt` are retained unchanged and used by both routes. `src/app/robots.ts` exports robots.txt with the public sitemap URL. `src/app/sitemap.ts` includes the two canonical routes with trailing slashes. Update each `pageSeo.*.lastModified` date when its page changes substantively; a build alone should not refresh these dates.

`tests/seo.spec.mjs` verifies emitted production metadata, canonical URLs, inherited OG image and alt, robots.txt and sitemap. These are local checks; production deployment and search-engine recrawling are separate steps. Reference: https://developers.google.com/search/docs/fundamentals/get-started-developers and https://nextjs.org/docs/app/getting-started/metadata-and-og-images .
