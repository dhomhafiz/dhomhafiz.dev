# Milestone 6E.1A - iPhone Safari Performance Panel

## Implementation

- Added a compact, collapsible diagnostics panel that appears only when the development server is running and the exact query parameter `?perf=1` is present.
- Samples reuse `window.__routePerformance`, the existing renderer frame loop, and existing scene-ready timing. Each sample runs for three seconds unless stopped early.
- The panel displays average FPS, P50/P95 frame time, jank counts, measured Canvas DPR, WebGL renderer identity, and scene initialization time.
- JSON export uses the iOS share sheet when file sharing is available and otherwise downloads a JSON file. Clipboard copy is available where Safari grants clipboard access; failures are reported in the panel.
- The panel is not rendered in production. The production build contains none of the panel's UI strings in its client JavaScript chunks.
- No graphics settings, camera behavior, journey timing, gestures, or dependencies were changed.

## Private Wi-Fi setup on Windows

1. Connect the Windows development machine and iPhone to the same trusted private Wi-Fi network. Do not use guest Wi-Fi or a public network.
2. In PowerShell, run `ipconfig` and note the IPv4 address for the Wi-Fi adapter connected to that network (for example, `192.168.1.42`). Do not use a VPN, public-interface, or loopback address.
3. From the repository root, bind Next.js to that specific private address on an unused port:

   ```powershell
   & .\node_modules\.bin\next.cmd dev --hostname 192.168.1.42 --port 3001
   ```

   Replace `192.168.1.42` with the Wi-Fi adapter's actual IPv4 address. This does not change firewall rules. If Windows Firewall or network policy blocks the connection, stop here; do not disable the firewall or expose the server on a public interface.
4. In another PowerShell window, verify the listening address is the selected private IP rather than `0.0.0.0`:

   ```powershell
   Get-NetTCPConnection -LocalPort 3001 -State Listen |
     Select-Object LocalAddress, LocalPort
   ```

5. On the iPhone, open Safari and visit `http://192.168.1.42:3001/?perf=1`, replacing the example IP with the actual address. Keep the machine on the trusted network and stop the development server after testing. Do not create a tunnel, router port-forward, or public deployment.

## Measurement sequence

1. Wait for the 3D scene to finish loading. Tap **Perf** to open the panel. The panel will report if scene readiness has not yet been recorded.
2. For each sample, select the scenario before starting, tap **Start Sample (3s)**, then perform that action during the three-second window. Let the countdown finish for comparable results; pressing **Stop Sample** early records a shorter sample.
3. Record these samples in the same page session:
   - **Hero idle**: leave the Hero untouched for the full sample.
   - **Hero camera look-around**: start the sample, collapse the panel, and make a deliberate horizontal camera-look gesture; allow the view to return to neutral.
   - **Hero to Dental scroll**: select this scenario, start, then use the Projects navigation or native vertical scrolling to reach Dental.
   - **Dental billboard viewing stop**: position at Dental first, then sample without interacting.
   - **Dental to Squid Game scroll**: start at Dental and swipe vertically through the journey toward Squid Game.
   - **Squid Game billboard viewing stop**: position at Squid Game first, then sample without interacting.
   - **Squid Game to Contact scroll**: start at Squid Game and use native vertical scrolling toward Contact.
   - **Contact idle**: reach Before Sunrise Contact first, then sample without interacting.
   - Optionally, use **Gallery open** and **Gallery close** for subjective UI checks. Gallery suspension may yield no WebGL frames by design.
4. After all scenarios, expand the panel and tap **Export JSON**. Use the iOS share sheet to save/share the JSON when offered; otherwise Safari downloads the file. **Copy JSON** may be unavailable over the local HTTP address, so use export if Safari reports a clipboard restriction.
5. Keep the exported file intact. Each export includes the completed samples from the current page session and a privacy-limited browser/OS family and major version, viewport, DPR, and diagnostics report. It does not include the raw user-agent string or device model. Reloading the page starts a new report.

## Device observations and limits

- Test portrait and landscape separately. After rotating, wait for the layout and scene to settle before sampling; note any address-bar resize, scroll restoration, or interaction issue alongside the exported measurements.
- Repeat the key stops if results vary. Compare measured frame times and renderer identity, not just average FPS.
- Note subjective hitching and device warmth separately from measured values. The panel does not measure temperature, battery use, or thermal throttling.
- Safari may mask the unmasked GPU renderer identifier or omit JavaScript heap information. The reported WebGL renderer is the browser-exposed value, not a guarantee of the physical GPU model.
- This procedure requires an iPhone on the trusted private network. Chromium emulation and Windows desktop hardware measurements are not substitutes for iPhone Safari results.

