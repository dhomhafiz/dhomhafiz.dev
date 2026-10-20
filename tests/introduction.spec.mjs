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
  await expect(page.locator('.hero-scroll-arrow')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.route-surface')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore Selected Works' })).toBeVisible();
  await page.screenshot({ path: `artifacts/restored-header-${width}.png` });
  await page.locator('.editorial-header nav a[href="#works"]').click();
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('.editorial-header')).toBeInViewport();
  await page.locator('.editorial-header nav a[href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact .hire-button')).toHaveAttribute('href', /^https:\/\/wa.me\/60197860823\?text=/);
  expect(errors).toEqual([]);
});
// Reduced motion and renderer failures are covered by immersive-hero.spec.mjs.
