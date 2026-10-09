## Changes

Replace the hero video with the supplied monochrome portrait and preserve the existing scroll-driven frame zoom, rounded corners, layouts and navigation. Add reversible staggered hero content exits and independent 3D letter trajectories using the existing scroll progress/RAF, with reduced-motion support and inactive invisible controls.

Restore **Find my website package** and **See a live demo** CTAs. Reuse the existing packages section and live demo category, including category activation, sticky-header clearance and focus. Remove the requested eyebrow and hosting banner; update its obsolete test expectation and preserve contact functionality. Typography uses the originally authorized licensed Barlow Condensed fallback; licensed Futura files are still pending.

## Linux validation

Both [feature push](https://github.com/dhomhafiz/dhomhafiz.dev/actions/runs/37982085162) and [PR validation](https://github.com/dhomhafiz/dhomhafiz.dev/actions/runs/37982092442) passed for application/test commit `35db6d17663fea3a09e5336e2eeaabefe93586e3` on GitHub-hosted Ubuntu / **Node 20.20.2** / npm 10.8.2:

- Exact `npm ci`, existing `npm run build` static export to `out/`, and TypeScript checks passed.
- **78** existing promotion checks and **11** Chromium release tests passed.
- **8** required export files and **32** referenced HTML assets verified.
- `/demo-dental/` and both dental Next data files returned HTTP 200; client navigation, booking preview and back navigation passed.
- Six responsive widths, reverse scroll, original transitions, reduced motion, theme controls, keyboard CTA, demo activation, header clearance, contact success/failure/retry and no overflow passed. No unexpected browser console/runtime/HTTP errors were observed.

The first validation failure was an incorrect font-name assumption in a new test; corrected to verify the applied font actually loaded. No application workaround was needed. No standalone lint script is configured. Email requests were intercepted with test-only identifiers; real delivery was not exercised. Physical-device/Safari checks remain outside this Chromium validation.

The separate validation workflow has read-only token permissions, no production secrets or Pages permissions, and never invokes deployment. The production workflow is unchanged. Logs, audit JSON, screenshots and browser reports are in Actions artifacts; [detailed evidence](https://github.com/dhomhafiz/dhomhafiz.dev/blob/feature/cinematic-portfolio-redesign/design/cinematic-release-validation.md) is committed.

## Dependency review and outstanding issues

Compatible patches: Next **16.3.8**, sharp **0.35.5**, source-map-js **1.2.2**, compression **1.8.2**. Full-tree findings reduced **12 ? 7**; production-only audit has **0**. Remaining **5 high / 2 moderate** development findings are Tailwind's braces/selector-parser chains, with build-time DoS exposure to untrusted input rather than live static Pages request handlers. [Full package-by-package review](https://github.com/dhomhafiz/dhomhafiz.dev/blob/feature/cinematic-portfolio-redesign/design/cinematic-security-review.md). No forced upgrades were used.

**Keep draft:** review remaining development dependency exceptions and approve visual design before release. Automated Linux/static-export blockers are resolved; this is ready for review, not approved for deployment.

## Visual evidence

Settled initial hero screenshots from the successful Ubuntu export:

<img src="https://raw.githubusercontent.com/dhomhafiz/dhomhafiz.dev/feature/cinematic-portfolio-redesign/design/cinematic-hero-desktop.png" width="800" alt="Desktop cinematic hero at 1440px">

<img src="https://raw.githubusercontent.com/dhomhafiz/dhomhafiz.dev/feature/cinematic-portfolio-redesign/design/cinematic-hero-mobile.png" width="390" alt="Mobile cinematic hero at 390px">

## Preservation and rollback

Original production remains at `7e7e878e53341f0111fac53552d44bbc90bd8c6a`, preserved in [`v1-pre-cinematic-redesign`](https://github.com/dhomhafiz/dhomhafiz.dev/tree/v1-pre-cinematic-redesign) and `archive/pre-cinematic-redesign`. Rollback after an approved release uses a new reviewed revert PR, never a reset or force-push. Main, the production deployment workflow, Pages settings, custom domain, DNS and backup references are unchanged. **Do not merge or deploy without explicit approval.**
