# Lighthouse optimisation — 17 October 2026

Production homepage: http://127.0.0.1:4174/. Lighthouse 13.5.0, headless Chromium 156. One completed cold navigation per profile, sequentially, with the same standard simulated mobile/desktop settings as the baseline. No deployment performed.

| Profile | Performance before → after | Accessibility before → after | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 82 → **94** | 96 → **100** | 100 → 100 | 100 → 100 |
| Desktop | 99 → **100** | 96 → **100** | 100 → 100 | 100 → 100 |

| Mobile metric | Before | After |
| --- | ---: | ---: |
| LCP | 4.3 s | 2.7 s |
| TBT | 210 ms | 150 ms |
| CLS | 0 | 0 |
| Speed Index | 1.6 s | 1.2 s |
| Total transferred during audit | 1,620,312 bytes | 583,031 bytes |

## Changes

- Responsive hero poster is explicitly preloaded at high priority. Mobile uses a 768px WebP (20,594 bytes), desktop retains the existing still. The image is present in server HTML, before optional playback.
- Video waits for the initial load, poster decode, fonts, two animation frames and a browser idle opportunity. It remains muted, inline, looping, without controls, and pauses offscreen/when hidden. Reduced motion, Save-Data and reported 2G connections retain the poster without fetching footage. Errors also retain the poster.
- Mobile video: 640px, 24fps, H.264, CRF29, no audio, faststart; 264,108 bytes versus 967,684 bytes for the retained desktop version. Generated from the same original Pexels video.
- Inter stays self-hosted and OFL-licensed. The official variable Latin WOFF2 is 48,256 bytes instead of 352,240 bytes. English and Malay Latin text remain supported. No runtime request to Google Fonts. The header portrait also uses an 868-byte thumbnail rather than its 12,276-byte large source.
- Service copy now renders on the server; a small viewport observer imports the animation module only near the section. Its four steps, sticky heading, hover, touch and reduced-motion behavior are retained.
- Selected Work supporting text darkened to #666; the Lighthouse contrast failure is resolved.
- Preview/start commands use the existing serve.json cache rules. Verified HTML no-cache; image/video max-age 30 days; hashed Next assets one year and immutable. The preview runs with this configuration.

## Validation

Production build, TypeScript, all 17 browser tests and all 78 pricing checks passed. Additional browser checks passed for all four service steps, reduced motion, work-card hover/blur, keyboard and touch navigation. Media tests verify device-specific poster/video sources, no duplicate desktop poster download on mobile, Save-Data skipping video and actual cache response headers. Existing Open Graph image and alt remain unchanged.

## Remaining limits

Mobile Performance meets the requested 90+ target in this local run, but LCP at 2.7 s still has room for improvement. Lighthouse continues to flag about 53 KiB of unused code in the retained framework runtime chunks; feature animation code is now deferred. No framework migration, disabling browser compatibility or score-specific behavior was introduced.

This benchmark includes the newly activated local cache configuration, unlike the original baseline. Scores vary by host, device and machine load; these are single lab runs, not field Core Web Vitals. serve.json does not automatically configure GitHub Pages response headers: audit the live host after a separately authorised deployment. The dental route was functionally tested but was not included in these Lighthouse runs.

## Reports

- [Mobile HTML](2026-10-17-optimized-mobile.report.html) · [Mobile JSON](2026-10-17-optimized-mobile.report.json)
- [Desktop HTML](2026-10-17-optimized-desktop.report.html) · [Desktop JSON](2026-10-17-optimized-desktop.report.json)
- [Summary JSON](2026-10-17-optimized-summary.json)
- [Original baseline](2026-10-17-editorial-lighthouse.md)
