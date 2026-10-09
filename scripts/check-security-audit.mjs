import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

fs.mkdirSync('artifacts', { recursive: true });
const reviewed = new Set(['braces', 'chokidar', 'fast-glob', 'micromatch', 'tailwindcss', 'postcss-nested', 'postcss-selector-parser']);
const advisoryUrls = new Set([
  'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  'https://github.com/advisories/GHSA-rj75-hqrm-r3gf',
]);
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
for (const productionOnly of [false, true]) {
  const args = ['audit', '--package-lock-only', '--json', ...(productionOnly ? ['--omit=dev'] : [])];
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { encoding: 'utf8', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  assert(result.status === 0 || result.status === 1, result.stderr || 'npm audit failed');
  const audit = JSON.parse(result.stdout);
  assert(!audit.error, JSON.stringify(audit.error));
  fs.writeFileSync(`artifacts/audit-${productionOnly ? 'production' : 'all'}.json`, JSON.stringify(audit, null, 2));
  for (const [name, finding] of Object.entries(audit.vulnerabilities ?? {})) {
    assert(!productionOnly, `Production dependency advisory: ${name}`);
    assert(reviewed.has(name), `Unreviewed vulnerable package: ${name}`);
    assert(finding.severity !== 'critical', `Critical finding: ${name}`);
    assert(finding.nodes.every(node => lock.packages[node]?.dev), `Non-development exposure: ${name}`);
    for (const via of finding.via) if (typeof via === 'object') assert(advisoryUrls.has(via.url), `Unreviewed advisory: ${via.url}`);
  }
  console.log(`${productionOnly ? 'Production' : 'All'} dependency audit: ${JSON.stringify(audit.metadata.vulnerabilities)}`);
}
console.log('Known development-only exceptions are documented in design/cinematic-security-review.md; this is not a zero-vulnerability assertion.');
