# Lighthouse audit — 17 October 2026

Audited the current homepage production export at http://127.0.0.1:4174/ after a successful `npm run build`. One completed run per profile, sequentially, using Lighthouse 13.5.0 and headless Chromium 156. Default Lighthouse simulated throttling; mobile CPU multiplier 4×, desktop 1×. These are local lab results, not a live-domain or physical-device measurement. No application code was changed for the audit.

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 99 | 96 | 100 | 100 |
| Mobile | 82 | 96 | 100 | 100 |

| Metric | Desktop | Mobile |
| --- | ---: | ---: |
| First Contentful Paint | 0.3 s | 0.9 s |
| Largest Contentful Paint | 0.8 s | 4.3 s |
| Total Blocking Time | 0 ms | 210 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 0.6 s | 1.6 s |

## Findings

- Mobile performance is principally limited by LCP. Lighthouse identifies the hero video/poster as the LCP resource and flags missing high fetch priority for discovery. The video begins loading on client mount; poster/video loading priority merits inspection before choosing an optimisation.
- Accessibility loses points for the small supporting text “Considered design. Working experiences.” in `#works .section-heading p`. Lighthouse reports foreground `#737373` on background `#f4f4f2`, contrast 4.3:1 versus the expected 4.5:1. The same contrast audit fails on desktop and mobile.
- Lighthouse flags approximately 53 KiB of unused JavaScript and opportunities in render-blocking CSS and image delivery. Mobile also records 210 ms of blocking time.
- Efficient cache lifetime audit flags about 1,575 KiB. The local preview response for the hero poster had no Cache-Control header; this finding is specific to the current preview configuration, and production hosting headers must be measured separately. Existing `serve.json` contains cache rules but they are not applied by this preview invocation.
- No Lighthouse run warnings or runtime errors in either completed report. Earlier browser-launch attempts did not produce scores and are excluded.

## Reports

- [Desktop HTML](2026-10-17-editorial-desktop.report.html) · [Desktop JSON](2026-10-17-editorial-desktop.report.json)
- [Mobile HTML](2026-10-17-editorial-mobile.report.html) · [Mobile JSON](2026-10-17-editorial-mobile.report.json)
- [Machine-readable summary](2026-10-17-editorial-summary.json)

Only the homepage was audited; `/demo-dental/` was not included. Scores vary by machine, load and hosting. SEO 100 is the automated Lighthouse checklist result and is not a guarantee of rankings or indexing. Accessibility 96 does not replace a manual accessibility review.
