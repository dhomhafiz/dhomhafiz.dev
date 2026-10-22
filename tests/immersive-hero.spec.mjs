import { test, expect } from '@playwright/test';

async function capableDesktop(page, memory = 8) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(memory => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => memory });
  }, memory);
}

test('real WebGL scene, pointer response, pause, scroll, and context-loss fallback', async ({ page }) => {
  await capableDesktop(page);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const surface = page.locator('.route-surface');
  await expect(surface).toHaveAttribute('data-scene', 'ready');
  const canvas = surface.locator('canvas');
  expect(await canvas.evaluate(el => !!el.getContext('webgl2'))).toBe(true);
  // Wait for the opening reveal before comparing pointer-driven frames.
  await page.waitForTimeout(4200);
  const box = await canvas.boundingBox();
  // Crop only the road: animated clouds cannot make this pointer assertion pass.
  const road = { x: box.x + box.width * .45, y: box.y + box.height * .86, width: box.width * .15, height: box.height * .04 };
  await page.mouse.move(100, 180);
  await page.waitForTimeout(1500);
  const left = await page.screenshot({ clip: road });
  await page.mouse.move(1300, 180);
  await page.waitForTimeout(1500);
  const right = await page.screenshot({ clip: road });
  expect(left.equals(right)).toBe(false);
  await page.getByRole('button', { name: 'Pause scene', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume scene', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const paused = await canvas.screenshot();
  await page.mouse.move(500, 100);
  await page.waitForTimeout(300);
  expect(paused.equals(await canvas.screenshot())).toBe(true);
  await page.getByRole('button', { name: 'Resume scene', exact: true }).click();
  await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(300);
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }))
    .toHaveAttribute('aria-current', 'location');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await canvas.evaluate(el => el.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(surface).toHaveAttribute('data-scene', 'fallback');
  await expect(canvas).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('I AM HAFIZ.');
  expect(errors).toEqual([]);
});

for (const scenario of ['reduced motion', 'low power', 'no WebGL']) {
  test(`${scenario}: lightweight fallback keeps content and direct navigation`, async ({ page }) => {
    await capableDesktop(page, scenario === 'low power' ? 2 : 8);
    if (scenario === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (scenario === 'no WebGL') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
    await page.goto('/');
    await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL(/#works$/);
    await expect(page.locator('#works')).toBeInViewport();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact')).toBeInViewport();
    await expect(page.locator('.route-surface canvas')).toHaveCount(0);
  });
}

test('mobile and no-JavaScript paths retain a readable hero without horizontal overflow', async ({ browser }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled, baseURL: test.info().project.use.baseURL });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
    if (javaScriptEnabled) await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
    await expect(page.locator('canvas')).toHaveCount(javaScriptEnabled ? 1 : 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  }
});

test('live motion preference removes the enhancement and retains keyboard links', async ({ page }) => {
  await capableDesktop(page);
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  const works = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true });
  await works.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#works$/);
});
