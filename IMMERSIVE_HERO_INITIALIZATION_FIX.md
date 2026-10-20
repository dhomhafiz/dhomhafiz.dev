# Immersive hero initialization fix

Completed locally on `feature/immersive-hero-poc`. No environment redesign, camera sensitivity change, cinematic navigation, merge, deployment, or Milestone 2B work. Earlier uncommitted work is preserved.

## Root cause and evidence

The reported triangular road, flat sky, and three partial chevrons are the **CSS fallback**, which was deliberately displayed while the dynamically imported 3D bundle loaded. It contained `.route-fallback-road` and three `i` elements, with no mountains, clouds, materials, or guardrails. It was visually too different from the finished environment.

The issue was reproduced against the previous production export using Chromium with an empty cache, 150 ms network latency, approximately 1.6 Mbps download throughput, and 4× CPU throttling. Holding JavaScript requests showed exactly that incomplete-looking view with **zero canvas elements**, one CSS road, and three CSS signs. This confirms the principal visual mismatch precedes WebGL initialization.

Instrumentation recorded the first ready state after 16 main-scene draw calls had already been submitted. All environment geometry is built synchronously; there is no staged low-quality-to-high-quality 3D construction. Captures did not demonstrate progressive shader or geometry pop-in inside a visible canvas. Shader compilation is therefore not claimed as the confirmed root cause.

There was also a readiness weakness: `CameraRig` called `onReady` in `useFrame`, which runs before R3F's render call. That did not explicitly establish a completed first GPU frame. The previous 1.2-second opacity transition prolonged the overlap between the inaccurate fallback and the complete scene. Both the fallback mismatch and the readiness contract have been addressed.

Evidence is retained under `artifacts/initialization-fix/`: `before-trace.json`, before/after frame sequences, screenshots, and layout-probe JSON. These are ignored local QA artifacts.

## Fix and lifecycle

1. Server-render a responsive WebP poster captured from the complete, existing environment at its opening camera pose. It contains the terrain, clouds, markings, signs, and rails. The old CSS triangle and partial signs are removed.
2. Keep the HTML headline, branding, navigation, and CTAs independent of readiness. A small “Preparing scene…” status appears while an eligible client initializes.
3. Keep the canvas transparent and its animation loop stopped. Existing layout effects bake the sky and populate all instance matrices.
4. Await Three.js `compileAsync` for the complete scene, then render one hidden frame to upload geometry/textures and draw every material.
5. Insert and asynchronously poll a WebGL2 GPU fence. Only a completed frame can set `data-initialized`. No fixed loading delay or synchronous `gl.finish()` is used.
6. Wait for poster decoding (or a handled poster failure), then fade the completed canvas over the retained fallback in **450 ms**. The camera reveal starts from its original pose after preparation; loading does not consume its animation time.

Shader-error and context-loss handling is registered before the environment's initial sky bake. Compilation/render exceptions, failed fences, context loss, unsupported WebGL, and component/chunk errors leave the poster usable. If the poster itself fails, an intentional dark gradient remains; it does not block a successfully initialized canvas. A nonresponding driver can leave the poster/status visible rather than forcing an unready canvas onscreen.

Reduced-motion, low-power, mobile, Save-Data, and no-JavaScript users retain the static poster without mounting 3D. Pause/resume and offscreen/background render suspension remain. Disabling and re-enabling motion resets readiness, so a newly mounted canvas cannot inherit the previous scene's ready state.

## Files changed for this fix

| File | Purpose |
| --- | --- |
| `src/components/features/immersive/ImmersiveHero.tsx` | Responsive poster, decoding/failure state, loading status, and fresh readiness on eligibility changes. |
| `src/components/features/immersive/RouteScene.tsx` | Gate the render loop, install early failure handlers, and remove pre-render readiness from the camera controller. |
| `src/components/features/immersive/SceneReadiness.tsx` | New asynchronous material/first-frame/GPU completion gate with cleanup. |
| `src/components/features/immersive/immersive.css` | Replace the CSS mock scene with a poster/backdrop and shorten the opacity transition. |
| `public/images/route-666-placeholder-desktop.webp` | 34,846-byte poster, 1440×1000. |
| `public/images/route-666-placeholder-mobile.webp` | 19,580-byte poster, 600×1000. |
| `tests/immersive-initialization.spec.mjs` | Delayed/failed readiness, repeat refreshes, throttling, preference remounting, poster failure, navigation, and layout checks. |
| `IMMERSIVE_HERO_INITIALIZATION_FIX.md` | Investigation and validation handoff. |

