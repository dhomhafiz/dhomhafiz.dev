# Milestone 6B - Shared mobile Route 666

## Architecture and verified baseline

The 6A findings supplied in the milestone brief match the current source. Before editing, a Chromium mobile-emulation regression reproduced the exclusion: a 390x844 coarse-pointer device reporting 8 GB / 8 cores mounted zero Canvas elements.

The existing Graphify graph/report were inspected without regeneration. Their useful relationships were `ImmersiveHero -> RouteScene`, `ImmersiveHero -> useImmersiveJourney`, and `RouteScene -> RouteEnvironment / RouteGallery / CameraRig / SceneReadiness`. Current source confirms one Canvas implementation and one `ScrollTrigger.create` site in `useImmersiveJourney`. The journey, camera sampler, readiness implementation, atmosphere, billboards and geometry were not changed.

## Eligibility and loading policy

- Removed the width-and-coarse-pointer exclusion. Mobile and desktop mount the same dynamically imported RouteScene.
- Reduced motion remains an eligibility safeguard. Reported device memory and logical processor count are diagnostic hints only; missing or low reported values do not prevent an attempt to initialize the protected WebGL scene. They do not measure actual GPU capability.
- Retained WebGL creation/major-performance-caveat protection, React scene boundary, shader/initialization failure, GPU completion fence, poster decode and context-loss handling.
- Save-Data and slow-2g/2G defer the optional scene download behind **Load 3D scene** rather than classifying the GPU as unsupported. HTML portfolio media and the loading poster still load normally. Consent is per page visit; there is no new persistence. Reduced-motion preference, WebGL initialization failure, context loss, and scene-readiness protections remain in effect.
- If a live network-policy change unloads the scene, readiness is reset. An explicit subsequent load must complete the existing GPU readiness check again.

## Initial rendering profile

- A coarse primary pointer selects DPR **1**, including touch phones/tablets in either orientation.
- Fine-pointer desktop views retain DPR **1 to 1.5**, including narrow desktop windows. Width does not determine eligibility or change desktop quality.
- Existing antialias-off, low-power preference, one Canvas, and visibility/pause/gallery-controlled render loop remain.
- Same environment, featured billboards, normalized 12-screen journey, native scrolling, gallery and Contact. No custom touch controls, new scroll listeners, shaders, dependencies, passes or alternate scene.
- This is a conservative configuration choice, not a measured performance improvement.

## Files changed

Production:
- `src/components/features/immersive/ImmersiveHero.tsx`
- `src/components/features/immersive/RouteScene.tsx`
- `src/components/features/immersive/immersive.css` (optional-download control only)

Tests:
- `tests/mobile-route.spec.mjs` (new)
- `tests/immersive-hero.spec.mjs`
- `tests/immersive-initialization.spec.mjs`
- `tests/media-loading.spec.mjs`
- `tests/scroll-indicator.spec.mjs`
- `tests/hero-ui-polish.spec.mjs`

Documentation: this file.

The existing tests' obsolete removed-Hero-CTA and header-background attributes were replaced with the approved navigation links/state. Mobile tests no longer assume that coarse-pointer devices always receive a poster. No production navigation or typography was altered.

## Validation and captures

- Final production build: passed (`npm.cmd run build`).
- Final TypeScript check: passed (`npm.cmd run typecheck`).
- All **40 distinct targeted cases** verified passing across runs: 13 mobile/profile cases, 6 desktop/fallback Hero cases, 5 initialization cases, 3 media-loading cases, 10 scroll-indicator cases and 3 Hero UI cases.
- The combined run initially passed 39/40; its only failure was a stale expectation for the removed header-background attribute. After correcting that test to verify actual scroll/Home state, the complete 6-case Hero suite passed. The final 13-case mobile/profile suite also passed after tightening DPR selection to preserve narrow fine-pointer desktop quality.
- Poster-before-GPU-completion, initialization failure, unavailable WebGL, context loss, reduced-motion changes, both billboards, gallery, Contact, reverse navigation, orientation resize, no-JavaScript HTML, Save-Data/2G consent and live policy reinitialization were exercised.
- The DPR check uses actual Canvas backing-buffer dimensions at emulated device DPR 3 (mobile) and DPR 2 (desktop); it is not an FPS measurement.
- Diff whitespace checks passed. Graphify was not regenerated.

Captures under `artifacts/milestone-6b/`:
- `mobile-ready-hero.png` - actual ready WebGL, not the poster
- `mobile-loading-poster.png` - GPU completion intentionally held
- `mobile-dental.png`, `mobile-squid.png`, `mobile-contact.png`
- `desktop-ready.png`

Tests observe actual Canvas backing-buffer/CSS dimensions, one active Canvas/track, and stable native scroll-listener counts across resize and teardown/reinitialization. Source inspection verifies the unchanged single ScrollTrigger creation site; GSAP internals are not exported as product debug hooks.

## Milestone 6C - Mobile touch journey and responsive camera

### Findings and implementation

- The camera fit calculation used the horizontal FOV and billboard width with a small fixed margin. That margin was insufficient for portrait screens. Portrait touch layouts now use both horizontal and vertical screen bounds and a larger fit margin in the existing reversible camera sampler; desktop and mobile landscape framing retain the previous sampler settings.
- The Pause control shared the top-right area with the project heading. Mobile project headings now begin below the safe-area-aware Pause control. Short touch landscape uses compact horizontal navigation and a lower, scaled hero copy block to keep the heading, control, and swipe cue separate.
- Rotating while stopped at a billboard changed normalized journey progress because the journey track height changed while `scrollY` remained fixed. The existing resize handler now refreshes and restores the current normalized progress. No new scroll, touch, or viewport listener was introduced.
- Native document scrolling remains the sole journey input. Touch emulation verified forward and reverse swipes; a swipe beginning on a billboard did not activate its project, while an intentional tap opened the case study.

### 6C files and validation

- Production: `src/components/features/immersive/RouteScene.tsx`, `routeCameraPath.ts`, `useImmersiveJourney.ts`, and `immersive.css`. `RouteScene.tsx` and `immersive.css` also contain the preserved 6B changes.
- Tests: `tests/camera-path.check.mjs` and `tests/mobile-route-6c.spec.mjs`.
- Chromium emulation captures are in `artifacts/milestone-6c/`: portrait Hero, Dental, Squid Game and Contact; landscape Hero and billboard; and a desktop comparison.
- TypeScript and production build passed; camera-path tests passed 6/6. Targeted Playwright mobile, fallback, journey, history, gallery, and desktop billboard suites passed 26/26.

### Remaining device limitations

- iOS Safari and Android Chrome physical devices have not been tested. Emulated viewport resizing does not establish real browser address-bar, touch latency, or orientation behavior on-device.
- No FPS, memory, battery, or thermal measurements were made. DPR 1 remains visibly softer than the surrounding high-DPR HTML and should be reviewed on devices before further quality tuning.
- GPU readiness retains the existing fence wait without a timeout; a non-signaling driver continues to show the poster and HTML fallback.

Nothing is committed, pushed, merged, or deployed. Stop after 6C for visual approval.
