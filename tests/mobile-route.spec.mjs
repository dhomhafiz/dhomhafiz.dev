import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const surface = page => page.locator('.route-surface');
const nav = page => page.getByRole('navigation', { name: 'Main navigation' });

async function instrument(page, options = {}) {
  await page.addInitScript(options => {
    // Observe listener cleanup without exposing debug APIs in the product.
    window.routeScrollListeners = new Set();
    const add = window.addEventListener, remove = window.removeEventListener;
    window.addEventListener = function(type, listener, options) {
      if (type === 'scroll') window.routeScrollListeners.add(listener);
      return add.call(this, type, listener, options);
    };
    window.removeEventListener = function(type, listener, options) {
      if (type === 'scroll') window.routeScrollListeners.delete(listener);
      return remove.call(this, type, listener, options);
    };
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => options.cores ?? 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => options.memory ?? 8 });
    if (options.connection) Object.defineProperty(navigator, 'connection', {
      value: Object.assign(new EventTarget(), options.connection), configurable: true,
    });
    window.releaseGPU = !options.hold;
    window.fenceChecks = 0;
    if (options.noGL) {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    }
    const wait = WebGL2RenderingContext.prototype.clientWaitSync;
    WebGL2RenderingContext.prototype.clientWaitSync = function(...args) {
      window.fenceChecks++;
      if (options.failGPU) return this.WAIT_FAILED;
      return window.releaseGPU ? wait.apply(this, args) : this.TIMEOUT_EXPIRED;
    };
  }, options);
}
async function ready(page) {
  await expect(surface(page)).toHaveAttribute('data-scene', 'ready', { timeout: 30_000 });
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '1');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
}
async function oneJourney(page, expectedDpr = 1) {
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.route-journey[data-journey="active"]')).toHaveCount(1);
  const listeners = await page.evaluate(() => {
    const count = window.routeScrollListeners.size;
    window.readyScrollListenerCount ??= count;
    return { count, baseline: window.readyScrollListenerCount };
  });
  expect(listeners.count).toBeGreaterThan(0);
  expect(listeners.count).toBe(listeners.baseline);
  await expect.poll(() => page.locator('canvas').evaluate(canvas => canvas.width / canvas.clientWidth)).toBeCloseTo(expectedDpr, 2);
}
async function fallbackLinks(page) {
  await expect(surface(page)).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.route-fallback img')).toBeVisible();
  await nav(page).getByRole('link', { name: 'Projects', exact: true }).tap();
  await expect(page.locator('#works')).toHaveJSProperty('inert', false);
  await expect(page.locator('#works-heading')).toBeInViewport();
  await nav(page).getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
  await expect(page.locator('#contact')).toBeInViewport();
}

test('supported coarse-pointer mobile mounts the shared scene and one journey', async ({ page }) => {
  await instrument(page);
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  await expect(page.locator('canvas')).toHaveCount(1);
  await ready(page);
  await oneJourney(page);
  await page.screenshot({ path: 'artifacts/milestone-6b/mobile-ready-hero.png' });
  await page.setViewportSize({ width: 844, height: 390 });
  await oneJourney(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await oneJourney(page);
});

test('mobile poster covers pending GPU work and reveals only a completed frame', async ({ page }) => {
  await instrument(page, { hold: true });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.fenceChecks)).toBeGreaterThan(0);
  await expect(surface(page)).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await expect(page.locator('.route-canvas')).not.toHaveAttribute('data-initialized');
  expect(await page.locator('.route-fallback img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'artifacts/milestone-6b/mobile-loading-poster.png' });
  await page.evaluate(() => { window.releaseGPU = true; });
  await ready(page);
  await oneJourney(page);
});

test('mobile uses both billboards, gallery and Contact, reverses, then releases on context loss', async ({ page }) => {
  test.setTimeout(120_000);
  await instrument(page);
  await page.goto('/'); await ready(page);
  await nav(page).getByRole('link', { name: 'Projects', exact: true }).tap();
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await page.screenshot({ path: 'artifacts/milestone-6b/mobile-dental.png' });
  await page.getByRole('button', { name: 'View All Projects' }).tap();
  await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to 3D Experience' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: 'Next project' }).tap();
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await page.screenshot({ path: 'artifacts/milestone-6b/mobile-squid.png' });
  await nav(page).getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page.locator('#hire-heading')).toBeFocused();
  await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
  await page.screenshot({ path: 'artifacts/milestone-6b/mobile-contact.png' });
  await oneJourney(page);
  await nav(page).getByRole('link', { name: 'Home', exact: true }).tap();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.hero-copy-block')).toHaveCSS('opacity', '1');
  await page.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await fallbackLinks(page);
});

