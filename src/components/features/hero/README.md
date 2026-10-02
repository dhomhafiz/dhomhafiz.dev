# Fullscreen hero cover transition

The portfolio uses native CSS sticky positioning. No GSAP, Lenis, Framer Motion, animation dependency, or per-frame JavaScript has been added.

`PortfolioPage.tsx` places the hero in a `200dvh` runway. The hero is `position: sticky; top: 0` and exactly `100dvh` tall, with `vh` fallbacks. The opaque `.portfolio-content` layer has a higher stacking level and a `-100dvh` top margin, so its initial top edge is one viewport below the opening view.

For page scroll distance `s` between zero and viewport height `H`, the content top edge is `H - s`, while the hero stays at zero. At `s = H`, the content fully covers the hero and the sticky runway ends. Subsequent sections continue in normal document flow. This is native scroll scrubbing: stopping freezes the cover position and reversing scroll uncovers the hero. The video/container never scale or animate width, height, or border radius.

`SiteHeader` uses its optional `overlay` mode for the portfolio, so navigation no longer consumes space above the fullscreen hero. The content overlay reserves space for the fixed header and video playback control. Laptop typography and spacing compact on short viewports. Desktop/tablet short viewports can scroll the Hero details region internally to preserve access to every element.

Below 768px, the hero details use normal page flow without nested scrolling. The video layer alone is sticky and viewport-sized; a trailing viewport spacer inside the hero supplies its pinning boundary, and the foreground's negative margin overlaps that spacer. Hero copy and portrait move immediately with page swipes, and Personal Projects enters as soon as that content reaches the viewport edge. The video stays pinned until the foreground fully covers it. This preserves all hero content while removing the old inner-scroll distance plus a separate full viewport of transition scrolling. The visibility marker follows the natural mobile hero-content height so playback pauses at full coverage.

The video element and cover geometry exist in the server output. The existing optimized 720p video sources attach after page load/idle. The prioritized poster fills the hero immediately, without waiting for video download or creating layout shifts. Autoplay remains muted, looping, and inline. The existing reduced-motion, Save-Data, and slow-network policies suppress video downloads. A non-sticky visibility marker pauses video when the foreground fully covers it, and resumes on return unless the user paused it. IntersectionObserver and page visibility listeners are cleaned up on unmount.

Reduced-motion CSS removes the runway and sticky pin, and places content after the hero in normal flow. The hero can grow to fit all text in that mode. The cover effect also works without JavaScript, using the poster fallback.

Validation:

- `npm.cmd run build` includes TypeScript validation. No lint script is configured in this repository.
- `node .audit-tools/check-cinematic-hero.mjs` verifies viewport geometry, forward/reverse progress, foreground stacking, scrolling input, continuation, fully-covered video pause/resume, live reduced-motion toggling, resize, no-JavaScript layout, and video-download policies at 1440×900, 1280×720, 768×1024, 390×844, and 320×568. Screenshots are saved in `audits/cinematic-hero-*.png`.
- `node .audit-tools/check-demo-navigation.mjs` verifies filters, repeated demo links, header offsets, focus, and direct-hash reloads at 320px and 1440px. It explicitly returns to the opening layer before clicking hero links; `scrollIntoView` alone cannot uncover an element under a higher foreground layer.

Run the workspace with `npm.cmd run dev`. These browser checks do not establish a new Lighthouse score or guarantee 60fps on every device.
