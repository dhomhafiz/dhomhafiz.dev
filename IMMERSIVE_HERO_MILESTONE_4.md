# Milestone 4 — Before Sunrise Contact destination

Implemented locally on `feature/immersive-hero-poc`. No merge or deployment. Further visual polish and optimization await approval.

## Camera and scroll

The existing pinned highway now spans 12 screens of travel: the original eight screens for Hero and both billboards, followed by a four-screen Contact leg. One normalized journey ref and one existing ScrollTrigger drive the entire route. Billboard configuration, geometry, positions and framing are unchanged; a lightweight conversion maps the original billboard intervals into the longer normalized journey.

After Squid Game, the sampler carries forward the exact existing camera pose, including aspect-dependent retreat. Smoothstep curves return x to the road center, yaw to zero and pitch to -0.012, then decelerate to `[0, 2.8, -278]` at progress 0.96. Contact navigation targets the final viewing plateau at 0.975. The sampler is reversible; no timer, timed hold or second camera controller is added. Existing mouse damping remains additive, with the billboard exploration strength retained during the final leg.

A numerical comparison against the previous committed camera sampler covered **3,003 billboard samples** across three horizontal fields of view. The maximum position/rotation difference was `3.84e-13` (floating-point rounding). The appended leg was monotonic forward in z. Evidence: `artifacts/milestone-4/path-validation.json`.

The original document-scroll navigation tween now handles `#contact` alongside `#works`. Contact clicks, wheel interruption, native reverse scroll, Back/Forward and refresh all resolve through the same journey hook and entry/session scroll persistence. Direct `#contact` links resolve to the final cinematic pose when the scene becomes ready. Existing `#works-film` access and the gallery's saved normalized progress remain functional.

The Contact pose is the end of the supported desktop document journey. The existing archive host sits within the same journey wrapper, so it cannot add a second flow segment after Contact. While the immersive journey is active, the inactive host is out of flow and inert; the existing View All Projects action presents that same HTML archive as the accessible full-screen dialog. Reduced-motion, touch-mobile, and WebGL fallback visitors retain the ordinary in-flow archive.

Direct `#works-film` links open the archive presentation on the immersive route and return to the journey on dismissal. The route still uses native scroll as its only journey input; no additional scroll controller or global scroll lock was added.

## Atmosphere and world continuity

`dawnProgress` maps the appended leg from zero to one using normalized camera journey progress. It remains zero through both billboard viewing zones, reaches one at the final pose, and reverses when scrolling back.

- The existing cloud cubemap is still baked once at the original resolution. No additional environment bake, scene, canvas, texture download or post-processing pass was added.
- Sky and wet-road shaders share a directional dawn color response: muted blue overhead, amber near the forward horizon, with the cached cloud structure retained. Wet reflections therefore change with the visible sky.
- Existing hemisphere/key/fill lights and fog progressively change color/intensity/density through the same dawn value. Terrain silhouettes retain the existing materials and profiles.
- Road, guardrails, ground coverage and terrain depth extend far enough to support the added camera leg. The sky sphere follows the existing camera so it continues enclosing the view.
- The original slow cloud drift remains; it does not control dawn. Stopping the journey stops the dawn progression. Manual scene pause freezes rendering and atmosphere as before.

The shader validation observes the actual `uDawn` values uploaded to WebGL. An initial check caught material instances retaining their initial uniform value; the final implementation updates the live sky and road material refs as well as fog/light state.

## Contact HTML and accessibility

There is one semantic `#contact` section and one set of real contact links. It presents:

- “HAVE A PROJECT IN MIND?”
- A business-focused invitation to discuss custom websites and interactive web experiences.
- “LET'S BUILD SOMETHING”, using the existing `whatsappHref()` configuration and verified destination. Email and social links remain available.

On supported devices that same section is presented over the final world, with typography opacity/translation driven by the camera's sampled arrival progress. Inactive Contact content is inert and excluded from the accessibility tree. On reduced-motion, touch-mobile, unsupported-WebGL or context-loss fallback, it remains ordinary readable HTML in its existing position after the archive. The old standalone `ContactMotion` component is no longer mounted, so it does not create a competing Contact animation loop. The file itself was left untouched.

