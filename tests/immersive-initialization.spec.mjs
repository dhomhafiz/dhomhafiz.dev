import { test, expect } from '@playwright/test';

async function instrument(page, holdGPU = false) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(hold => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    window.releaseGPU = !hold;
    window.fenceChecks = 0;
    window.completedFrame = false;
    window.frameCompletedAt = Infinity;
    window.prematureFrames = [];
    window.layoutShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.layoutShifts.push({
        value: entry.value, time: entry.startTime,
        sources: entry.sources.map(source => ({ tag: source.node?.tagName, className: source.node?.className })),
      });
    }).observe({ type: 'layout-shift', buffered: true });
    const original = WebGL2RenderingContext.prototype.clientWaitSync;
    WebGL2RenderingContext.prototype.clientWaitSync = function (...args) {
      window.fenceChecks++;
      if (!window.releaseGPU) return this.TIMEOUT_EXPIRED;
      const status = original.apply(this, args);
      if (status === this.ALREADY_SIGNALED || status === this.CONDITION_SATISFIED) {
        window.completedFrame = true;
        window.frameCompletedAt = performance.now();
      }
      return status;
    };
    function inspect() {
      const canvas = document.querySelector('.route-canvas');
      if (canvas && Number(getComputedStyle(canvas).opacity) > 0 && !window.completedFrame) {
        window.prematureFrames.push(performance.now());
      }
      requestAnimationFrame(inspect);
    }
    requestAnimationFrame(inspect);
  }, holdGPU);
}

test('a delayed GPU frame keeps the complete poster visible and HTML navigation usable', async ({ page }) => {
  await instrument(page, true);
  await page.goto('/');
  await page.waitForFunction(() => window.fenceChecks > 0);
  const surface = page.locator('.route-surface');
  await expect(surface).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await expect(page.locator('.route-canvas')).not.toHaveAttribute('data-initialized');
  expect(await page.locator('.route-fallback img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.route-fallback-road, .route-fallback i')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Preparing scene…');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const heading = await page.locator('h1').boundingBox();
  await page.screenshot({ path: 'artifacts/initialization-fix/after-loading.png' });
  await page.getByRole('link', { name: 'Explore Selected Works' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('#works')).toBeInViewport();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact' }).click();
  await expect(page.locator('#contact')).toBeInViewport();
  await page.locator('.editorial-brand').click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.evaluate(() => { window.releaseGPU = true; });
  await expect(surface).toHaveAttribute('data-scene', 'ready');
  await expect(page.locator('.route-canvas')).toHaveAttribute('data-initialized', 'true');
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '1');
  expect(await page.locator('h1').boundingBox()).toEqual(heading);
  expect(await page.evaluate(() => window.prematureFrames)).toEqual([]);
  await page.screenshot({ path: 'artifacts/initialization-fix/after-revealed.png' });
});

test('cold throttled load and repeated warm/cold hard reloads reveal only completed frames', async ({ page }) => {
  test.setTimeout(90_000);
  await instrument(page);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 100000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  for (const [index, cold] of [true, false, false, true].entries()) {
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: cold });
    if (index === 0) await page.goto('/');
    else await Promise.all([page.waitForEvent('load'), cdp.send('Page.reload', { ignoreCache: cold })]);
    await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 30_000 });
    await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => ({ completed: window.completedFrame, premature: window.prematureFrames }))).toEqual({ completed: true, premature: [] });
    // The baseline has a small earlier font swap. Assert the reveal adds no shift.
    expect(await page.evaluate(() => window.layoutShifts.filter(entry => entry.time >= window.frameCompletedAt)
      .reduce((total, entry) => total + entry.value, 0))).toBe(0);
    await page.screenshot({ path: `artifacts/initialization-fix/reload-${index}-${cold ? 'cold' : 'warm'}.png` });
  }
  expect(errors).toEqual([]);
});

test('failed initialization keeps the poster and content available', async ({ page }) => {
  await instrument(page);
  await page.addInitScript(() => {
    WebGL2RenderingContext.prototype.clientWaitSync = function () {
      window.fenceChecks++;
      return this.WAIT_FAILED;
    };
  });
  await page.goto('/');
  await page.waitForFunction(() => window.fenceChecks > 0);
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('.route-canvas')).toHaveCount(0);
  await expect(page.locator('.route-fallback img')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('re-enabling motion starts a fresh hidden initialization', async ({ page }) => {
  await instrument(page);
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.route-canvas')).toHaveCount(0);
  await page.evaluate(() => { window.releaseGPU = false; window.fenceChecks = 0; });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => window.fenceChecks > 0);
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await page.evaluate(() => { window.releaseGPU = true; });
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
});

test('a failed poster uses the neutral backdrop without blocking a completed scene', async ({ page }) => {
  await instrument(page, true);
  await page.route('**/images/route-666-placeholder-*.webp', route => route.abort());
  await page.goto('/');
  await page.waitForFunction(() => window.fenceChecks > 0);
  await expect(page.locator('.route-fallback')).toHaveAttribute('data-poster-failed', 'true');
  await expect(page.locator('.route-fallback picture')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => { window.releaseGPU = true; });
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
});
