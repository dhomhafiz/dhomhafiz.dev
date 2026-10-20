# Milestone 3A refinement - Roadside billboard

Historical implementation report. Current display dimensions, placement, structural details and lighting are documented in [Billboard visual polish](IMMERSIVE_HERO_BILLBOARD_POLISH.md), which supersedes the corresponding values below.

Local work on `feature/immersive-hero-poc`. This replaces the pavilion destination with one roadside Dental billboard. No additional billboard, Contact world destination, merge or deployment.

## Placement and structure

`routeBillboardSettings.ts` owns the single destination:

- Project reference: `still-dental`, resolved from the existing portfolio projects.
- Display centre: `[16.8, 13.6, -138]`.
- Orientation: -0.45 radians (about 25.8 degrees toward approaching traffic).
- Display size: 16 x 9 world units, with the existing preview contained without stretching.
- Physical housing, steel poles, concrete footings, rear beams, maintenance ledge and ladder. Shared box geometry/materials and one local point light; no post-processing or shadows.

The entire structure stays outside the right guardrail. The conservative footprint bound is beyond x=8, while the guardrail is at x=7.6. The display is elevated and angled to clear the existing hillside. Early screenshot inspection exposed hillside occlusion; placement was adjusted rather than editing the terrain.

There is no pavilion roof, gallery floor/apron, across-road screen or terminal wall. The original 300-unit road still reaches z=-260, over 120 units past the billboard centre. Original road, rails, terrain, rocks, fog, sky/clouds and environmental shaders were not modified. At focus, the continuing highway remains visible to the left of the billboard.

## Camera and configuration

The existing camera controller and native-scroll coordinator are retained. The configured approach is:

| Progress | Camera position x, y, z |
| --- | --- |
| 0 | 0, 2.25, 6 |
| 0.2 | -0.45, 2.35, -24 |
| 0.4 | 0.65, 2.5, -65 |
| 0.6 | 1.6, 2.9, -94 |
| 0.8 | 3.8, 3.7, -108 |
| 1 | 5.4, 4.4, -115 |

The camera starts facing the highway, advances, shifts to the right shoulder inside the guardrail, and gradually aims at the configured display centre from 45% progress. The wide-desktop endpoint turns approximately 26 degrees right and 20 degrees upward. The same sampled path runs in reverse with scroll.

Aspect-dependent framing is now part of path sampling, not project-specific code inside CameraRig. Narrow-desktop retreat is capped at 25 units and distributed across forward distance so it cannot cause the camera to reverse during forward scroll. Camera x remains inside the road corridor. Original FOV, opening, progress damping and mouse sensitivity are unchanged.

The destination config holds the project slug, placement, dimensions, orientation and approach points together. The sampler has no Dental-specific coordinates or identity. Future destinations can reference another existing project record and extend the approach; only this one destination is implemented. No scene-management framework was added.

## Reused functionality

The former inline project screen logic was extracted intact into `ProjectScreen3D.tsx`, with generic project and size props. It retains the original sRGB texture loading, contained preview, border feedback, raycast hover/move/click and case-study URL behavior. `RouteGallery.tsx` retains its existing scene interface but now renders only the roadside structure around that screen.

The same Canvas, renderer, environment, CameraRig, ScrollTrigger coordinator, dynamic import, shared Suspense boundary, shader compilation/first-frame GPU fence, poster reveal, pause/resume and device/reduced-motion selection are used. The preview is still the existing 63,598-byte `dental-home.webp`; no assets or dependencies were added.

Accessible HTML case-study navigation, inactive-presentation inert handling, the original film-strip, `#works`/`#works-film` deep links, browser restoration and native Contact navigation remain in place. Only the experimental destination caption now says Roadside billboard; homepage branding/typography and case-study content are unchanged.

## Files changed

Source:

- `src/components/features/immersive/routeBillboardSettings.ts` - new lightweight destination configuration.
- `src/components/features/immersive/ProjectScreen3D.tsx` - extracted reusable existing screen/interaction logic.
- `src/components/features/immersive/RouteGallery.tsx` - replace pavilion geometry with billboard supports and housing.
- `src/components/features/immersive/routeCameraPath.ts` - configurable shoulder path, focus and safe aspect framing.
- `src/components/features/immersive/RouteScene.tsx` - use the sampler's framing and remove hardcoded gallery focus coordinates.
- `src/components/features/immersive/ImmersiveHero.tsx` - destination caption, preserve UI arrow/status characters using JSX entities.
- `src/components/features/PortfolioPage.tsx` - resolve the configured project reference.
- `src/lib/workProjects.ts` - allow selecting an existing portfolio record by slug.

