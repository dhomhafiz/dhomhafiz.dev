import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) test('procedural hero avoids legacy media and retains script caching at ' + width, async ({ page, request }) => {
  const media = [];
  page.on('request', request => {
    if (/workspace-.*\.(mp4|webp)/.test(request.url())) media.push(request.url());
  });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await expect(page.locator('.route-surface')).toBeVisible();
  await expect(page.locator('.immersive-hero video')).toHaveCount(0);
  expect(media).toEqual([]);
  const script = await page.locator('script[src]').first().getAttribute('src');
  expect((await request.get(script)).headers()['cache-control']).toBe('public, max-age=31536000, immutable');
});

test('Save-Data defers optional 3D without fetching footage or mounting WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', {
    value: Object.assign(new EventTarget(), { saveData: true, effectiveType: '4g' }), configurable: true,
  }));
  const requests = [];
  page.on('request', r => { if (r.url().endsWith('.mp4')) requests.push(r.url()); });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('.route-fallback')).toBeVisible();
  await expect(page.locator('.immersive-hero canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Load 3D scene' })).toBeVisible();
  expect(requests).toEqual([]);
});