for (const scenario of ['reduced motion', 'no WebGL', 'failed initialization']) {
  test(`mobile ${scenario} retains accessible fallback destinations`, async ({ page }) => {
    await instrument(page, { memory: scenario === 'low memory' ? 2 : 8, cores: scenario === 'low cores' ? 2 : 8,
      noGL: scenario === 'no WebGL', failGPU: scenario === 'failed initialization' });
    if (scenario === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    if (scenario === 'failed initialization') await expect.poll(() => page.evaluate(() => window.fenceChecks)).toBeGreaterThan(0);
    await fallbackLinks(page);
    await expect(page.getByRole('status')).toHaveCount(0);
  });
}

for (const device of [{ name: 'low memory', memory: 2, cores: 8 }, { name: 'low core count', memory: undefined, cores: 2 }]) {
  test(`mobile ${device.name} hint does not prevent WebGL attempt`, async ({ page }) => {
    await instrument(page, { memory: device.memory, cores: device.cores });
    await page.goto('/');
    await expect(page.locator('canvas')).toHaveCount(1);
    await ready(page);
    await oneJourney(page);
  });
}

for (const connection of [{ saveData: true, effectiveType: '4g' }, { saveData: false, effectiveType: '2g' }]) {
  test(`network policy defers optional 3D until requested: ${JSON.stringify(connection)}`, async ({ page }) => {
    const previews = [];
    // The Squid image also belongs to the ordinary HTML portfolio; Dental's
    // display texture is specific to the optional 3D download.
    page.on('request', request => { if (/dental-home.webp/.test(request.url())) previews.push(request.url()); });
    await instrument(page, { connection });
    await page.goto('/');
    const load = page.getByRole('button', { name: 'Load 3D scene' });
    await expect(load).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(previews).toEqual([]);
    await load.tap();
    await ready(page); await oneJourney(page);
    expect(previews).toHaveLength(1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await fallbackLinks(page);
  });
}

test('live reduced motion removes and reinitializes the same mobile enhancement', async ({ page }) => {
  await instrument(page);
  await page.goto('/'); await ready(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.evaluate(() => { window.releaseGPU = false; window.fenceChecks = 0; });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => window.fenceChecks)).toBeGreaterThan(0);
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await page.evaluate(() => { window.releaseGPU = true; });
  await ready(page); await oneJourney(page);
});

test('enabling Save-Data resets readiness before a later explicit reload', async ({ page }) => {
  await instrument(page, { connection: { saveData: false, effectiveType: '4g' } });
  await page.goto('/'); await ready(page); await oneJourney(page);
  await page.evaluate(() => {
    window.releaseGPU = false; window.fenceChecks = 0;
    navigator.connection.saveData = true;
    navigator.connection.dispatchEvent(new Event('change'));
  });
  const load = page.getByRole('button', { name: 'Load 3D scene' });
  await expect(load).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await load.tap();
  await expect.poll(() => page.evaluate(() => window.fenceChecks)).toBeGreaterThan(0);
  await expect(surface(page)).toHaveAttribute('data-scene', 'fallback');
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await page.evaluate(() => { window.releaseGPU = true; });
  await ready(page); await oneJourney(page);
});

test('desktop retains the same shared Canvas and 1.5 DPR cap', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false,
    baseURL: test.info().project.use.baseURL });
  const page = await context.newPage();
  await instrument(page);
  await page.goto('/'); await ready(page);
  await oneJourney(page, 1.5);
  await page.screenshot({ path: 'artifacts/milestone-6b/desktop-ready.png' });
  await page.setViewportSize({ width: 800, height: 1000 });
  await oneJourney(page, 1.5);
  await context.close();
});
