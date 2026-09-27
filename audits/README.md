# Production build audit — 28 September 2026

Lighthouse 13.5.0, headless Chrome, local static production export at http://127.0.0.1:4173 with the cache rules in `serve.json`. These are local lab results, not measurements of a deployed domain. Reports are single runs and scores can vary.

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Mobile, dark | 96 | 100 | 100 | 100 | 2.7 s | 0 |
| Mobile, light | 97 | 100 | 100 | 100 | 2.7 s | 0 |
| Desktop, dark | 100 | 100 | 100 | 100 | 0.5 s | 0 |

Open `mobile.report.html`, `mobile-light.report.html`, and `desktop.report.html` for the full reports. The light-mobile report includes the final mobile-overlay adjustment. Dark and desktop behavior was unaffected by that adjustment.

## Changes

- Replaced the 1,408,441-byte portrait PNG request with responsive AVIF/WebP images, approximately 18–59 KB depending on size and format.
- Compressed the 18,426,054-byte 4096×2160 Pexels video to an 871,009-byte 1280×676, 24 fps H.264 MP4 with fast-start metadata and no audio.
- Added a 21,156-byte still frame, prioritized because the audit identified it as an LCP image.
- Video loading waits for initial page load/idle time. Reduced motion, Save-Data, and reported slow connections get the still frame; off-screen/hidden video pauses.
- Added responsive project images and cache headers for the local production server.
- Corrected the video control's accessible name to include its visible label.
- Strengthened the light mobile overlay behind text after inspecting screenshots.

## Checks

Production build and TypeScript passed. Browser checks verified no MP4 requests for reduced motion, Save-Data, or 3G; AVIF selection; desktop horizontal overflow; off-screen pause/resume; and live reduced-motion changes. Desktop light/dark and mobile screenshots were inspected. No contact emails were sent.

## Remaining limitations

Mobile LCP is about 2.7 seconds in these simulated runs; further performance gains are possible. Lighthouse still reports framework JavaScript opportunities and a small render-blocking stylesheet. The site was not rewritten or browser compatibility reduced to remove those framework costs.

Re-audit the deployed HTTPS URL to verify real hosting compression, caching, network latency, and headers. Automated accessibility scores do not replace a full manual accessibility review. EmailJS delivery is not tested by these audits.
