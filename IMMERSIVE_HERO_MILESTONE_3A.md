# Milestone 3A - First immersive Dental project screen

Local prototype on `feature/immersive-hero-poc`. One Dental screen only. No additional project screens, Contact world destination, deployment or merge.

## Architecture and project data

The existing Canvas, renderer, CameraRig, ScrollTrigger coordinator and readiness pipeline are reused. `RouteGallery.tsx` adds geometry to the same world; it does not replace the highway or create a second canvas, renderer or animation loop.

`getGalleryProject` in `src/lib/workProjects.ts` derives a serializable screen view from the same sorted portfolio projects consumed by the existing film-strip. It selects the existing template with `presentation: dental`, uses its title/category, generates the existing case-study route with `workHref`, and selects the first case-study gallery image (falling back to the project image). There is no second project catalogue or duplicated project description.

The current preview is the existing 1440 x 1000 `public/images/dental-home.webp`, 63,598 bytes. It is an sRGB texture contained inside the physical display without stretching or cropping. No image assets or dependencies were added; no live website, iframe or video is embedded.

## Physical environment

A low-poly open-front pavilion begins near the highway's final approach. It has a flush floor apron, six steel posts, a broad canopy, warm ceiling strips, cooler floor guides, a framed display and a shallow plinth. Shared unit-box geometry and a shared metal material serve the posts, roof and frame. Two local point lights illuminate the architecture without shadow maps. The screen uses a self-lit basic material, with a separate warm border that brightens on hover. No bloom, post-processing or additional environment maps.

The existing road, terrain, sky, rails, chevrons, shaders, fog and original lighting are retained. The architecture is always present in the world, including during approach and reverse travel; there is no scene swap or cut.

## Camera extension and scroll

The path retains the four highway waypoints and appends approach/arrival points:

| Progress | Position x, y, z |
| --- | --- |
| 0 | 0, 2.25, 6 |
| 0.2 | -0.45, 2.35, -24 |
| 0.4 | 0.65, 2.5, -65 |
| 0.6 | 0.2, 2.7, -108 |
| 0.8 | 0.15, 3.2, -133 |
| 1 | 0, 4.6, -157 |

A centripetal Catmull-Rom curve gives continuous, reversible position. From 55% progress, tangent-following orientation blends toward the screen centre at world position 0, 5.4, -172. The original opening offsets and existing 8/s journey-progress damping remain. Camera FOV stays 58 degrees. At narrower desktop aspect ratios the final approach pulls back smoothly, with a bounded 25-unit retreat, to frame the display without changing the hero lens.

The native sticky track now has four hero-heights of travel, followed by one hero-height for the gallery viewport. Projects still animates actual scroll using the single coordinator, and manual input can interrupt it. `#works` resolves to the 3D arrival when enhancement is ready; reduced-motion/unsupported visitors retain its original HTML destination. `#works-film` is an explicit direct link to the unchanged film-strip section. Contact uses its existing navigation and HTML section.

Hero sensitivity values are unchanged (+/-8 degrees yaw, +/-3 degrees pitch, 6/s response, 0.1/0.02 positional parallax). Arrival retains approximately 19% of that mouse influence as a subtle exploration layer. Mouse offsets remain relative to the authored path.

## Pointer, keyboard and presentation state

R3F's existing event manager connects to the hero element, allowing raycast hover and click on the actual textured mesh despite the canvas's decorative DOM layer. Hover brightens the physical border, shows a pointer cursor and highlights the HTML case-study link. Clicking the screen opens the existing Dental case-study URL. Events originating from HTML links/buttons do not trigger the mesh action.

The gallery title and normal case-study anchor live in HTML outside the aria-hidden canvas. Projects completion focuses the gallery heading; Tab reaches the case-study link. An explicit film-strip link switches to the HTML gallery through ordinary document scrolling. The inactive presentation is inert: the experimental controls cannot receive focus outside arrival, and the film-strip cannot receive focus while the 3D presentation is active. Fully departed hero copy/CTAs also become inert, preventing invisible hero links from covering gallery controls. Reverse scrolling restores them.

The original film-strip DOM and project links remain available for SEO and fallback. Only a fragment anchor and programmatic heading focus target were added to SelectedWork; FilmReel and ProjectFrame were not rewritten. When reduced-motion is enabled or WebGL is lost at gallery arrival, the enhanced track releases and the user is sent to the usable HTML Works destination.

## Loading and failure behavior

The preview loads only through the dynamically imported eligible desktop scene. A shared Suspense boundary waits for the essential texture before mounting SceneReadiness. The existing compileAsync, hidden first render, GPU fence and short poster fade remain intact; Suspense is not treated as GPU readiness. No loading delay was added.

