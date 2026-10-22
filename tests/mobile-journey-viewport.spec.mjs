import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('mobile journey covers the changing viewport and survives forward/reverse navigation', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 430, height: 669 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
  await fs.mkdir('artifacts/milestone-6e1d', { recursive: true });

  try {
    await page.goto('/');
    await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
    await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
    await page.screenshot({ path: 'artifacts/milestone-6e1d/after-portrait-hero.png' });

    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const navGeometry = async () => page.evaluate(() => {
      const navElement = document.querySelector('.editorial-header nav');
      const navRect = navElement.getBoundingClientRect();
      const hero = document.querySelector('.immersive-hero');
      const track = document.querySelector('.route-journey');
      const heroRect = hero.getBoundingClientRect();
      return {
        viewportHeight: innerHeight,
        heroTop: heroRect.top,
        heroBottom: heroRect.bottom,
        heroHeight: heroRect.height,
        navBottom: navRect.bottom,
        navBottomGap: innerHeight - navRect.bottom,
        trackBackground: getComputedStyle(track).backgroundColor,
      };
    });
    const waitForStableScroll = async () => page.waitForFunction(() => new Promise(resolve => {
      let lastScrollY = scrollY;
      let stableFrames = 0;
      const check = () => {
        if (scrollY === lastScrollY) stableFrames += 1;
        else {
          lastScrollY = scrollY;
          stableFrames = 0;
        }
        if (stableFrames >= 8) resolve(true);
        else requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    }));
    const assertViewportCoverage = async height => {
      await expect.poll(async () => (await navGeometry()).heroHeight).toBeCloseTo(height, -1);
      const geometry = await navGeometry();
      expect(geometry.heroTop, `hero starts below viewport: ${JSON.stringify(geometry)}`).toBeLessThanOrEqual(1);
      expect(geometry.heroBottom, `hero ends above viewport: ${JSON.stringify(geometry)}`).toBeGreaterThanOrEqual(height - 1);
      expect(geometry.navBottom).toBeLessThanOrEqual(height);
      expect(geometry.navBottomGap).toBeGreaterThanOrEqual(8);
      expect(geometry.trackBackground).toBe('rgb(8, 14, 23)');
    };
    await assertViewportCoverage(669);

    await nav.getByRole('link', { name: 'Projects', exact: true }).click();
    await waitForStableScroll();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
    await assertViewportCoverage(669);
    await page.screenshot({ path: 'artifacts/milestone-6e1d/after-portrait-dental.png' });

    const progress = async () => page.evaluate(() => {
      const track = document.querySelector('.route-journey');
      const hero = document.querySelector('.immersive-hero');
      const trackTop = scrollY + track.getBoundingClientRect().top;
      return (scrollY - trackTop) / (hero.offsetHeight * 12);
    });
    const beforeResizeProgress = await progress();
    await page.setViewportSize({ width: 430, height: 600 });
    await assertViewportCoverage(600);
    await expect.poll(progress).toBeCloseTo(beforeResizeProgress, 1);
    await page.setViewportSize({ width: 430, height: 669 });
    await assertViewportCoverage(669);
    await expect.poll(progress).toBeCloseTo(beforeResizeProgress, 1);

    await page.getByRole('link', { name: 'Next project' }).click();
    await waitForStableScroll();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
    await assertViewportCoverage(669);
    await page.screenshot({ path: 'artifacts/milestone-6e1d/after-portrait-squid-game.png' });

    await nav.getByRole('link', { name: 'Projects', exact: true }).click();
    await waitForStableScroll();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
    await page.getByRole('button', { name: 'View All Projects' }).click();
    await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
    await page.getByRole('button', { name: 'Back to 3D Experience' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await nav.getByRole('link', { name: 'Contact', exact: true }).click();
    await waitForStableScroll();
    await expect(page.locator('#contact')).toHaveAttribute('data-route-contact', 'active');
    await assertViewportCoverage(669);
    await page.screenshot({ path: 'artifacts/milestone-6e1d/after-portrait-contact.png' });
    const contactProgress = await progress();
    await nav.getByRole('link', { name: 'Home', exact: true }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    expect(await progress()).toBeLessThan(contactProgress);

    await page.setViewportSize({ width: 844, height: 390 });
    await assertViewportCoverage(390);
    await page.screenshot({ path: 'artifacts/milestone-6e1d/after-landscape-hero.png' });
  } finally {
    await context.close();
  }
});

test('reduced-motion fallback remains viewport-sized without activating the journey', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 669 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  const heroHeight = await page.locator('.immersive-hero').evaluate(hero => hero.getBoundingClientRect().height);
  expect(heroHeight).toBeGreaterThanOrEqual(669);
  await expect(page.locator('.route-journey')).not.toHaveAttribute('data-journey', 'active');
});