No dependencies were added. The posters are screenshots of this repository's authored procedural environment, with HTML overlays and scrim hidden during capture; no third-party assets or new license obligations were introduced. Existing installed Sharp tooling was used only to encode the WebP files. The original environment component, shaders, settings, camera sensitivity/interpolation math, portfolio content, and unrelated components are unchanged.

## Validation

- `npm.cmd run typecheck`: passed.
- One `npm.cmd run build`: passed, including TypeScript and all nine static pages.
- **21 production-browser tests passed** across initialization, immersive hero, header navigation, media loading, and SEO suites.
- Repeated loads included two cold-cache and two warm-cache navigations/reloads. CDP hard reloads bypassed cache for cold runs. The sequence used 4× CPU throttling, 150 ms latency, and 200,000 bytes/second download throughput.
- A deliberately unsignaled GPU fence kept the canvas at opacity zero and the complete poster visible while keyboard/anchor navigation to Works and Contact remained usable. Releasing the fence enabled the completed frame and fade. An injected `WAIT_FAILED` retained the fallback. Poster-request failure also left a usable backdrop and did not prevent a valid scene from revealing.
- During repeated reloads, frame-level probes observed no visible canvas before GPU completion. No shifts were observed during the handoff; HTML heading bounds were unchanged across readiness. No browser exceptions or hydration errors were observed in the repeated-load test.
- Existing tests verified real WebGL rendering, pointer response, pause/resume, scroll/header state, unsupported WebGL, context loss, reduced motion, low-power/mobile/no-JavaScript paths, Save-Data, and SEO.
- Before/after screenshots and CDP frame sequences were captured under the same 1440×1000 viewport and throttling. The new preparing view and sampled transition frames were inspected visually.

An initial test that asserted zero *whole-page* CLS detected an existing font swap. A separate before/after probe recorded the exact same approximately **0.00318** shift on both versions, immediately before `document.fonts.ready`, well before scene readiness. This font behavior was not changed; the regression test specifically verifies the reveal adds no observed shift. Overall page CLS is not claimed to be zero.

## Screenshots and frame evidence

| State | Before | After |
| --- | --- | --- |
| Preparing, JavaScript held | [Old incomplete-looking fallback](artifacts/initialization-fix/before-placeholder.png) | [Complete opening-pose poster](artifacts/initialization-fix/after-placeholder.png) |
| Deliberately blocked GPU | — | [Poster with usable HTML](artifacts/initialization-fix/after-loading.png) |

`before-frame-*.jpg` and `after-frame-*.jpg` show initialization sequences; `before-trace.json` and `after-trace.json` record canvas opacity, readiness state, shader compilation counts, and submitted scene draws. `before-layout.json` and `after-layout.json` identify the existing font-shift sources and timing.

## Preview and rerun

The existing user-owned development server at <http://127.0.0.1:3000> was left running. Otherwise start it with:

```powershell
npm.cmd run dev
```

To serve the completed production export and run the targeted checks:

```powershell
npx.cmd serve out --config ../serve.json --listen tcp://127.0.0.1:4177 --no-clipboard
```

In another terminal:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4177'
npx.cmd playwright test tests/immersive-initialization.spec.mjs tests/immersive-hero.spec.mjs tests/header-navigation.spec.mjs tests/media-loading.spec.mjs tests/seo.spec.mjs
```

The temporary production QA server was stopped after validation.

## Limits

Validation used desktop Chromium and simulated mobile/reduced-capability conditions. Safari, Firefox, real mobile GPUs, very slow physical hardware, and real driver failures were not tested. No FPS or Lighthouse measurements were made. Automated readiness assertions cannot prove every driver/compositor behaves identically; screenshots and frame sequences supplement them.

Poster framing matches representative desktop/mobile opening views; other aspect ratios use `object-fit: cover`, so minor framing differences can remain during the short crossfade. Regenerate/version the posters if the environment's visuals or opening pose change in future. No cinematic-navigation work has begun.