The original poster, HTML hero and native navigation remain usable during loading. If preview loading fails, the existing scene boundary retains the poster and HTML gallery. Low-power, mobile/coarse-pointer and reduced-motion paths keep the existing lightweight fallback without the gallery texture. Pause freezes the renderer; scrolling remains normal and resume follows current progress. History, direct fragment links, reload backup and case-study return reuse the existing coordinator. Initial restoration aligns synchronously after track measurement, before the first live camera frame; subsequent browser history events are aligned in the next animation frame.

## Files changed for 3A

- `src/lib/workProjects.ts`: derived GalleryProject view model from existing shared data.
- `src/components/features/PortfolioPage.tsx`: pass that view model into the immersive boundary.
- `src/components/features/editorial/SelectedWork.tsx`: HTML-gallery fragment alias and heading focus target.
- `src/components/features/immersive/ImmersiveHero.tsx`: shared data, hover feedback and accessible experimental HTML controls.
- `src/components/features/immersive/RouteGallery.tsx`: new physical pavilion and interactive texture-mapped screen.
- `src/components/features/immersive/RouteScene.tsx`: mount gallery inside existing canvas/readiness boundary, share event source and apply arrival framing/mouse layer.
- `src/components/features/immersive/routeCameraPath.ts`: append gallery approach and aim toward the display.
- `src/components/features/immersive/routeJourneySettings.ts`: extended track and shared active-gallery state.
- `src/components/features/immersive/useImmersiveJourney.ts`: gallery destination, presentation focus/inert coordination and fallback handoff.
- `src/components/features/immersive/immersive.css`: experimental HUD, hover cursor and HTML gallery anchor styling.
- `src/hooks/useHeroVideoTransition.ts`: header Projects state also recognizes the physical gallery.
- `tests/immersive-gallery.spec.mjs`: new gallery rendering, raycast hover/click, keyboard/film switching, restoration and preview readiness/failure tests.
- `tests/camera-path.check.mjs`: updated safety/continuity checks for the longer path.
- `tests/camera-interaction.spec.mjs`: highway sample location updated for the extended path.
- `tests/immersive-journey.spec.mjs`: arrival expectations updated for the gallery and fallback handoff.
- `IMMERSIVE_HERO_MILESTONE_3A.md`: this handoff.

Earlier uncommitted work is retained. No changes to package manifests, original RouteEnvironment/shaders, project content/configuration, case-study pages or Contact components for this milestone.

## Validation

- TypeScript passed: `npm.cmd run typecheck`.
- Seven numerical checks passed: `node --test tests/camera-path.check.mjs tests/camera-interaction.check.mjs`.
- Initial browser validation confirmed continuous travel, actual screen hover/click, case-study return, deep links and preview-load failure. It exposed invisible departed hero links intercepting the gallery controls; inert handling fixed this and the focused keyboard/film-switch test passed.
- All 29 distinct targeted browser checks passed across the main and focused runs: 27 scene/journey/readiness/fallback checks plus two existing film-strip interaction checks. The final four-check run passed both extended gallery scenarios again (continuous-pointer hover through approach, narrow framing, reverse travel, initial restoration and deep links) and the existing mouse/keyboard and touch/swipe film-strip scenarios.
- The desktop arrival, approach and narrower-desktop screenshots were visually inspected. Local screenshots: `artifacts/milestone-3a/journey-0.png` through `journey-4.png`, `hover.png`, and `narrow-gallery.png`.

## Preview and limitations

The existing development server remains at http://127.0.0.1:3000. If stopped, run `npm.cmd run dev`. Scroll through the highway or click Projects; hover/click the Dental display, use its HTML case-study link, or choose View film-strip gallery.

```powershell
npm.cmd run typecheck
node --test tests/camera-path.check.mjs tests/camera-interaction.check.mjs
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'
npx.cmd playwright test tests/immersive-gallery.spec.mjs tests/immersive-journey.spec.mjs tests/immersive-hero.spec.mjs tests/immersive-initialization.spec.mjs tests/header-navigation.spec.mjs tests/camera-interaction.spec.mjs --grep-invert 'native forward and reverse|refresh restores mid-journey' --reporter=list
npx.cmd playwright test tests/film-reel.spec.mjs --grep 'mouse drag, hover|touch tap reveals' --reporter=list
```

This is an experimental desktop experience with one static website preview. Links/buttons visible inside the texture are pixels; selection opens the project case study. Extremely narrow windows retain less physical screen coverage even with bounded retreat; mobile uses the HTML fallback. Real mobile GPUs, Safari, Firefox and physical high-refresh displays were not measured. No FPS or Lighthouse claims. A production build and unrelated regression suites were deliberately not run. Storage-disabled reload restoration still relies on native history/browser behavior.

Stop after the first Dental screen for visual approval. Additional screens and the Contact 3D destination are not implemented.

