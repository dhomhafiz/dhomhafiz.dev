# Immersive Edition — Phase 1

Local proof of concept on `feature/immersive-hero-poc`. This branch already existed and was checked out with a clean working tree when work began. Nothing was deployed, merged, or committed.

## What changed

The active editorial homepage now has a procedural Route 666 background instead of its looping video. Existing introduction text, brand, header, Selected Works film reel, contact experience, case studies, SEO, Tailwind setup, and static-export configuration are retained. Existing video components/assets remain available but are no longer mounted on the homepage.

The scene uses a 3.2-second camera reveal, bounded mouse yaw/pitch with time-based damping, and a GSAP ScrollTrigger that moves the camera down the road as the hero scrolls away. Normal browser scrolling and anchor links remain in control; there is no pinning, wheel interception, or extra scroll track. The existing `useHeroVideoTransition` hook is reused for the backdrop frame and header navigation lifecycle.

Road, cloud, and wet-surface shading are procedural. Eighteen chevron signs use three instanced meshes. Wet reflections are analytic light pools rather than physically accurate scene reflections. There are no external textures/models, shadow maps, bloom, or reflection render passes. DPR is capped at 1.5. Frame-level camera/shader updates use refs rather than React state.

## Loading and accessibility

- Important text, branding, navigation, calls to action, and pause/resume are HTML outside the decorative canvas.
- Three.js, R3F, and GSAP live in the dynamically imported scene, mounted only after client capability checks. Other routes do not mount it.
- Reduced motion, Save-Data, 2G connections, reported memory of 4 GB or less, four or fewer logical CPUs, and touch screens up to 900 px receive the CSS-only fallback.
- Unsupported WebGL, context loss, shader failure, and component/chunk errors leave the fallback and portfolio content available.
- The fallback also renders without JavaScript. Changing reduced-motion preferences live removes the scene.
- Pause/resume freezes the scene. Offscreen and background-tab scenes stop their render loop. Pointer movement never captures keyboard focus or intercepts scrolling.

## Files

| File | Purpose |
| --- | --- |
| `src/components/features/PortfolioPage.tsx` | Integrate the hero, preserve copy, add direct Works/Contact links. |
| `src/components/features/immersive/ImmersiveHero.tsx` | Lazy loading, eligibility, visibility, error boundary, and pause UI. |
| `src/components/features/immersive/RouteScene.tsx` | Camera, scroll/pointer inputs, geometry, lighting, fog, and GPU lifecycle. |
| `src/components/features/immersive/routeShaders.ts` | Procedural sky, asphalt, lane markings, and reflected light. |
| `src/components/features/immersive/immersive.css` | Scoped composition, scrim, responsive styling, and CSS fallback. |
| `package.json`, `package-lock.json` | Added scene dependencies and their lockfile entries. |
| `tests/immersive-hero.spec.mjs` | Scene interaction, pause, fallbacks, motion preferences, and no-JS coverage. |
| `tests/cinematic-refinement.spec.mjs` | Adapt existing composition/header checks to the scene and stationary HTML text. |
| `tests/introduction.spec.mjs` | Preserve content/navigation coverage; move renderer-failure checks to the dedicated hero suite. |
| `tests/media-loading.spec.mjs` | Verify legacy hero media is not requested, Save-Data fallback, and retained script caching. |
| `IMMERSIVE_HERO_PHASE1.md` | Implementation and validation handoff. |

## Dependencies added

| Package | Reason |
| --- | --- |
| `three` `^0.186.1` | Real WebGL scene, procedural shaders, geometry, camera, and instancing. |
| `@react-three/fiber` `^9.8.2` | React integration, canvas lifecycle, resource disposal, and frame callbacks. |
| `gsap` `^3.15.0` | ScrollTrigger updates camera progress from document scroll. |
| `@types/three` `^0.186.0` (development) | Strict TypeScript declarations. |

Drei is unnecessary for the geometry and camera implemented here.

## Preview on Windows

```powershell
npm.cmd ci
npm.cmd run dev -- --port 3010
```

Open <http://127.0.0.1:3010>. Move the mouse across the hero, scroll normally toward Selected Works, and try Pause scene. Use a capable desktop without reduced motion or Save-Data to see WebGL; mobile/reduced-motion paths deliberately show the fallback.

Production preview after a build:

```powershell
npm.cmd run build
npx.cmd serve out --config ../serve.json --listen tcp://127.0.0.1:4175 --no-clipboard
```

The serve configuration path is relative to `out`, so `../serve.json` points to the repository's existing configuration.

## Validation

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: all 78 existing promotion checks passed.
- `npm.cmd run build`: passed once; all nine static pages generated, including both existing case studies.
- All 37 distinct targeted production Chromium checks passed across two runs: the new hero, composition at 13 viewport sizes, introduction/navigation, media loading, SEO, header states, and representative mobile/desktop Selected Works/case-study flows.
- Desktop WebGL and mobile fallback screenshots were visually reviewed. Test screenshots and traces are local ignored artifacts.
- `npm.cmd run lint -- --no-fix`: unavailable because the repository has no lint script/configuration or ESLint dependency. No lint pass is claimed.
- Development SEO checks initially reported localhost Open Graph image URLs; the same checks passed against the production export. A conflicting device-memory test mock was corrected.
- No Lighthouse, FPS, real-device performance, or cross-browser scores were measured.

To rerun the focused production checks while the production preview is serving:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4175'
npx.cmd playwright test tests/immersive-hero.spec.mjs tests/cinematic-refinement.spec.mjs tests/introduction.spec.mjs tests/media-loading.spec.mjs tests/header-navigation.spec.mjs tests/seo.spec.mjs
```

## Known limitations and Phase 2 suggestions

This is a modest procedural scene, with stylized clouds and approximate wet reflections. Device selection is conservative and heuristic; it does not benchmark the GPU. The existing surface shrink/clip transition is retained alongside camera travel, so this is a normal flowing hero rather than an extended pinned sequence.

R3F currently emits a Three.js `Clock` deprecation warning in development. No related runtime errors were observed. npm audit reports seven advisories in the existing Tailwind toolchain (two moderate, five high); no advisories were reported on the added runtime packages. No unrelated dependency upgrades were applied.

Suggested future work, requiring separate approval: profile on real phones and Safari/Firefox; refine adaptive quality from measured frame timing; improve cloud silhouettes, roadside detail, and wet-reflection art direction; tune reveal/scroll pacing after user review. No Phase 2 work has been implemented.

Implementation references: [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas), [R3F performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), and [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
