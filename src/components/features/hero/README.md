# Cinematic hero

HeroBackdrop owns the existing useHeroScrub frame and composes HeroPortrait inside it. HeroCopy owns content, offer, links and socials. The static portrait replaces all hero playback logic. Other video components remain available.

Motion is unchanged: desktop/tablet scale 1 → .90, radius 0 → 40px; mobile scale 1 → .94, radius 0 → 24px. Clearance develops over the first 30% of progress. Scroll reverses exactly. SectionTransition retains .96/.98 scale and 32/20px radius. Existing 800ms entrance reveal and hover timings remain intact. Reduced motion removes pinning and transforms.

Desktop keeps the full portrait beside the copy, with header clearance. Tablet narrows the copy and positions the portrait to the right. Mobile reserves 360px below the header for the face and arms; copy flows below it. The existing mobile one-page scroll and cover sequence remain.

Three WebP sources preserve image proportions, without editing the face: 560, 840, 1122px. Explicit dimensions, eager loading, high fetch priority and responsive sizes support static export without an image service.

Fonts use next/font/local: OFL-licensed Barlow Condensed 600/800 and Space Grotesk for readable paragraphs. Futura can replace the centralized display font when licensed files are supplied.

## Scroll-driven content exit

`src/lib/heroContentExit.ts` defines independent progress windows for socials (.15–.34), primary CTA (.17–.43), secondary CTA (.19–.46), description (.21–.52), subtitle (.25–.58), and heading (.15–.90). Heading movement begins after the stable opening while its parent fade starts at .65. Smoothstep interpolation reverses deterministically with the existing `useHeroScrub` progress; no additional listeners, timers, animation dependencies, or React updates per frame.

Desktop heading ends at .93 scale and -32px translation. Tablet translation is 75%; mobile translation is 50% with heading scale approximately .97. The original frame and mobile overlay transformations remain unchanged. Exit begins only when the next section starts covering the hero, preserving the mobile reading interval. Near-transparent elements become inert and ignore pointer input, then regain interactivity on reverse scroll. Reduced motion renders all exit elements at full opacity and no transform. Cleanup restores original inline properties and inert state.

Validation: production build, TypeScript, 78 pricing checks, sampled forward/reverse content and frame geometry at 360/390/768/1024/1440/1920px; touch gesture at 390px; keyboard scrolling; reduced motion, both themes and no overflow. Hero package/demo navigation checks pass at 360/390/768/1024/1440px, including category activation, repeated navigation, target focus and header clearance. Intermediate desktop screenshots inspected. These browser checks do not measure frame rate on physical devices. No lint script is configured.

## Cinematic 3D letter tumble

`HeroHeading.tsx` keeps the original heading text in an unchanged layout layer, a complete screen-reader label, and nine aria-hidden visual glyphs. `heroLetterTumble.ts` owns deterministic per-letter configurations, scroll mapping, glyph positioning, and cleanup. `useHeroScrub` calls its measure/render lifecycle using the same progress and scheduler as the portrait frame; there are no new scroll listeners or dependencies.

The opening 0–15% is stable. Supporting content fades first. Individual letters detach from .24 plus deterministic stagger offsets, using 1100px perspective, mixed-axis rotations, opposing depth shifts, smoothstep lateral motion, and quadratic downward acceleration. Each letter fades between approximately .58 and .85. The original parent heading exit remains on a separate nested wrapper, and original portrait scale/radius calculations are unchanged.

Glyph positions are measured using DOM Ranges on the unchanged text after fonts load and during the existing resize measurement. This preserves kerning, letter spacing, line-height, wrapping, and section dimensions. No per-frame measurements or React updates. Normal text remains visible until glyph positions are ready and when JavaScript is disabled. Cleanup removes generated positions/transforms and restores the original content state.

Tablet movement is 70% and mobile movement 42% of desktop, with mobile rotation reduced to 55% of configured angles. Reduced motion exposes the original static text and hides the 3D layer. Invisible CTA/social links remain inert through the existing content exit utility. Heading accessibility tree exposes one complete heading rather than disconnected glyphs.

Executed: production build, TypeScript and 78 pricing checks passed. Chrome tested 0/.15/.30/.50/.70/.85/1 progress forward and backward at 360/390/768/1024/1440/1920px; verified nine unique trajectories, exact return to original glyph positions, stable layout height, both themes, no horizontal overflow, reduced motion, portrait scale/radius and later section transitions. Simulated small/large wheel deltas and touch swipe at 390px tested. CTA navigation/keyboard focus/repeated filter activation passed at 360/390/768/1024/1440px. Accessibility tree and JavaScript-disabled fallback passed. Intermediate 1440px screenshots visually inspected. No lint command is configured. Physical trackpad/device performance was not measured; one timing-sensitive section assertion failed during an initial run and the complete repeat passed.
