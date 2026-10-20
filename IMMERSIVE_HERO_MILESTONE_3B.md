# Milestone 3B - Multi-billboard journey

Local work on `feature/immersive-hero-poc`. Exactly two billboards, one Canvas and one native-scroll/ScrollTrigger coordinator. No Contact world destination, additional project, dependencies, assets, merge or deployment.

## Configuration and project data

`routeBillboardSettings.ts` now holds a small array of destinations. Each owns its existing project slug, roadside position, yaw, physical display dimensions, focus offset, approach points and scroll intervals. The existing portfolio resolver supplies preview, title, category and case-study href. Portfolio records, case-study routes, film-strip ordering and preview files were not edited.

| Destination | Position | Facing | Display | Viewing interval |
| --- | --- | --- | --- | --- |
| Still Dental | [15.9, 13.6, -138] | -0.45 radians | 15.1 x 10.6 | 40-50% |
| Netflix Squid Game 2 Interactive Poll System | [-15.9, 13.6, -218] | +0.45 radians | 15.1 x 11.425 | 92-100% |

The second billboard is 80 world units farther along the left shoulder. Both faces point toward approaching traffic and both structures stay outside the +/-7.6 guardrails. The original road reaches z=-260, 42 units past the second display. Terrain, sky, clouds, road materials and environmental geometry were not changed. Terrain naturally conceals portions of the foundations, while both display faces remain clear in inspected screenshots.

The original `dental-home.webp` (1440 x 1000) and `squid-game-2-installation.webp` (1024 x 768) are loaded through the existing `ProjectScreen3D` path. Each aperture matches its source aspect ratio with a small border; no stretching, crop or generated replacement image.

## Reuse and camera architecture

`RouteGallery` creates one shared set of box/cylinder geometries and steel, concrete, trim, emissive fixture and edge materials. The existing polished structure is rendered from configuration for each project. Each retains its five upper floodlight fixtures and two unshadowed local lights; there are four actual billboard lights in the scene. No post-processing or real-time shadows.

`sampleCameraPath` samples two Catmull-Rom approaches from the same normalized progress. The original Dental waypoints and final framing remain; the second approach starts at Dental's endpoint, returns toward the highway, then moves toward the left shoulder. Smoothstep maps travel to zero velocity at viewing intervals. Departure rotation blends out of the previous focus before blending into the next. Narrow-aspect retreat carries through departure continuously. Reverse scroll uses the same stateless sampler.

The document track now spans eight scrolling hero heights plus the sticky hero itself. Dental's 10% viewing interval corresponds to 0.8 hero heights of scroll, and Voting's 8% interval to 0.64 heights. These are inspectable scroll ranges, not timed stops, snapping or scroll locks. The existing progress damping (8/second), opening animation, FOV and mouse sensitivity remain. Camera position progresses from [0, 2.25, 6] through Dental [5.4, 4.4, -115] to Voting [-5.4, 4.4, -194] on wide desktop.

The single persistent journey ref contains target progress, sampled camera progress and the active billboard index. React only updates when the viewing zone or hover changes. Actual raycast interaction also checks the camera's viewing interval, preventing a distant inactive screen from navigating during a rapid camera transition.

Projects enters Dental at the midpoint of its viewing interval. Existing interruptible link navigation also supports Next/Previous project HTML links, using `#works` and history scroll state rather than adding routes. Manual wheel, touch, pointer and keyboard interruption retain their existing behavior. Refresh and Back/Forward restore the actual saved scroll position, including the second billboard and travel between them; a fresh `#works` entry starts at Dental.

One HTML HUD changes title, metadata and case-study link for the current viewing interval. It is inert and hidden from assistive technology while traveling; the inactive film-strip remains inert while a billboard HUD is active. Focus returns to an active navigation target when leaving a zone. The existing global important h2 rule required a scoped important HUD font size to keep the longer second title clear of the sign. Homepage typography and layout were not edited.

## Files changed for 3B

Source:

- `src/components/features/PortfolioPage.tsx`: resolve configured projects from existing portfolio data.
- `src/components/features/immersive/routeBillboardSettings.ts`: two reusable destination configurations and viewing helpers.
- `src/components/features/immersive/RouteGallery.tsx`: render both structures with shared geometry/materials.
- `src/components/features/immersive/ProjectScreen3D.tsx`: retain screen interaction, gated to the correct active camera/viewing zone.
- `src/components/features/immersive/routeCameraPath.ts`: continuous travel, departure/focus blends and aspect-safe framing.
- `src/components/features/immersive/RouteScene.tsx`: pass the project list and publish sampled camera progress.
- `src/components/features/immersive/routeJourneySettings.ts`: longer shared track and expanded journey ref type.
- `src/components/features/immersive/useImmersiveJourney.ts`: viewing-zone synchronization, first/next/previous entry and scroll-history restoration.
- `src/components/features/immersive/ImmersiveHero.tsx`: one active HTML HUD and project navigation alternatives.
- `src/components/features/immersive/immersive.css`: constrain the billboard HUD heading without altering homepage type.