Validation/handoff:

- `tests/camera-path.check.mjs` - extended path bounds, smoothness, framing, footprint and road-continuation checks.
- `tests/immersive-gallery.spec.mjs` - actual-camera projection checks, progressive scale, visible road beyond, screenshots and retained interactions/restoration/failure handling.
- `tests/immersive-journey.spec.mjs` - update expected positions and authored rotation bounds.
- `IMMERSIVE_HERO_ROADSIDE_REFINEMENT.md` - this report.

All earlier uncommitted work is retained.

## Validation

- TypeScript passed: `npm.cmd run typecheck`.
- Nine numerical checks passed: `node --test tests/camera-path.check.mjs tests/camera-interaction.check.mjs`.
- Five billboard browser checks passed: visible placement at Hero, increasing projected screen area across approach, final framing and road continuation, narrow framing, reverse travel, actual raycast hover/click, keyboard/case-study/film switching, refresh/deep links/Contact, pending and failed preview fallback.
- All 23 targeted browser checks passed across three runs: five billboard scenarios, 17 camera/navigation/pause/device-fallback regressions, and the existing delayed-GPU readiness/usable-HTML check. No production code changed between those successful runs.
- Camera assertions observe real view matrices uploaded to WebGL. Projection assertions establish composition, not terrain occlusion; final Hero, focus and narrow screenshots were also visually inspected for hillside clearance and road continuity.
- Final local QA images: `artifacts/roadside-billboard/journey-0.png` through `journey-4.png`, `hover.png`, `narrow-billboard.png`.

Commands:

```powershell
npm.cmd run typecheck
node --test tests/camera-path.check.mjs tests/camera-interaction.check.mjs
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'
npx.cmd playwright test tests/immersive-gallery.spec.mjs --reporter=list
npx.cmd playwright test tests/immersive-journey.spec.mjs tests/immersive-hero.spec.mjs tests/header-navigation.spec.mjs tests/camera-interaction.spec.mjs --grep-invert 'native forward and reverse|refresh restores mid-journey' --reporter=list
npx.cmd playwright test tests/immersive-initialization.spec.mjs -g 'a delayed GPU frame' --reporter=list
```

## Preview and limitations

Open http://127.0.0.1:3000 and click Projects or scroll to approach the billboard. Scroll backward to return to the highway. The film-strip link opens the original HTML gallery; the screen and HTML case-study link open the existing Dental case study. If the existing server is stopped, run `npm.cmd run dev`.

The follow-up angle refinement reduces yaw from -1.13 to -0.45 radians so the display faces the road more directly. Its proportional size and placement were adjusted to preserve guardrail clearance and clear the hillside without editing the environment or camera waypoints. The browser framing check now verifies the compact display's actual narrow-viewport bounds rather than requiring the larger display's retreat distance.

Follow-up validation: TypeScript and all nine numerical checks passed. The two targeted browser scenarios passed (Hero/approach/focus/narrow framing/reverse scroll and physical screen hover/click/case-study/Back). The initial framing run failed an obsolete assertion requiring camera retreat for the previous larger sign; this was replaced with actual viewport-bound assertions and the scenario passed on rerun. Hero, focus and narrow screenshots were visually inspected. New angle QA images are in `artifacts/billboard-angle/`, with the browser suite's final journey/narrow images in `artifacts/roadside-billboard/`. Only the destination configuration, gallery browser expectations and this handoff changed for the angle refinement; no dependency was added.

This is one static-preview billboard. Fine website body copy is best read through the case-study link. Chromium desktop and emulated mobile/reduced-capability behavior are checked; real mobile GPUs, Safari, Firefox and physical high-refresh displays remain untested. No FPS/Lighthouse results are claimed. Production build and unrelated full regression suites were not run, as requested.

Stop after this refinement for visual review. No further billboard or Contact work is included.
