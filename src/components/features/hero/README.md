# Cinematic hero

HeroBackdrop owns the existing useHeroScrub frame and composes HeroPortrait inside it. HeroCopy owns content, offer, links and socials. The static portrait replaces all hero playback logic. Other video components remain available.

Motion is unchanged: desktop/tablet scale 1 → .90, radius 0 → 40px; mobile scale 1 → .94, radius 0 → 24px. Clearance develops over the first 30% of progress. Scroll reverses exactly. SectionTransition retains .96/.98 scale and 32/20px radius. Existing 800ms entrance reveal and hover timings remain intact. Reduced motion removes pinning and transforms.

Desktop keeps the full portrait beside the copy, with header clearance. Tablet narrows the copy and positions the portrait to the right. Mobile reserves 360px below the header for the face and arms; copy flows below it. The existing mobile one-page scroll and cover sequence remain.

Three WebP sources preserve image proportions, without editing the face: 560, 840, 1122px. Explicit dimensions, eager loading, high fetch priority and responsive sizes support static export without an image service.

Fonts use next/font/local: OFL-licensed Barlow Condensed 600/800 and Space Grotesk for readable paragraphs. Futura can replace the centralized display font when licensed files are supplied.
