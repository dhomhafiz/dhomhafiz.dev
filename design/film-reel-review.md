# 35mm project archive — local review

The Personal Projects grid is now a continuous film strip. The existing App Router,
static export, Inter typography, hero, header and Contact design remain in place.
No packages, hosting settings or original project records were changed.

## Files

- `src/components/features/editorial/SelectedWork.tsx`: server-side section and data mapping.
- `src/components/features/editorial/FilmReel.tsx`: native snapping, mouse drag,
  touch, controls, information reveal, keyboard handling and position restoration.
- `src/components/features/editorial/film.css`: film stock, lightweight SVG
  perforations, static grain, responsive exposures, focus and shared transitions.
- `src/lib/workProjects.ts`: presentation adapter over the existing provider;
  optional editorial sections and authentic gallery images, without duplicating
  original descriptions, technologies, locations or photo credits.
- `src/app/work/[slug]/page.tsx` and `work.css`: statically generated case studies,
  unique canonical/Open Graph/Twitter metadata and previous/next navigation.
- `src/app/sitemap.ts`: includes both case study routes.
- `src/components/features/editorial/ContactMotion.tsx`: completes the existing
  desktop animation within one pixel of its endpoint; native anchor scrolling can
  round the fluid reel's fractional layout coordinates.
- `tests/film-reel.spec.mjs`: focused interaction, responsive, route, metadata,
  media loading, Back, no-JavaScript and native transition checks.
- `tests/cinematic-release.spec.mjs` and `tests/seo.spec.mjs`: existing expectations
  updated for the case-study route before the demo and expanded sitemap.

## Interaction

Horizontal scroll snap supplies touch inertia. Mouse dragging tracks the pointer
and settles to the nearest frame. Arrow buttons, Left/Right, Home and End also
navigate. Normal vertical scrolling stays native; there is no autoplay.

Hover reveals the original information over a gradually blurred exposure.
On touch, tap the frame to reveal; Close, Escape, moving focus outside the frame,
or tapping outside dismisses it. The View Project anchor is separate from the
reveal button. Long descriptions scroll inside the exposure while the CTA stays
visible. The film geometry stays fixed during reveal.

Native cross-document View Transitions match the selected image to the case-study
hero. The source's image is unblurred for its snapshot. Unsupported browsers use
normal anchors and a short destination entrance fade. Reduced motion disables
elaborate transitions. Navigation has no animation timer or click interception.
Session storage optionally remembers the frame; native browser history restores
the page's vertical scroll. A no-JavaScript project link list is also available.

## Routes and content

- `/work/still-dental/`: concept overview, implementation notes, two existing
  website screenshots and the original `/demo-dental/` action.
- `/work/netflix-squid-game-2/`: original installation description, implementation
  contribution, physical button interaction and The Rakyat Post attribution.

No event-production role, direct Netflix relationship, business results or
additional screenshots have been invented. The installation uses an editorial
single-image treatment because no additional authentic imagery is present.

## Local preview

```powershell
npm run dev
```

Open `http://127.0.0.1:3000/#works`. To inspect the production export instead:

```powershell
npm run build
npm run preview:validation
```

Open `http://127.0.0.1:4173/#works`. Both routes are available directly at the
same origin. No deployment or merge has been performed. The workspace's Git
permissions prevented creating the preferred feature branch.

## QA artifacts

Before screenshots: `artifacts/film-before-{390,1440}.png`.
After screenshots: `artifacts/film-after-WIDTHxHEIGHT.png`.
Reveals: `artifacts/film-reveal-WIDTHxHEIGHT.png`.
Case studies: `artifacts/case-{dental,netflix}-WIDTHxHEIGHT.png`.

The focused suite covers 375, 390, 768, 1024, 1440 and 1920px, plus short
390×568 and 1024×600 viewports. Touch gestures use Chromium's actual input
dispatch, not a substitute `scrollLeft` mutation. Physical iOS/Android device
testing is outside this local browser verification.

Lint is unavailable: `npm run lint` reports that no lint script is configured.
Build and TypeScript checks include the statically generated project routes.

Final validation:

- Production build and `npm run typecheck`: passed.
- `npm test`: 78 promotion checks passed.
- Existing browser regression coverage: 46 tests passed (hero/header, Contact,
  media loading, SEO, sitemap and the complete dental booking demo).
- Final `tests/film-reel.spec.mjs` run: all 13 tests passed. A reveal activation
  now explicitly opens the panel, so an intervening mouse hover cannot make
  Enter/Space accidentally toggle it closed on a short screen.
- No page errors or console warnings/errors in the normal-motion navigation test.
- The native shared-image View Transition was verified through `pageswap`.
- Local production Lighthouse, v13.5: mobile performance 95; desktop 100.
  Accessibility, Best Practices and SEO: 100 for both. CLS: 0 for both.
  These are single local lab samples, not field performance guarantees.
- Audit JSON/HTML: `artifacts/film-lighthouse-*`.
- `git diff --check`: passed.