Validation:

- `tests/multi-billboard.spec.mjs`: both views, travel/reverse, pointer, physical and keyboard interactions, history/refresh, pending second preview and screenshots.
- `tests/immersive-gallery.spec.mjs`: retain Dental regressions with its remapped progress in the extended journey.
- `tests/immersive-journey.spec.mjs`: remap existing Dental/navigation/pause checks to the new scroll track.
- `tests/camera-interaction.spec.mjs`: update the original mouse/path independence check's scroll coordinate.
- `tests/camera-path.check.mjs`: both-side footprint, final endpoint, narrow framing, reversible path and viewing plateaus.
- `IMMERSIVE_HERO_MILESTONE_3B.md`: this handoff.

Earlier uncommitted milestone work remains intact. `package.json`, lockfile, case studies, project records and assets were not changed by 3B.

## Screenshots and visual inspection

- `artifacts/milestone-3b/hero.png`: distant scene.
- `artifacts/milestone-3b/dental.png`: original right-side focus, with the next sign visible farther left along the road.
- `artifacts/milestone-3b/highway.png`: return toward highway and intervening travel.
- `artifacts/milestone-3b/voting.png`: left-side Voting focus, original preview and continued highway on the right.
- `artifacts/milestone-3b/voting-narrow.png`: 768 x 1024 layout.

Screenshots were inspected for screen clearance, physical placement, visual hierarchy and highway continuity. The camera is below the elevated billboards, preserving perspective rather than flattening the sign into an HTML overlay.

## Validation

- TypeScript passed (`tsc --noEmit`).
- All five numerical camera/path checks passed: forward/reverse continuity, bounded travel, both-side structure clearance, highway continuation, narrow-aspect framing and stable viewing intervals.
- All five new multi-billboard browser scenarios passed across the targeted runs. These cover previews/metadata, both viewing positions, travel/reverse, pointer exploration, physical hover/click and case-study Back, keyboard/next/previous/history, film-strip/Contact, refresh at the second billboard and mid-highway, a fresh Works deep link and delayed second-image readiness.
- All 15 selected regression browser scenarios passed in one final run: original Dental composition/hover/click/keyboard/film links/deep links/refresh/failure fallback; mouse/path independence; mobile/no-JavaScript, low-power, reduced-motion and no-WebGL fallback; live motion changes; delayed GPU readiness with usable HTML; pause/resume; enhanced-track cleanup on motion changes and context loss.
- Twenty distinct targeted browser scenarios passed overall. An initial multi-billboard test run had two automation synchronization failures: it attempted programmatic scroll or Back before existing link navigation completed. The tests now wait for URL/focus completion, and both scenarios passed on rerun. No fixed delays were added to production readiness or navigation.
- Desktop and narrow screenshots were visually inspected after the HUD heading correction. No page, project-data or case-study redesign was performed.

No production build or unrelated full regression suite was requested or run. No FPS or Lighthouse measurements are claimed.

Commands:

```powershell
npm.cmd run typecheck
node --test tests/camera-path.check.mjs
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'
npx.cmd playwright test tests/multi-billboard.spec.mjs --reporter=list
npx.cmd playwright test tests/immersive-gallery.spec.mjs tests/immersive-hero.spec.mjs tests/immersive-journey.spec.mjs tests/camera-interaction.spec.mjs tests/immersive-initialization.spec.mjs --grep 'billboard is visible|physical Dental|keyboard link|gallery deep|pending preview|lightweight fallback|mobile and|pause keeps|scroll travel remains|a delayed GPU frame|releases the enhanced track' --reporter=list
```

## Preview and limitations

Open http://127.0.0.1:3000. Click Projects for Dental, then scroll forward or use Next project for Voting. Reverse scrolling or Previous project returns along the same road. Each physical screen and the active HTML case-study link opens its existing project. Film-strip and Contact retain their native destinations. If the current local dev server is stopped, run `npm.cmd run dev`.

The Voting preview is the existing promotional installation photograph, not a live voting application. The current environment has only 42 road units beyond the second board; a future third project would require deliberately extending the road/rails and authoring another approach. This milestone does not do so. Thin details can alias under the existing DPR cap and non-antialiased renderer; fine preview text is best read in the case study.

Chromium automation and emulated fallback checks cannot establish physical mobile GPU behavior, Safari/Firefox compatibility or high-refresh display feel. Both previews participate in initial readiness, adding the existing second image and shader work to initialization. The poster stays visible until the complete scene is ready; no fixed loading delay was added. Desktop loading/performance has not been benchmarked.

Stop after Milestone 3B. No 3D Contact or additional billboard work.
