import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const origin = 'https://dhomhafiz.dev';
const imageAlt = fs.readFileSync('src/app/opengraph-image.alt.txt', 'utf8').trim();
const pages = [
  { path: '/', title: 'I Build Fast Landing Pages | Mohd Hafiz, Kuala Lumpur', description: 'I build fast landing pages for businesses. Mohd Hafiz, a webdesigner in Kuala Lumpur, Malaysia, focused on responsive design and easy WhatsApp enquiries.' },
  { path: '/demo-dental/', title: 'Still Dental | Dental Website Demo by Mohd Hafiz', description: 'Explore Still Dental, a fictional dental clinic website demo by Mohd Hafiz. Preview responsive design, sample treatments, pricing and appointment booking.' },
];
for (const entry of pages) test(`SEO metadata for ${entry.path}`, async ({ page, request }) => {
  const response = await page.goto(entry.path);
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle(entry.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.description);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin + entry.path);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', entry.title);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', entry.description);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', origin + entry.path);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_MY');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', entry.title);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', entry.description);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', imageAlt);
  const image = new URL(await page.locator('meta[property="og:image"]').getAttribute('content'));
  expect(image.origin).toBe(origin);
  expect(image.pathname).toBe('/opengraph-image.jpg');
  expect((await request.get(image.pathname)).ok()).toBe(true);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.locator('meta[name="keywords"]').getAttribute('content')).not.toMatch(/Java Spring|AI Developer/);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
});
test('robots and sitemap use public canonical URLs', async ({ request }) => {
  const robots = await request.get('/robots.txt'); expect(robots.ok()).toBe(true);
  const text = await robots.text(); expect(text).toContain('User-Agent: *'); expect(text).toContain('Allow: /'); expect(text).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const sitemap = await request.get('/sitemap.xml'); expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  const homepage = await request.get('/');
  const projectSlugs = [...(await homepage.text()).matchAll(/data-project-slug="([^"]+)"/g)].map(match => match[1]);
  expect(projectSlugs.length).toBeGreaterThan(0);
  expect([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])).toEqual([
    ...pages.map(p => origin + p.path),
    ...projectSlugs.map(slug => `${origin}/work/${slug}/`),
  ]);
  expect(xml).not.toContain('127.0.0.1');
  expect(xml).not.toContain('#');
});
