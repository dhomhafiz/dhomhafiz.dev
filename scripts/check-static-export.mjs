import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

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
// File-based App Router metadata must match the exported sharing asset.
const imagePath = path.join(root, 'opengraph-image.jpg');
const image = await sharp(imagePath).metadata();
const imageBytes = fs.readFileSync(imagePath);
assert.deepEqual(imageBytes, fs.readFileSync('src/app/opengraph-image.jpg'), 'Exported sharing image differs from source');
assert(image.format === 'jpeg' && image.width === 1200 && image.height === 630 && image.space === 'srgb' && image.hasProfile, 'Invalid Open Graph image format/dimensions/profile');
assert(imageBytes.length < 300_000, 'Open Graph image exceeds 300 KB');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const metadata = new Map();
for (const [tag] of homepage.matchAll(/<meta\b[^>]*>/g)) {
  const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
  const key = attrs.property ?? attrs.name;
  if (!key) continue;
  if (key.startsWith('og:') || key.startsWith('twitter:')) assert(!metadata.has(key), `Duplicate metadata: ${key}`);
  metadata.set(key, attrs.content);
}
const ogUrl = new URL(metadata.get('og:image'));
assert(ogUrl.origin === 'https://dhomhafiz.dev' && ogUrl.pathname === '/opengraph-image.jpg', 'Wrong sharing image URL');
assert.equal(metadata.get('twitter:image'), metadata.get('og:image'));
assert.equal(metadata.get('og:image:type'), 'image/jpeg');
assert.equal(metadata.get('og:image:width'), '1200');
assert.equal(metadata.get('og:image:height'), '630');
assert.equal(metadata.get('og:image:alt'), fs.readFileSync('src/app/opengraph-image.alt.txt', 'utf8').trim());
assert.equal(metadata.get('twitter:card'), 'summary_large_image');
for (const key of ['og:title', 'og:description', 'twitter:title', 'twitter:description']) assert(metadata.get(key), `Missing ${key}`);
assert.match(homepage, /<link\b[^>]*rel="canonical"[^>]*href="https:\/\/dhomhafiz\.dev\/"/);
fs.writeFileSync('artifacts/opengraph.json', JSON.stringify({ url: ogUrl.href, width: image.width, height: image.height, bytes: imageBytes.length, format: image.format, colorSpace: image.space, embeddedProfile: image.hasProfile, twitterImage: metadata.get('twitter:image') }, null, 2));
console.log(`Verified Open Graph/Twitter metadata and 1200x630 sRGB JPEG (${imageBytes.length} bytes).`);
fs.writeFileSync('artifacts/static-export.json', JSON.stringify({ platform: process.platform, node: process.version, required, checkedHtmlAssets: assets }, null, 2));
console.log(`Verified ${required.length} export files and ${assets} HTML assets on ${process.platform}/${process.version}.`);
