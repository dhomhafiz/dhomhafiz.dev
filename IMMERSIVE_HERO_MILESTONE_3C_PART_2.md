# Milestone 3C Part 2 — cinematic project archive

Local implementation on `feature/immersive-hero-poc`. No merge or deployment.

## Architecture and changed files

- `src/components/features/immersive/GalleryPresentation.tsx`: client provider and presentation host. Promotes the existing Selected Works section from normal document flow to a fixed, full-viewport HTML dialog. The section and FilmReel keep their existing mounted identities, frame position, project cards, and real case-study anchors. No second reel, canvas, scene, routing dependency, or camera controller.
- `src/components/features/PortfolioPage.tsx`: wraps the existing page in the provider and its existing SelectedWork in the presentation host. Portfolio data still comes from `src/config/portfolio.ts` through the existing provider and `getWorkProjects`.
- `src/components/features/immersive/ViewAllProjectsButton.tsx`: semantic dialog button shared by both billboard contexts.
- `src/components/features/immersive/ImmersiveHero.tsx`: combines gallery suspension with the existing visibility and manual-pause conditions.
- `src/components/features/immersive/useImmersiveJourney.ts`: small capture/restore bridge to the existing authoritative journey; suspends scroll updates and restoration while the archive owns presentation.
- `src/components/features/immersive/RouteScene.tsx`: ignores overlay pointer movement and freezes CameraRig updates during suspension, retaining its existing damped path and pointer pose.
- `src/components/features/immersive/immersive.css`: full-viewport shell and sticky return control. Film-strip design remains unchanged.
- `tests/cinematic-gallery.spec.mjs`: targeted modal, camera, history, accessibility, refresh, resize, manual-pause and fallback coverage.
- Existing `tests/immersive-gallery.spec.mjs`, `tests/immersive-journey.spec.mjs`, and `tests/multi-billboard.spec.mjs`: update the former anchor expectations for the new dialog button and inactive background ancestor.

## Transitions and accessibility

GSAP fades the archive over the retained scene in 280 ms, and out in 220 ms. Reduced motion makes those transitions immediate. Focus moves to the visible Back to 3D Experience button after opening, preserving any early keyboard interaction already inside the archive; Escape or that button dismisses the archive. Inert ancestor siblings exclude the highway, header, contact section and skip link from interaction. Tab wraps inside the archive. Original inert values, overflow, scrollbar gutter, browser scroll restoration, listeners and tweens are restored or cleaned up.

## Journey restoration

Opening cancels any link-navigation tween and captures the current authoritative journey progress, document scroll and billboard index. Root overflow locking prevents document scrolling; gallery interaction cannot update journey progress. The existing canvas uses its established `frameloop="never"` pause while the mounted camera retains its pose. Overlay pointer events do not overwrite its input. Closing remeasures through the existing journey hook, maps normalized progress to the current track size and synchronously updates the existing ScrollTrigger before rendering resumes. An existing manual pause stays paused.

Reloaded gallery entries seed the same journey ref from the saved entry before the camera's first frame. If WebGL becomes unavailable while open, dismissal releases the archive to the ordinary semantic works section instead.

## URL and history

Opening pushes one `?gallery=projects` entry, preserving the current hash, other query parameters and Next history fields. That entry carries the return snapshot. Back closes; Forward reopens at the current mounted highway position, capturing any further scrolling since Back. A fresh document uses the saved history snapshot. The explicit return button and Escape use Back for an entry created by this feature, avoiding extra closing entries. A directly loaded gallery URL without an owned entry closes by replacing only the gallery query parameter. Refresh reopens the archive; existing `#works`, `#works-film`, contact and `/work/.../` links retain their meanings. A fresh gallery URL without a saved journey uses its existing hash destination (or the introduction) when dismissed.

Final restoration runs on the next animation frame after the transition, allowing browser history traversal to finish even when reduced motion skips the animation. Rapid repeated dismissal is guarded, and reversed history transitions kill the previous tween before its completion can release the background lock.

## Validation

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed; production static export generated successfully.
- Related Chromium regression run: 25 of 27 passed initially. The two legacy keyboard flows exposed opening-transition focus theft; both passed after the focus correction in the 13-test follow-up (12 passed, with the new live motion-change test exposing an immediate history-restoration race).
- The motion-change race was corrected by completing dismissal on the next animation frame. Both reduced-motion tests passed on the final build, and the remaining eight gallery checks passed in the separate final run: all 10 new gallery scenarios passed.
- Final focused runs: 2/2 and 8/8 passed. Latest focused results live in `test-results/cinematic-motion-final` and `test-results/cinematic-rest-final`. The older HTML report retains the earlier diagnostic failures.
- Preview HTTP response: 200. Desktop and mobile screenshot layouts were visually inspected.

Browser screenshots: `artifacts/cinematic-gallery/desktop.png` and `artifacts/cinematic-gallery/mobile.png`.

## Limits and preview

Browser automation targets Chromium. Physical touch devices and other browser engines have not been measured; no FPS or Lighthouse claim is made. The original mobile, reduced-motion and unsupported-WebGL fallback eligibility remains in place. On those devices the archive remains ordinary accessible HTML; a direct gallery URL can also present it full screen.

Run `npm.cmd run dev` in PowerShell, then open `http://127.0.0.1:3000`. Use Projects to reach Dental, then Next project for Squid Game; each View All Projects button opens the archive. Direct preview: `http://127.0.0.1:3000/?gallery=projects`. Production preview uses `npm.cmd run build` followed by `npm.cmd run preview:validation` at `http://127.0.0.1:4173`.

Scope stops at Milestone 3C Part 2. Route geometry, lighting, camera settings, billboard destinations, case-study routes and Contact destination were not redesigned.
