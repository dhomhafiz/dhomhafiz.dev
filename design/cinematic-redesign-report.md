# Cinematic portfolio redesign — delivery report

Branch: `feature/cinematic-portfolio-redesign`. No merge or deployment.

## Architecture and changes

Next.js App Router static export, React/TypeScript, Tailwind RGB tokens, server content provider, native scroll controllers. Existing projects, services, pricing promotions, FAQ, approach, contact, filters, theme toggle and dental demo remain. Shared colors and typography apply across the portfolio; the dental demo retains its independent brand palette.

Key files: `src/app/globals.css`, `src/app/layout.tsx`, `tailwind.config.js`, `src/config/portfolio.ts`, `src/config/theme.ts`, shared Button, PortfolioPage, hero components and portfolio types. HeroBackdrop now composes the static HeroPortrait; HeroCopy contains the social links. Obsolete hero playback hook and media configuration removed. General VideoPlayer retained.

Typography: locally loaded OFL Barlow Condensed 600/800; Space Grotesk paragraphs. Licenses included in `src/app/fonts`. No licensed Futura assets were present; this uses the brief's permitted fallback.

Portrait: source preserved, proportionally resized to 560/840/1122px WebP (12,276 / 25,250 / 44,240 bytes). Responsive sizes, explicit dimensions, eager high-priority loading. Desktop full portrait beside copy; tablet narrower copy and right-offset image; mobile face and crossed arms below compact header, then natural-flow copy. PNG is not shipped.

SOLID: composition preserves separate content, presentation and animation responsibilities; narrow Hero contract removes video dependencies. Shared configurable buttons retain native contracts. PortfolioProvider remains the data boundary. No new abstraction layer.

Performance: no hero video element or MP4 request; largest portrait 44 KB replaces an 871 KB video and prior portrait. Local fonts remove build-time Google Fonts dependency. Original hero and section controller source unchanged; timings and reduced-motion behavior retained. Metadata and structured data preserved. No measured portfolio LCP/CLS/INP claim.

## Executed validation

- `npm.cmd run build`: successful production static export, including TypeScript.
- `npm.cmd run typecheck`: pass.
- `npm.cmd test`: 78 promotion checks pass.
- Git diff whitespace check: pass.
- Headless Chrome custom redesign audit: 360, 390, 768, 1024, 1440, 1920px. Image loaded; hero video absent; no MP4 request; no horizontal overflow in either theme; valid hero CTA anchors; forward/reverse hero scale/radius and all four animated section scales; reduced motion; no runtime page errors. Screenshots manually inspected for mobile, tablet and desktop, then composition corrected and rechecked.
- Existing project filter audit: 320, 390, 1440px; keyboard/category filters, badges and theme overflow pass.
- Contact conversion audit adapted only for the new heading and settled scroll timing: 320, 390, 768, 1440px. All pricing selections, form alignment/focus, manual selection, mocked email payload, confirmation/reset and reduced-motion checks pass.
- Existing dental audit: 320, 390, 768, 1440px; pricing/calendar/booking confirmation pass. Its mobile Lighthouse result: performance 96, accessibility 100, best practices 100, SEO 100. This score applies to the dental demo, not the portfolio.

## Limitations

No lint command is configured. Initial baseline browser run could not launch Chrome within the sandbox; browser checks required elevated execution. Original animation formulas were inspected, retained byte-for-byte and checked against their numerical values, but a complete before/after visual baseline was unavailable. Contact email was mocked; no real message sent. Device lab performance, real INP and real network delivery remain unmeasured.

Build regenerates next-env.d.ts; its pre-existing development routes references are retained outside this commit. No credentials or unrelated generated reports are committed.
