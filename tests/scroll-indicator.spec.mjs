import { test, expect } from '@playwright/test';
import { openScene } from './helpers/route-camera.mjs';

const cue = page => page.locator('.hero-scroll-indicator');
async function checkSpacing(page) {
  const bounds = await cue(page).boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(24);
  expect(bounds.y).toBeGreaterThan(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(await page.evaluate(() => innerWidth - 24));
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight - 24));
  for (const selector of ['.editorial-hero-copy', '.editorial-brand', '.editorial-header nav', '.route-pause']) {
    if (!await page.locator(selector).count()) continue;
    const other = await page.locator(selector).boundingBox();
    if (other) expect(bounds.x >= other.x + other.width || other.x >= bounds.x + bounds.width ||
      bounds.y >= other.y + other.height || other.y >= bounds.y + bounds.height, selector).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const [width, height] of [[1440, 1000], [1024, 600], [768, 1024], [390, 844], [320, 568], [700, 390]]) {
  test(`scroll cue fits the Hero at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    // Layout must also work when the optional GPU scene is unavailable.
    await page.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 }));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(cue(page)).toHaveCSS('opacity', '1');
    await expect(cue(page)).toHaveCSS('pointer-events', 'none');
    await expect(cue(page)).toHaveAttribute('aria-hidden', 'true');
    await expect(cue(page).locator('span')).toHaveText('Scroll to explore');
    const icon = width <= 700 ? '.hero-scroll-swipe' : '.hero-scroll-mouse';
    await expect(cue(page).locator(icon)).toBeVisible();
    await expect(cue(page).locator(width <= 700 ? '.hero-scroll-mouse' : '.hero-scroll-swipe')).toBeHidden();
    await checkSpacing(page);
    const animation = cue(page).locator(width <= 700 ? '.hero-scroll-gesture' : '.hero-scroll-wheel');
    await expect(animation).toHaveCSS('animation-duration', '1.7s');
    const movement = await animation.evaluate(element => {
      const animation = element.getAnimations()[0];
      animation.pause();
      animation.currentTime = 300;
      const start = new DOMMatrix(getComputedStyle(element).transform).m42;
      animation.currentTime = 1000;
      const end = new DOMMatrix(getComputedStyle(element).transform).m42;
      return end - start;
    });
    expect(width <= 700 ? movement < 0 : movement > 0).toBe(true);
    await page.screenshot({ path: `artifacts/scroll-indicator/${width}x${height}.png` });
  });
}

test('the existing journey fades the cue and restores it on reverse travel', async ({ page }) => {
  await openScene(page);
  await expect(cue(page)).toHaveCSS('opacity', '1');
  await checkSpacing(page);
  await page.screenshot({ path: 'artifacts/scroll-indicator/desktop-scene.png' });
  const seek = progress => page.evaluate(progress => {
    const track = document.querySelector('.route-journey');
    const hero = track.querySelector('.immersive-hero');
    scrollTo({ top: scrollY + track.getBoundingClientRect().top + (track.offsetHeight - hero.offsetHeight) * progress, behavior: 'instant' });
  }, progress);
  await seek(.04);
  await expect.poll(() => cue(page).evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0);
  await expect.poll(() => cue(page).evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(1);
  await seek(.3);
  await expect(cue(page)).toHaveCSS('opacity', '0');
  await expect(cue(page)).toHaveJSProperty('inert', true);
  await expect(cue(page).locator('.hero-scroll-wheel')).toHaveCSS('animation-play-state', 'paused');
  await seek(0);
  await expect(cue(page)).toHaveCSS('opacity', '1');
  await expect(cue(page)).toHaveJSProperty('inert', false);
  await expect(cue(page).locator('.hero-scroll-wheel')).toHaveCSS('animation-play-state', 'running');
  const bounds = await cue(page).boundingBox();
  await page.mouse.move(bounds.x + 12, bounds.y + 12);
  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

for (const width of [390, 1440]) {
  test(`reduced motion keeps a static cue at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(cue(page)).toHaveCSS('opacity', '1');
    const icon = cue(page).locator(width <= 700 ? '.hero-scroll-gesture' : '.hero-scroll-wheel');
    await expect(icon).toHaveCSS('animation-name', 'none');
    await expect(icon).toHaveCSS('transform', 'none');
    await checkSpacing(page);
    await page.screenshot({ path: `artifacts/scroll-indicator/reduced-${width}.png` });
    await page.evaluate(() => scrollTo({ top: innerHeight, behavior: 'instant' }));
    await expect(cue(page)).not.toBeInViewport();
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(cue(page)).toBeInViewport();
  });
}

test.describe('mobile gestures', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('swiping over the cue scrolls naturally and returning restores it', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });
    await page.goto('/');
    await expect(cue(page).locator('.hero-scroll-swipe')).toBeVisible();
    await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
    const bounds = await cue(page).boundingBox();
    const client = await page.context().newCDPSession(page);
    const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 30 }] });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    // A touch stops native inertia before returning to the opening viewport.
    await page.touchscreen.tap(200, 300);
    await page.evaluate(() => scrollTo({ top: innerHeight * 2, behavior: 'instant' }));
    await expect(cue(page)).toHaveCSS('opacity', '0');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(cue(page)).toBeInViewport();
    await expect(cue(page)).toHaveCSS('opacity', '1');
  });
});
