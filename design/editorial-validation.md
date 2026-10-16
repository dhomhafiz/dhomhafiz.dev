# Editorial validation — 17 October 2026

Local production export validated at http://127.0.0.1:4174/.

Passed: Next.js production build, TypeScript, all 78 retained pricing checks, all 11 Chromium browser tests, and git diff whitespace validation.

Responsive widths: 320, 390, 768, 1440, 1920px. No horizontal overflow. Confirmed video appears before headline, decodes at 1120px and advances currentTime, muted inline playback, pause/play, previous/next, indicators and automatic slide advance. Reduced motion avoids fetching video until requested; simulated blocked autoplay retains Play; failed MP4 requests retain the actual website poster and explicit status. Only the active slide has a video source. Local Inter font loading is checked. Desktop/mobile screenshots visually inspected.

Demo checks at 320, 390 and 1440px: open project route, filter treatment, transfer treatment to form, pick date/time, submit fictional booking preview, return to portfolio. WhatsApp is explicitly unconfigured; no invented wa.me link is rendered. Email uses the existing owner address. No email or message was sent.

Screenshots: artifacts/editorial-1440.png and artifacts/editorial-390.png (plus the other tested widths). The preview responds successfully; a visible browser tab could not be opened because this session exposes no connected browsers. Automated Chromium verification and screenshots were completed instead.

Limitations: the live owner domain was unavailable through the web tool; selected work uses the existing fictional Still Dental demo. Real WhatsApp number remains required. No production deployment or Git mutation was performed.
