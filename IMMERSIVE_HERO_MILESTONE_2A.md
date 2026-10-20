# Milestone 2A — Cinematic visual refinement

Completed locally on `feature/immersive-hero-poc`. No deployment, merge, new dependency, or Milestone 2B work.

## Visual changes

- Layered, domain-warped storm cloud formations with a small veiled moon, indirect cool illumination, and a blue-grey horizon bank. The cloud layers overlap at different scales rather than using the original flat noise bands.
- Wet asphalt with exposed aggregate, irregular puddle masks, spatial roughness variation, view-dependent Fresnel response, and filtered cloud reflections. Warm highlights correspond to the chevron downlight stations. Markings have antialiased edges and worn paint, with gravel shoulders and drainage edges.
- Two asymmetrical mountain profiles frame the road's vanishing point. Their irregular ridges, muted rock strata, foreground boulders, and shared distance fog separate foreground, midground, and background.
- Smaller chevron assemblies now have rounded metal borders, amber reflective-style faces, dark arrows, galvanized posts, and downlight housings. Standard lit materials respond to moonlight, fill light, and a single near-field warm light. Folded W-section guardrails, support posts, and small reflectors establish road scale.

The retained scrim keeps the original HTML typography readable. Homepage copy, typography, navigation, film reel, contact, and case-study functionality were not edited.

## Architecture and changed files

Only these implementation files changed during this milestone:

| File | Change |
| --- | --- |
| `src/components/features/immersive/RouteScene.tsx` | Extract the environment into its own component; retain the existing camera and Canvas configuration. |
| `src/components/features/immersive/RouteEnvironment.tsx` | New environment-owned geometry, lighting, sky baking, resource cleanup, and materials. |
| `src/components/features/immersive/routeEnvironmentSettings.ts` | New centralized palette, fog, sky resolution, wetness, sign spacing, terrain density, and rail settings. |
| `src/components/features/immersive/routeShaders.ts` | Layered sky baking, cached sky sampling, and wet-road shading. |
| `IMMERSIVE_HERO_MILESTONE_2A.md` | This handoff. |

`ImmersiveHero.tsx` and `immersive.css` are byte-for-byte unchanged from the beginning of this milestone. The `CameraRig` function is also byte-for-byte unchanged. Pre-existing uncommitted Phase 1 changes are retained. Existing tests were run without modification.

## Assets, licenses, and performance considerations

No external images, models, PBR texture packs, or new packages were added. Geometry and shading are authored in source. The only new texture is generated on the GPU from the authored sky shader; there is no third-party asset license to track.

The sky is baked once per scene mount into six 512×512 cubemap faces, with mipmaps. Both the visible sky and wet asphalt reuse that map. Its RGBA8 texel storage is approximately 8 MiB including mipmaps, excluding driver overhead. Detailed cloud noise is not recalculated across the full sky every frame. The map is disposed on unmount, and environment-owned terrain/rail geometries have explicit cleanup.

The scene uses two terrain meshes, 54 instanced boulders, and instanced signs/rail supports/reflectors. There are no dynamic reflection captures, volumetric ray marches, shadow maps, bloom, or post-processing. One point light supplements the directional/hemisphere lighting. Existing DPR cap of 1.5, lazy loading, render suspension when hidden/offscreen, pause/resume, and conservative mobile/reduced-motion fallbacks remain intact.

These are implementation budgets and tradeoffs, not measured FPS or Lighthouse improvements. Real-device GPU time, memory use, and battery impact have not been profiled.

## Before and after

Both captures use 1440×1000, device scale 1, the same camera/controller configuration, neutral pointer, no scroll, and a settled opening reveal before pausing programmatically. The expected resting camera is `[0, 2.25, 6]`, with pitch `-0.025`. The baseline is from the existing development preview and the final capture is from the production export.

| View | Before | After |
| --- | --- | --- |
| Hero with original HTML | [Before hero](artifacts/milestone-2a/before-hero.png) | [After hero](artifacts/milestone-2a/after-hero.png) |
| Environment detail | [Before environment](artifacts/milestone-2a/before-environment.png) | [After environment](artifacts/milestone-2a/after-environment.png) |

For the environment-only pair, the capture tool temporarily hides the same HTML overlays in the browser in both versions. The app's scrim remains present; no content or typography was altered in source. Images and capture helper are local ignored artifacts under `artifacts/milestone-2a/`.

## Validation

- `npm.cmd run typecheck`: passed on the final implementation.
- `npm.cmd run build`: one production build passed, including TypeScript and all nine static pages.
- Six immersive-hero tests, four header-navigation tests, three media-loading tests, and three SEO tests passed against the final production export: **16 tests passed**.
- These verify a real WebGL context; mouse response using road-only screenshot crops; frozen frames while paused; resume/scroll behavior; context-loss and unsupported-WebGL fallback; low-memory, mobile/no-JavaScript, Save-Data, and live reduced-motion paths; direct Works/Contact links; retained navigation states; and SEO metadata.
- Final comparable screenshots were inspected. The capture reported zero browser exceptions or shader-compilation errors. The existing Three.js `Clock` development deprecation warning remains.
- No changes were made to the carousel or case studies. Their full interaction suites were not rerun for this environment-only milestone. No regressions were observed in the targeted checks; cross-browser and real-device behavior remain unverified.
- Existing repository lint setup remains unavailable; no lint pass is claimed.

## Local preview

An existing user-owned development server was found at <http://127.0.0.1:3000> and left running. It reflects the updated source.

To start a development preview when that server is stopped:

```powershell
npm.cmd run dev
```

To preview the completed production export:

```powershell
npx.cmd serve out --config ../serve.json --listen tcp://127.0.0.1:4176 --no-clipboard
```

The `serve` configuration path resolves relative to `out`. The temporary production QA server was stopped after validation.

To rerun the targeted tests while that production preview is running:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4176'
npx.cmd playwright test tests/immersive-hero.spec.mjs tests/header-navigation.spec.mjs tests/media-loading.spec.mjs tests/seo.spec.mjs
```

## Visual limits

The result improves atmospheric depth and surface variation but does not reach photorealism or the full environmental fidelity of the benchmark. Clouds are layered procedural fields cached on a cube, not volumetric simulations. Terrain remains low-detail authored geometry rather than scanned rock formations. Asphalt reflects the cached sky and analytic local light lobes; it does not reflect nearby terrain, signs, or other objects through a real scene-reflection pass. Roughness filtering uses cubemap mip levels rather than a full measured material/BRDF pipeline. These choices keep the proof of concept bounded and lightweight.

A higher realism target would benefit from carefully licensed high-quality rock/asphalt materials, more detailed terrain assets, improved physically based environment filtering, and device profiling. None of those additions or cinematic-navigation work have been started. Milestone 2A stops here for review.