## Validation

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed.
- Development Playwright panel checks: passed, including exact query gating, automatic three-second sample, displayed metrics, and JSON download contents.
- Production preview check with `?perf=1`: panel absent; production client chunks contain no panel UI strings.
- Existing camera interaction and first mobile touch-look regression checks passed. One separate existing mobile touch-look case failed at its pre-existing `#works` URL expectation during a billboard drag; it was reproducible without `?perf=1` and is unrelated to panel sampling/export. No journey or gesture code was changed.

No physical iPhone run has been performed as part of this implementation.

## Milestone 6E.1B - Fallback diagnosis

The `?perf=1` development panel remains available whether or not the WebGL Canvas mounts. It now reports:

- Reduced-motion eligibility blocker, memory/core-count diagnostic hints, Save-Data/2G deferred-download reasons, and whether the user requested 3D.
- WebGL 1/2 JavaScript API availability, explicitly labeled as API-presence-only. No extra canvas or WebGL context is created for capability probing.
- Whether the scene's actual `<canvas>` element is mounted, renderer creation state, renderer/WebGL identity where a context was created, and observed context loss.
- Scene readiness checkpoints: shader compilation, scene upload/render, GPU-fence wait, ready, failure, or a 12-second observational timeout. The timeout only reports a stalled readiness state; it does not force a failure or change fallback behavior.
- Scene error boundary messages, WebGL context-creation errors, shader compiler/linker logs where exposed, and the existing WebGL context-loss and GPU-fence failure paths.
- A privacy-limited device summary (browser/OS family and major version, mobile/desktop class, viewport and DPR, touch, reduced-motion, Save-Data, exposed cores and memory). Raw user-agent strings, device model names, URLs and local file paths are not included in exported diagnostics.

### Confirmed source behavior

- `ImmersiveHero` starts with 3D ineligible until its client-side policy check. Reduced motion blocks activation. Save-Data or a 2G effective-type hint defers the optional download until **Load 3D scene** is requested. Reported memory and core count are available as diagnostic hints, not blockers.
- Even an eligible/requested scene retains the static poster until the existing SceneReadiness process compiles materials, renders the initial scene, and observes the GPU completion fence. A failed poster decode also prevents the current reveal condition from becoming true.
- The existing Canvas renderer requests low power and has `failIfMajorPerformanceCaveat: true`; errors remain protected by the existing React boundary and existing scene failure handling.
- API-presence checks cannot prove that iOS Safari can create a usable context. The real context result is captured from the existing Canvas/renderer lifecycle, with creation errors and readiness state reported separately.

### Validation

- TypeScript and production build passed after the diagnostics changes.
- Development Playwright diagnostics scenarios passed **9/9**: eligible ready scene and sample export; reduced motion; resource-hint eligibility; Save-Data defer and explicit load; WebGL context creation failure; GPU-fence initialization failure; context loss; and the non-fatal 12-second readiness timeout.
- Existing mobile rendering/fallback/journey suite passed **13/13** at the diagnosis milestone, including actual poster fallback, context loss, reduced motion, low memory/cores, no WebGL, failed initialization, Save-Data/2G, and subsequent explicit load.
- Production preview with `?perf=1` showed no panel; the unique panel and readiness-timeout strings were absent from exported client chunks. Diagnostic polling/listeners and readiness timeout are development-only.
- The iPhone 15 Pro Max export confirmed the former core-count threshold as the root cause. Milestone 6E.1C removes that gate; the actual device still needs retesting to confirm that Safari proceeds to successful renderer and scene readiness.

## Milestone 6E.1C - Eligibility correction

- Removed reported device-memory and logical-processor thresholds from scene eligibility. Reduced motion remains the only automatic eligibility blocker; Save-Data/2G continue to require an explicit load.
- Kept the existing DPR 1 coarse-pointer profile, Canvas, readiness flow, poster reveal, WebGL error handling, and context-loss fallback unchanged.
- Development eligibility diagnostics now list only real blockers. Memory and core-count values remain visible as hints in the safe device summary.
- Regression coverage simulates the reported 430x669 coarse-pointer iPhone profile (4 logical processors, no exposed device-memory value, reduced motion off), lower core counts and memory, WebGL absence/initialization failure, reduced motion, Save-Data, context loss, and existing desktop behavior.
- Passing Chromium simulation verifies only that the code takes the WebGL attempt path; it does not establish physical iPhone Safari renderer creation or successful rendering.
