import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('out');
const required = ['index.html', 'index.txt', 'demo-dental/index.html', 'demo-dental/index.txt', '404.html', 'sitemap.xml', 'images/hafiz-cinematic-1122.webp'];
if (process.platform === 'linux') required.push('demo-dental/__next.demo-dental.__PAGE__.txt');
for (const file of required) assert(fs.statSync(path.join(root, file)).size > 0, `Missing/empty export: ${file}`);
let assets = 0;
for (const file of ['index.html', 'demo-dental/index.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"<>]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (!value.startsWith('/_next/') && !value.startsWith('/images/')) continue;
    const pathname = decodeURIComponent(new URL(value, 'http://localhost').pathname);
    assert(fs.statSync(path.join(root, pathname.slice(1))).size > 0, `Missing HTML asset: ${pathname}`);
    assets++;
  }
}
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/static-export.json', JSON.stringify({ platform: process.platform, node: process.version, required, checkedHtmlAssets: assets }, null, 2));
console.log(`Verified ${required.length} export files and ${assets} HTML assets on ${process.platform}/${process.version}.`);
