This draft preserves the monochrome portrait and Futura typography, adds reversible scroll-driven content exits and independent 3D letter motion, restores package/demo CTAs, and activates the existing live demo category before navigation.

Validation uses a separate Ubuntu/Node 20 workflow with `npm ci`, the existing static production build, TypeScript checks, promotion tests, exported asset checks, and Chromium browser tests. It has read-only repository permissions and never deploys. Linux results are pending the first feature-branch run; no passing result is claimed yet.

The browser suite checks six responsive widths, reverse scrolling, original frame and section transitions, reduced motion, sticky-header clearance, keyboard package navigation, demo activation, contact success/failure/retry, and dental demo routing/data/booking. It saves desktop/mobile screenshots and reports as Actions artifacts.

Security review: targeted compatible updates reduce inherited audit findings from 12 to 7, with zero production dependency findings in the executed lockfile audit. Remaining development-only Tailwind dependency chains involve braces and postcss-selector-parser; see [security review](design/cinematic-security-review.md). These need explicit release review rather than forced major upgrades.

Outstanding: obtain and inspect Linux build/browser results; attach current screenshot evidence; review remaining development dependency exceptions. Keep this PR in draft.

Rollback reference: [`v1-pre-cinematic-redesign`](https://github.com/dhomhafiz/dhomhafiz.dev/tree/v1-pre-cinematic-redesign), also preserved as `archive/pre-cinematic-redesign` at `7e7e878e53341f0111fac53552d44bbc90bd8c6a`. Existing production deployment workflow, Pages settings, DNS, main, and backup references are unchanged. No merge or deployment is authorized.
