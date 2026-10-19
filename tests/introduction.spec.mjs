import { test, expect } from '@playwright/test';

for (const width of [320, 390, 768, 1440, 1920]) test(`restored header, introduction and navigation at ${width}`, async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.editorial-header')).toBeVisible();
  await expect(page.locator('.editorial-brand img')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('I am Mohd Hafiz, a webdesigner based in Kuala Lumpur.');
  await expect(page.locator('.intro-label')).toContainText('Independent webdesigner');
  await expect(page.locator('.intro-label')).toContainText('Kuala Lumpur, MY');
  await expect(page.locator('.hero-bottom-bar, .hero-display-name, .water-text')).toHaveCount(0);
  if (width <= 700) await expect(page.locator('.hero-scroll-arrow')).not.toBeVisible();
  else await expect(page.locator('.hero-scroll-arrow')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect.poll(() => page.locator('video').evaluate(el => el.currentTime)).toBeGreaterThan(0);
  await page.screenshot({ path: `artifacts/restored-header-${width}.png` });
  await page.locator('.editorial-header nav a[href="#works"]').click();
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('.editorial-header')).toBeInViewport();
  await page.locator('.editorial-header nav a[href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact .hire-button')).toHaveAttribute('href', /^https:\/\/wa.me\/60197860823\?text=/);
  expect(errors).toEqual([]);
});
test('reduced motion keeps a poster and failed media has a fallback',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');expect(await page.locator('video').getAttribute('src')).toBeNull();
 await page.emulateMedia({reducedMotion:'no-preference'});await page.route('**/*.mp4',r=>r.abort());await page.reload();await expect(page.locator('.hero-video-fallback')).toBeVisible();
});
test('blocked autoplay keeps the poster without controls',async({page})=>{
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'))}});
 await page.goto('/');await expect(page.getByRole('status')).toContainText('Autoplay unavailable');await expect(page.locator('.hero-video button')).toHaveCount(0);expect(await page.locator('video').evaluate(v=>v.controls)).toBe(false);
});
