# Coordinated frame shrink and rising content

The video begins fullscreen and edge-to-edge, with no scale or rounded corners. HeroBackdrop attaches useHeroScrub to .hero-media. The video uses 100% dimensions and object-fit: cover; it has no independent transform. Its wrapper owns scale, progressive radius, and overflow: hidden clipping. During the first 30% of zoom-out it also translates downward just enough to expose the rounded top corners below the fixed header. The clearance is measured on resize; no layout dimensions are animated.

During the same scroll interval, the frame pulls back and Personal Projects rises over it. Hero text, portrait, social links, and navigation stay visible: there is no scroll-driven opacity fade or disabling of hero controls. Foreground stacking naturally hides the hero as the content covers it.

The desktop/tablet 200dvh runway pins a 100dvh hero. The foreground has a -100dvh margin, so it starts at the viewport bottom and rises immediately with scrolling. Over one viewport of scroll the frame scales from 1 to 0.90 with a 40px radius, while the foreground moves from the bottom to the top. Once covered, normal scrolling continues.

Mobile keeps the portrait and social links above the copy, and uses one page scroll without a nested hero scroller. The video alone is sticky. The long intro remains readable in natural flow, followed by a viewport spacer overlapped by the foreground. Frame shrinking starts exactly when that foreground reaches the viewport edge, so both effects progress together. The mobile frame finishes at scale 0.94 with a 24px radius.

Native sticky positioning handles pinning. A passive scroll listener schedules at most one requestAnimationFrame, updating only frame transform and border radius. No scroll-driven React state, fixed-duration animation, or continuously running RAF loop is used. Stopping freezes progress; reversing retraces it. Width, height, top, margin, and padding are not animated. Cleanup removes listeners, ResizeObserver, pending RAF, and frame styles; will-change is used only during the transition.

Reduced motion resets the frame and removes pinning and overlap, giving normal document flow. The existing video download policies and poster remain intact. Video pauses when fully covered or when the page is hidden, and resumes when exposed unless manually paused.

Validation: npm.cmd run build includes TypeScript; no lint script is configured. node .audit-tools/check-cinematic-hero.mjs verifies coordinated cover geometry, constant hero opacity, frame interpolation, reverse and stop behavior, unchanged layout dimensions, no footage transform, overflow, reduced motion, resize, playback, no-JavaScript fallback, and constrained-network policies across five viewport sizes. node .audit-tools/check-demo-navigation.mjs checks project filtering and demo links at 320px and 1440px. Screenshots are saved under audits/inset-hero-*.png.

Run locally with npm.cmd run dev. These checks do not establish a Lighthouse score or guarantee 60fps on every device.
