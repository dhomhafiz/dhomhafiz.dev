# Milestone 3A - Billboard visual polish

Local refinement on `feature/immersive-hero-poc`, using the two supplied reference images as visual guidance. No reference-image assets were imported into the scene.

## Visual changes

- Shared low-poly steel geometry now forms round support columns, mounting collars, bolted base plates, rear beams, side uprights, a triangulated catwalk, handrails and a twin-stile ladder.
- Five upper floodlight fixtures use warm emissive diffuser faces. Two unshadowed point lights provide actual upper-frame and lower-structure highlights. Thin, restrained side/deck strips provide edge accents; existing hover feedback remains.
- Steel uses a lighter blue-grey base, metalness 0.8 and roughness 0.34; trim varies those properties slightly. No shadow maps, post-processing, additional assets or dependencies.
- The 15.1 x 10.6 display has a 14.7 x 10.2 inner aperture, matching the original 1440 x 1000 Dental preview to rounding precision. It fills the display without cropping, stretching or substituting generated UI.
- Centre moved from x=16.8 to x=15.9, retaining y=13.6, z=-138 and yaw=-0.45 radians. The structure stays beside the right guardrail. The camera's focus target is offset by [-2, -1, 0] from the display centre to leave more highway visible on the left. Camera waypoints, scroll timing, opening and mouse sensitivity are unchanged.

## Screenshot comparison

Captured and visually inspected at 1440 x 1000, with an additional 768 x 1024 framing check:

| View | Capture | Comparison with supplied references |
| --- | --- | --- |
| Distant highway | `artifacts/billboard-polish/distant.png` | Illuminated preview remains identifiable on the right, beyond the continuous highway. Upper fixtures become small highlights. Unlike the reference montage, the preserved Hero camera is much farther away and the existing HTML headline remains visible. |
| Closer approach | `artifacts/billboard-polish/approach.png` | Display grows into a road-facing focal point; metal housing, upper lights and lower truss are visible while the highway remains prominent to the left. |
| Final position | `artifacts/billboard-polish/final.png` | Original preview fills its frame, with warm top/deck highlights and visible columns. Offset framing keeps the continuing road visible on the left rather than filling the viewport with the sign. |
| Narrow desktop | `artifacts/billboard-polish/narrow.png` | Full display stays within the viewport, with retained HTML case-study and film-strip alternatives. |

The references guide structural detail, warm lighting and visual hierarchy. Existing terrain, clouds, fog and wet-road rendering remain unchanged, so this does not reproduce their photographic mountain detail, vehicle lights, dense vegetation or ray-traced-looking reflections. The real preview is taller than the generated layouts in the references; its full content is deliberately retained.

## Files changed in this refinement

- `src/components/features/immersive/RouteGallery.tsx`: procedural structure, shared materials and lighting.
- `src/components/features/immersive/ProjectScreen3D.tsx`: housing material highlights; original preview and interactions retained.
- `src/components/features/immersive/routeBillboardSettings.ts`: aperture proportions, placement and focus offset.
- `src/components/features/immersive/routeCameraPath.ts`: sample the configurable focus offset with the existing path.
- `tests/camera-path.check.mjs`: align the existing target-direction assertion with the configurable focus offset.
- `IMMERSIVE_HERO_ROADSIDE_REFINEMENT.md`: link to the current refinement.
- `IMMERSIVE_HERO_BILLBOARD_POLISH.md`: this report.

## Validation and limitations

Run only TypeScript and targeted browser interaction checks for this refinement. Commands:

```powershell
npm.cmd run typecheck
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'
npx.cmd playwright test tests/immersive-gallery.spec.mjs --grep 'billboard is visible|physical Dental screen|keyboard link' --reporter=list
```

TypeScript and all three targeted Chromium browser scenarios passed. Browser coverage checks distant visibility, progressive scale, final/narrow framing, highway continuation, forward/reverse scrolling, actual mesh hover/click, case-study navigation and Back, plus keyboard access and film-strip switching. The numerical camera-path test's target assertion was updated for the focus offset but that suite was not run, respecting the requested validation scope.

Floodlight diffuser faces are emissive and the two shared lights illuminate nearby physical materials; the unlit digital display does not receive a separate projected spotlight wash. Existing road reflections are retained rather than adding reflection passes. Some support hardware is naturally obscured by the hillside, while the display remains clear. Fine preview text and thin geometry can alias at distance with the existing capped DPR and antialiasing settings.

Chromium local checks only; no cross-browser, physical mobile GPU, FPS or Lighthouse measurements. No production build, full regression suite, merge, deployment, second billboard or Contact-world work.

Preview: open http://127.0.0.1:3000, scroll forward or click Projects, then scroll back. If the existing development server is stopped, use `npm.cmd run dev`.
