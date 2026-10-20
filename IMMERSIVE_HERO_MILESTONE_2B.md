# Milestone 2B - Hero to Selected Works

Local implementation on `feature/immersive-hero-poc`. No deployment or merge. Contact keeps its existing HTML destination and navigation; no Contact world destination or Milestone 2C work.

## Journey and architecture

One existing canvas renders the unchanged Route 666 environment. A native CSS sticky hero is held inside a four-hero-height scroll track. The existing Works panel overlaps the final hero-height of that track. Most scrolling advances through the highway; the final portion introduces the original film-strip interface, with a rounded panel edge and a heading reveal. Hero copy fades during departure and restores on keyboard focus.

`useImmersiveJourney` owns one GSAP ScrollTrigger. Actual document scroll determines a persistent progress ref, shared with the existing CameraRig. There is no wheel interception, virtual scroll, second scene, per-scroll React state or parallel camera tween. The start is the hero origin; the end is the existing Works anchor minus its header clearance. Track height follows the hero's measured natural height, including taller content, and is measured again on window resize.

`routeCameraPath.ts` defines a centripetal Catmull-Rom path through road-relative waypoints:

| Position | x | y | z |
| --- | --- | --- | --- |
| Hero | 0 | 2.25 | 6 |
| Highway entry | -0.45 | 2.35 | -24 |
| Highway travel | 0.65 | 2.5 | -65 |
| Works arrival | 0.2 | 2.7 | -108 |

The camera travels 114 units forward. Path tangent drives subtle yaw and pitch; the horizon never rolls. Progress uses frame-rate-independent exponential damping at 8/s with a 100 ms stall cap. The original opening offsets retain their 3.2-second progression and original y/z/pitch damping. Existing mouse offsets remain additive to the active path, and fade away toward arrival. Mouse settings remain +/-8 degrees yaw, +/-3 degrees pitch, response 6/s, parallax 0.1/0.02; they were not retuned.

`routeJourneySettings.ts` is a lightweight coordination module (three scroll screens, response 8/s, Projects travel duration 2.4 seconds). Three.js and the scene remain behind the existing dynamic import. The current path, progress coordinator, pointer helper, environment renderer, and HTML section transitions stay separate so a later destination can extend the route without replacing the renderer or carousel.

The legacy hero surface scale/clip animation is disabled only while the spatial journey is enabled; its existing header surface and active-section tracking are reused.

## Navigation and restoration

Projects, Explore Selected Works, and the down-arrow retain real `#works` anchor hrefs. On an enhanced desktop, an unmodified activation animates actual window scroll toward the same Works destination used by manual travel. Only that scroll position drives camera progress. A new activation cancels the previous navigation. Wheel, touch, pointer-down, scrolling keys, Tab and Escape interrupt it. Navigation can restart from the current position. Normal Contact and brand link navigation retain native behavior.

A completed Projects activation adds one history entry and focuses the Works heading without scrolling again. Modified clicks and other link targets retain native behavior. Hash deep links, history traversal, reloads and case-study return are aligned after the enhanced track exists. Scroll settles are saved to the current history entry; session storage provides a reload backup because a full Next.js hydration can replace custom history state. Restricted storage falls back to native/history restoration. No scroll restoration mode is overridden globally.

Scene-readiness compilation, hidden first render, GPU fence and poster fade are untouched. The extended track is enabled only after the existing complete-scene readiness signal. Until then, HTML and native anchor navigation remain available. If the visitor already reached Works or Contact during initialization, the coordinator preserves/aligns that destination when extending the track. Unsupported WebGL, low-power/mobile and reduced-motion visitors keep the original short HTML flow and poster. Removing the enhancement releases the track and compensates Works position. Pause stops WebGL updates while normal document navigation stays usable.

## Changed files for 2B

Source:

- `src/components/features/PortfolioPage.tsx`: server-rendered journey wrapper around the existing hero.
- `src/components/features/immersive/ImmersiveHero.tsx`: connect readiness to the optional journey and pass its shared ref to the scene.
- `src/components/features/immersive/RouteScene.tsx`: replace the old one-viewport scroll offset with sampled path travel; retain opening and mouse layers.
- `src/components/features/immersive/routeCameraPath.ts`: new road-relative path and orientation sampling.
- `src/components/features/immersive/routeJourneySettings.ts`: new lightweight shared settings and progress type.
- `src/components/features/immersive/useImmersiveJourney.ts`: new scroll, navigation, restoration and HTML arrival coordinator.
- `src/components/features/immersive/immersive.css`: enhanced-only pinning and Works arrival styles.
- `src/hooks/useHeroVideoTransition.ts`: optional spatial mode bypasses legacy scaling while retaining header tracking.

Validation and handoff:

- `tests/camera-path.check.mjs`: path bounds, continuity, reversibility and endpoints.
- `tests/helpers/route-camera.mjs`: extracted reusable observation of actual WebGL camera matrices.
- `tests/camera-interaction.spec.mjs`: reuse observer and update scroll assertions for the new route.
- `tests/immersive-journey.spec.mjs`: native forward/reverse travel, Projects/interruption/keyboard/history, rapid scroll plus pointer input, refresh/deep links and case-study navigation.
- `IMMERSIVE_HERO_MILESTONE_2B.md`: this handoff.

Dependencies added: none. Environment geometry/materials, camera sensitivity configuration, readiness logic, carousel source, case-study pages, metadata and Contact source were not modified.

## Validation

- TypeScript passed: `npm.cmd run typecheck`.
- Seven numerical checks passed: `node --test tests/camera-path.check.mjs tests/camera-interaction.check.mjs`.
- All 24 distinct targeted browser checks passed across the core and focused runs: 21 core checks, three additional pause/live-fallback checks, and a final recheck of the expanded reload scenario. Covers real camera matrices at pointer extremes and during forward/reverse travel; Projects interruption, keyboard, history and rapid input; header state; mobile/low-power/reduced-motion/no-JavaScript fallbacks; cold and warm cache initialization under CPU/network throttling; Works/project links and case-study return.
- Pause during travel holds the camera exactly still, then resumes toward the current path. Live reduced-motion and WebGL loss release the active track while keeping Works within two pixels of its prior viewport position.
- Initial investigation reproduced a mid-journey refresh restoration failure. The reload backup fixes that failure. Fresh visits, same-page reloads, direct Works links, deep-link reloads and browser history are covered. The fresh-visit test explicitly navigates from another route; navigating the identical URL can behave as a reload in Chromium.
- The screenshot sequence was visually inspected: `artifacts/milestone-2b/forward-0.png` through `forward-3.png`, plus `arrival.png` (ignored local QA artifacts).

## Local preview and limits

Existing development server: http://127.0.0.1:3000. If stopped: `npm.cmd run dev`.

Targeted browser command:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'
npx.cmd playwright test tests/immersive-journey.spec.mjs tests/camera-interaction.spec.mjs tests/immersive-hero.spec.mjs tests/header-navigation.spec.mjs tests/immersive-initialization.spec.mjs --reporter=list
```

This is the requested Hero-to-Works proof of concept. A rapid scroll or native deep link can skip directly to arrival; the user is never forced to finish a timed journey. Pause freezes the canvas, so resuming after scrolling smoothly catches up to the current path target. Browser QA uses desktop Chromium and simulated capability/motion settings; real mobile GPUs, Safari, Firefox and high-refresh physical displays remain untested. Storage-disabled reload restoration relies on native browser/history behavior. No FPS or Lighthouse claims. No production build or unrelated full regression suite was run for this targeted milestone.

Stop here for visual approval before Milestone 2C.