Pausing the optional scene does not disable HTML Contact navigation. Focused Contact navigation lands on the semantic heading; the following Tab reaches the WhatsApp CTA. Real anchor semantics, new-tab indication and `noopener noreferrer` remain. The WhatsApp test intercepts the destination locally; no chat message was sent.

The new heading uses the repository's existing full **Barlow Condensed ExtraBold** font. Visual QA confirmed the old Anton subset omitted letters needed by the new headline; it was not reused for unsupported glyphs. No font download or dependency was added.

## Files changed

- `src/components/features/immersive/routeJourneySettings.ts` — normalized intervals and shared progress helpers.
- `src/components/features/immersive/routeCameraPath.ts` — appended reversible Contact leg.
- `src/components/features/immersive/useImmersiveJourney.ts` — Contact navigation, history/deep-link restoration, semantic visibility and fallback cleanup.
- `src/components/features/immersive/ImmersiveHero.tsx` — passes the existing manual pause state to HTML journey coordination.
- `src/components/features/immersive/ProjectScreen3D.tsx` — converts normalized camera progress for existing billboard hit eligibility; no visual changes.
- `src/components/features/immersive/RouteScene.tsx` — camera-synchronized Contact reveal and environment coordination, using the existing frame loop.
- `src/components/features/immersive/RouteEnvironment.tsx` — progressive live lights/fog/uniforms and camera-centered sky dome.
- `src/components/features/immersive/routeEnvironmentSettings.ts` — dawn palette and existing world coverage extension.
- `src/components/features/immersive/routeShaders.ts` — common directional dawn sky/reflection sampling.
- `src/components/features/editorial/HireMe.tsx` — single Contact presentation with existing real links and full headline font.
- `src/components/features/immersive/immersive.css` — scoped Contact typography, contrast, reveal, responsive and fallback styling.
- `src/hooks/useHeroVideoTransition.ts` — ignores inactive Contact presentation when tracking header navigation.
- `tests/immersive-contact.spec.mjs` — targeted camera, shader, navigation, keyboard, history, fallback and screenshot checks.
- This report.

## Validation

- TypeScript and the production static export build passed.
- An 11-test targeted run passed: six Contact tests, four desktop/mobile header navigation cases, and the existing gallery Back/Forward/refresh/rapid-dismissal/case-study test.
- Both billboard gallery open/close/camera/focus restoration tests passed separately in the initial integration run.
- Following the font and spacing correction, the six Contact checks and screenshots were rerun against the final production build: **6/6 passed**. Results are in `test-results/milestone-4-contact-final`; the earlier 11-test passing run is in `test-results/milestone-4-final`.
- Supported-path checks observed no console errors or uncaught page errors. Browser promise rejections are reported by Playwright as page errors. The existing dependency-owned `THREE.Clock` deprecation remains; it was not suppressed or patched. Forced WebGL failure/context loss intentionally exercises the existing fallback boundary.
- Source audit: one `ScrollTrigger.create`, one `<Canvas>`, no mounted `<ContactMotion>`. DOM checks confirm one canvas, one Contact section and one film reel.
- Local preview returned HTTP 200.

Browser coverage includes Squid Game → Contact, reverse to both billboards and Hero, progressive/reversible uploaded dawn values, stationary dawn, pause/resume, Contact navigation interruption, focus/Tab order, the configured WhatsApp URL, history and reload, a fresh Contact deep link, context loss, reduced motion, unsupported WebGL, touch-mobile layout, and gallery history restoration.

## Screenshots for visual approval

- `artifacts/milestone-4/midnight.png`
- `artifacts/milestone-4/transition.png`
- `artifacts/milestone-4/dawn-contact.png`
- `artifacts/milestone-4/mobile-contact.png`

## Limits and local preview

Validation uses Chromium and an emulated touch viewport; physical mobile devices and other browser engines remain unverified. No FPS or Lighthouse measurement is claimed. The color balance, typography scale and deceleration are the Milestone 4 proposal for visual review; further polishing/optimization has not been undertaken.

Run `npm.cmd run dev` and use the printed local URL (normally `http://127.0.0.1:3000`). Click Contact for the cinematic journey, or load `/#contact` directly. Reduced motion and touch fallback open the semantic Contact section. A static preview is available with `npm.cmd run preview:validation` after `npm.cmd run build`.
