# Camera comfort refinement

Continues `feature/immersive-hero-poc`. This comfort retune supersedes the previous wider mouse range. No dependencies added.

## Current settings

Central configuration: `src/components/features/immersive/routeCameraInteraction.ts` (`cameraMouseSettings`).

| Setting | Previous | Current |
| --- | --- | --- |
| Horizontal yaw | +/-25 degrees | +/-8 degrees |
| Vertical pitch | +/-12 degrees | +/-3 degrees |
| Damping response | 10/s | 6/s |
| Horizontal parallax | +/-0.42 units | +/-0.1 units |
| Vertical parallax | +/-0.12 units | +/-0.02 units |

The smaller rotation and translation reduce movement of the horizon and road focal point. Exponential damping remains frame-rate independent, without spring overshoot. Analytically, the new response reaches 90% of a stationary target in approximately 384 ms. This is not a measured rendering-performance result.

Opening and scroll camera paths, transition weights, pointer reset handling, pause/resume, readiness, mobile and reduced-motion fallbacks remain unchanged. Yaw still respects the narrower horizontal field-of-view limit. No environment, navigation, layout, Selected Works, or case-study changes.

The Active Theory reference could not be opened interactively with the available browser tools. These are original conservative settings based on the user's comfort feedback, not measured reference values. Comfort remains subjective and needs the user's own tryout.

## Files changed for this retune

- `src/components/features/immersive/routeCameraInteraction.ts`: five tuning values and a comment.
- `tests/camera-interaction.check.mjs`: revised comfort bounds, settling expectations and narrow-FOV scenario.
- `tests/camera-interaction.spec.mjs`: real-camera assertions for the smaller bounds and gentler settling; screenshots in ignored `artifacts/camera-comfort`.
- `IMMERSIVE_HERO_CAMERA_REFINEMENT.md`: current handoff.

## Validation

- TypeScript: passed (`npm.cmd run typecheck`).
- Five numerical checks: passed (`node --test tests/camera-interaction.check.mjs`). Covers settling, simulated 10/20/30/60/120/144 Hz agreement, rapid reversals, monotonic release, opening/scroll blending, narrow FOV and stalled-frame protection.
- Eight targeted Chromium camera and immersive-hero browser checks: passed. Covers all pointer extremes, rapid reversal, settled stability, viewport exit/re-entry, scroll travel, narrow-screen limits, pause/resume, context-loss recovery, mobile/no-JavaScript and reduced-motion fallbacks. Four extreme-view screenshots were visually inspected in `artifacts/camera-comfort`; the road focal point stays visible.

Preview: existing development server at http://127.0.0.1:3000 (or `npm.cmd run dev` if stopped).

No production build, deployment or merge. No FPS/Lighthouse measurements. Numerical update-rate checks do not establish physical display/GPU performance. Real-device comfort, Safari and Firefox are untested.

