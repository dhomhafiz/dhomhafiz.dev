# Milestone 6E.1E: Contact endpoint boundary

## Findings

The physical-device report includes an automatic return to Home after the white
region appears. A reproducible resize defect explains the position loss:

- `useImmersiveJourney` removes `data-journey` while measuring the natural Hero.
  That temporarily removes the extended track height and allows native scroll
  position to clamp toward the beginning of the page.
- The old resize guard restored progress only for `scrollY <= trigger.end`.
  An elastic coordinate beyond the Contact endpoint therefore skipped restoration.
- In a Chromium mobile test, injecting an 80px excess coordinate and dispatching
  the existing visualViewport resize event moved real scrollTop from 8028 to 694
  before the fix. The same regression preserves 8028 with the fix.
- Responsive Hero sizing can change before the deferred resize callback runs.
  Progress now gets captured in the existing resize event handler, before refresh,
  rather than inside the following animation frame.

The source of white paint is the legacy `body:has(.editorial-page)` and
`.editorial-page` white background, with transparent `html`. The mobile navigation
is transparent and fixed; it does not own a white background. While the journey
is active, html, body and the page now use the track's existing #080e17 background.
Ordinary HTML and failure fallbacks retain their original white background.

Normal Chromium geometry did not reproduce an extra section after Contact. At
430x669, document and track height were both 8697px, maximum scroll was 8028px,
and the sticky scene occupied y=0..669. The gallery archive was out of flow and
Contact was fixed. This rules out extra normal-flow content in that emulation;
it does not prove Safari's physical paint sequence. Physical Safari retesting
remains necessary to confirm the complete reported symptom is resolved.

## Focused changes

- `src/components/features/immersive/useImmersiveJourney.ts`: preserve completed
  progress during endpoint overscroll and capture progress before deferred resize.
- `src/components/features/immersive/immersive.css`: active journey owns root and
  page background paint.
- `tests/contact-end-boundary.spec.mjs`: endpoint, elastic-coordinate resize,
  viewport/safe-area changes, touch travel, gallery/history, CTA and fallback checks.
- This report.

Other working-tree edits predated this task and are preserved. Graphify outputs
were not regenerated or modified. The dependencies were clear from current source;
the existing graph report was inspected but did not materially reduce this
investigation. No token-saving claim is made.

## Boundary behavior

Contact remains the end of the native document journey. Extra downward gestures
do not add content or lock scrolling. The existing single journey, Canvas and
ScrollTrigger remain in use. No scene, lighting, camera, billboard, destination,
duration or gesture-controller changes were made.

## Evidence and limitations

Final validation:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed, including static export.
- `playwright test tests/contact-end-boundary.spec.mjs tests/mobile-journey-viewport.spec.mjs`:
  8 passed against the final production build (Chromium, one worker).
- Covered actual maximum scroll, repeated native touch swipes, all four viewport
  transitions, safe-area overrides, simulated elastic-coordinate viewport resize,
  reverse travel to Squid Game, gallery Back/Forward and close restoration,
  reload restoration, Contact link hit-testing, intercepted WhatsApp navigation,
  reduced motion, missing WebGL and context loss.
- The elastic-coordinate regression failed before the logic change (8028 to
  694), then passed. The stronger rotation check exposed a second failure before
  moving progress capture ahead of the animation frame; it now passes.
- Intermediate runs included test-harness issues (a shadowed helper name and
  an overloaded concurrent run timeout); the corrected final sequential run
  has no failures. Additional existing navigation/initialization checks passed
  during investigation; that broader run was interrupted and is not counted
  as a completed suite.

Artifacts are under `artifacts/contact-end-boundary/`:

- `before-contact-max.png` and `after-contact-max.png`: maximum-scroll portrait.
- `before-contact-max-{width}x{height}.png` and corresponding `after-` files:
  430x600, 430x932, 932x430 and 430x669.
- `before-geometry.json`, `after-geometry.json` and `*-viewports.json`:
  document, track, Hero, navigation, Contact and background measurements.

Before/after screenshots capture Chromium's normal maximum boundary. Chromium
did not display the physical Safari white strip before the fix, so these images
are layout evidence, not a claimed reproduction of Safari's rendering defect.
The out-of-range-coordinate test is a controlled simulation of the resize branch,
not an implementation of Safari rubber-banding.

Viewport heights and CDP safe-area overrides exercise expanded/collapsed-height
and orientation layouts. They do not emulate real Safari browser chrome or its
elastic animation. Recheck on iPhone 15 Pro Max Safari: repeated downward swipes
at Contact, automatic toolbar changes, rotation and reverse travel to Squid Game.
Both baseline and final landscape captures also show existing Contact heading
clipping at the top of the 932x430 layout. The scene and navigation still cover
the viewport; this separate typography/layout issue was not changed in this fix.
No commit, push, merge or deployment was performed.
