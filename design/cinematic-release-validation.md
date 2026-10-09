# Cinematic release validation

Validation completed on GitHub-hosted Ubuntu with Node **20.20.2**, npm **10.8.2**, and the exact committed lockfile. Application/test commit: `35db6d17663fea3a09e5336e2eeaabefe93586e3`.

- [Feature push validation](https://github.com/dhomhafiz/dhomhafiz.dev/actions/runs/37982085162): success.
- [Draft PR validation](https://github.com/dhomhafiz/dhomhafiz.dev/actions/runs/37982092442): success.
- Workflow: `.github/workflows/validate-cinematic.yml`; separate from the unchanged production workflow. Read-only token; no Pages permissions, deployment credentials, production secrets, deployment jobs or custom-domain changes.

| Check | Actual result |
|---|---|
| `npm ci` | Passed on Ubuntu |
| `npm run build` | Passed, Next 16.3.8 production static export to existing `out/` |
| `npm run typecheck` | Passed |
| `npm test` | 78 promotion checks passed |
| Export verification | 8 required files and 32 referenced HTML assets present/nonempty |
| `npm run test:release` | 11 Chromium tests passed |
| Full lockfile security audit | 7 development findings: 5 high, 2 moderate; reviewed exceptions |
| Production-only lockfile audit | 0 findings |

Browser checks cover 360, 390, 768, 1024, 1440 and 1920px widths; forward/reverse scroll choreography; original hero scale/radius and section scales; loaded portrait and display font; reduced motion; actual theme controls; no horizontal overflow; keyboard package CTA, sticky-header clearance and focus; repeated demo category activation; package selection; mocked contact success, failure and retry; dental demo navigation, data requests, booking preview and browser back navigation. No unexpected console errors, page exceptions, or same-origin HTTP failures were observed in these tests. Responsive Chromium coverage does not substitute for physical-device/Safari testing.

`/demo-dental/`, `/demo-dental/index.txt` and `/demo-dental/__next.demo-dental.__PAGE__.txt` returned HTTP 200. The Linux export creates the required flattened Next data filename; no Windows filename workaround or production configuration change was introduced.

The obsolete local contact assertion now checks that the intentionally removed hosting banner is absent. The committed CI suite checks that same removal and exercises real contact form state with intercepted test-only EmailJS responses; no real emails were sent. No lint script or lint configuration exists in the project, so no standalone lint pass is claimed.

The first run failed only on a test that assumed the font compiler would use the family name `localFont`. Its actual production name is `display`. The corrected test checks that the applied display font is loaded. Subsequent feature and PR runs passed. Initial hero screenshots were inspected at desktop and mobile sizes and are preserved as [desktop](cinematic-hero-desktop.png) and [mobile](cinematic-hero-mobile.png). Logs, audit JSON and Playwright report are available in the linked Actions artifacts (14-day retention).

## Remaining review items

The [dependency review](cinematic-security-review.md) documents all 12 inherited affected packages and compatible patch fixes. Seven development-only findings remain in Tailwind 3's braces and selector-parser chains. Static Pages does not expose their parsers as request handlers, but untrusted build inputs can exhaust a CI worker. Review these exceptions before release; no forced major upgrade was applied.

Licensed Futura assets are not present. The project preserves the originally authorized OFL-licensed Barlow Condensed ExtraBold fallback and centralized local-font loading. Replacing it with licensed Futura remains a separate typography follow-up.

Assessment: Linux build/static-export and automated functional blockers are resolved. The redesign is ready for draft review, with development dependency exceptions and visual approval still outstanding. No merge or deployment is authorized.

## Production preservation and rollback

Remote `main` and `archive/pre-cinematic-redesign` remain at `7e7e878e53341f0111fac53552d44bbc90bd8c6a`. Annotated tag `v1-pre-cinematic-redesign` still peels to that commit. Production Pages remains workflow-based, sourced from main, with `dhomhafiz.dev` and HTTPS unchanged. Last production deployment remains [37673743292](https://github.com/dhomhafiz/dhomhafiz.dev/actions/runs/37673743292).

After an explicitly approved release, roll back through a new reviewed PR reverting the release merge (`git revert -m 1 <merge-commit>` for a merge commit; revert the actual squash/release commit if squashed). Validate that the recovered site matches the archived reference and use the existing production workflow only after approval. Do not reset or force-push shared history, move the archive references, change Pages settings, or change DNS.
