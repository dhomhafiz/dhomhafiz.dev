# Cinematic dependency security review

Reviewed 10 October 2026. The inherited audit listed 12 affected packages, including transitive parents; these are not 12 distinct root-cause vulnerabilities. The original manifests and lockfile are recoverable from `v1-pre-cinematic-redesign`.

| Package | Original locked version | Relation | Exposure in this application | Decision |
|---|---|---|---|---|
| next | 16.3.6 | Direct dependency | Build tool on Pages; self-hosted cache, dynamic metadata, image optimizer, Draft Mode and dev MCP advisory paths are not served by GitHub Pages | Pin patched 16.3.8; resolves the six reported Next advisories without a minor/major migration |
| sharp | 0.35.4 | Next optional transitive | Build/image encoding; no live upload or image-optimization endpoint on static Pages | Allowed-range patch 0.35.5 fixes librsvg advisory |
| source-map-js | 1.2.1 | PostCSS transitive, dependency tree | Source-map processing in build tooling; Pages does not parse submitted maps | Allowed-range patch 1.2.2 |
| compression | 1.8.1 | serve transitive, dev | Local static preview HTTP server only; not the Pages hosting service | Patch override 1.8.2 because serve pins 1.8.1 exactly |
| serve | 14.2.6 | Direct dev dependency | Local/CI preview only | Inherited compression-chain finding resolves via patch override; no forced downgrade |
| braces | 3.0.3 | Transitive dev | Glob parser in build/watch tooling; deeply nested malicious patterns can exhaust the build worker | No patched 3.x available in registry at review time; exception pending upstream/major tooling review |
| micromatch | 4.0.8 | Transitive dev | Inherits braces finding through glob parsing | Remains; no compatible patched braces version |
| fast-glob | 3.3.3 | Transitive dev | Inherits braces/micromatch chain during build file discovery | Remains; no browser/server runtime exposure on Pages |
| chokidar | 3.6.0 | Transitive dev | File watcher/glob dependency chain | Remains; not running on static production host |
| tailwindcss | 3.4.19 | Direct dev dependency | Build-time class discovery and CSS generation | Remains through glob/parser dependencies; audit proposes Tailwind 4 migration, outside this targeted release |
| postcss-selector-parser | 6.1.4 | Transitive dev | CSS parser; attacker-controlled long selectors can exhaust CPU | Fix is 7.1.6, outside Tailwind's ^6 range; no untested major override |
| postcss-nested | 6.2.0 | Transitive dev | Inherits selector-parser finding while compiling CSS | Remains with Tailwind 3-compatible parser chain |

Current exact-lockfile audit: **7 affected packages: 5 high, 2 moderate; production-only audit: 0 findings**. The seven findings reduce to two root-cause advisories and their parent chains. Production-only audit excludes devDependencies; zero does not prove the whole build environment risk-free.

Remaining advisories:

- [braces stack-exhaustion DoS](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): build/watch pattern processing can be abused if untrusted inputs reach the parser. No network-facing pattern parser exists in this static website. A malicious PR can still exhaust a CI worker.
- [selector-parser CPU exhaustion](https://github.com/advisories/GHSA-rj75-hqrm-r3gf): the advisory distinguishes attacker-supplied selectors processed in a request path from ordinary build-time trusted CSS. This project only compiles checked-in CSS. Untrusted PR content remains untrusted build input.

The Actions job uses a read-only token, no persisted checkout credentials, no deployment credentials, test-only EmailJS identifiers, an isolated hosted runner and a 20-minute timeout. These controls limit CI exposure; they do not fix the vulnerable parsers. Exceptions require review before merging. A future Tailwind/toolchain update should remove them when compatible fixes are available.

`node scripts/check-security-audit.mjs` captures full and production-only npm audit reports as CI artifacts. It rejects production findings, unexpected affected packages, non-dev exposure, critical findings or newly reported advisory IDs. It explicitly permits only the above reviewed dev-only chains and reports their counts. It does not hide audit output or claim zero full-tree findings.

Fix references: [Next cache advisory and patched range](https://github.com/advisories/GHSA-4jqv-mc3x-m676), [sharp/librsvg](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), [compression](https://github.com/advisories/GHSA-vc2v-76pw-4v95).

No `npm audit fix --force`, dependency major migration, production setting change or deployment was performed. Patch rebuilds and browser validation results are recorded in the validation-only GitHub Actions run and draft PR.
