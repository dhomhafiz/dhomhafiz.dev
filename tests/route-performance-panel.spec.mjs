import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const enabled = process.env.ROUTE_PERF_PANEL_EXPECT === 'enabled';

test('performance panel is development-gated and respects the query flag', async ({ page }) => {
  await page.goto('/?perf=1');
  const panel = page.getByRole('complementary', { name: 'Development performance diagnostics' });

  if (!enabled) {
    await expect(panel).toHaveCount(0);
    return;
  }

  await expect(panel).toBeVisible();
  await expect(page.getByRole('button', { name: 'Perf' })).toBeVisible();
  await page.goto('/');
  await expect(panel).toHaveCount(0);
});

test('performance panel captures a three-second sample and exposes JSON export', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  await page.goto('/?perf=1');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await page.getByRole('button', { name: 'Perf' }).click();
  await expect(page.getByRole('heading', { name: 'Route 666 diagnostics' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Fallback diagnosis' })).toContainText('eligible');
  await expect(page.getByRole('region', { name: 'Fallback diagnosis' })).toContainText('Canvas mounted');
  await expect(page.getByRole('region', { name: 'Fallback diagnosis' })).toContainText('ready');
  await expect(page.getByRole('region', { name: 'Fallback diagnosis' })).toContainText('WebGL renderer');
  await page.getByRole('button', { name: 'Start Sample (3s)' }).click();
  await expect(page.getByRole('button', { name: /Stop Sample/ })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Sample complete', { timeout: 6000 });
  const sampleMetrics = page.locator('.route-performance-card > dl');
  await expect(sampleMetrics).toContainText('Average FPS');
  await expect(sampleMetrics).toContainText('Frame P50 / P95');
  await expect(sampleMetrics).toContainText('Jank >33 / >50 ms');
  await expect(sampleMetrics).toContainText('Sample renderer');
  await expect(page.getByRole('button', { name: 'Copy Diagnostics' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('route-diagnostics.json');
  const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  const latestSample = exported.report.completed.at(-1);
  expect(latestSample.name).toBe('Hero idle');
  expect(latestSample.durationMs).toBeGreaterThanOrEqual(2900);
  expect(latestSample.durationMs).toBeLessThan(4000);
  expect(latestSample.frameTimeMs).toEqual(expect.objectContaining({ p50: expect.any(Number), p95: expect.any(Number) }));
  expect(exported.report.runtime.canvas.rendererState).toBe('created');
  expect(exported.report.runtime.webglRenderer.renderer).toEqual(expect.any(String));
  expect(exported.report.runtime.device.browser).toMatch(/Chrome/);
  expect(JSON.stringify(exported)).not.toContain('userAgent');
});

test('expanded panel leaves mobile journey navigation and Pause Scene operable', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?perf=1');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await page.getByRole('button', { name: 'Perf' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await page.getByRole('button', { name: 'Pause scene' }).click();
  await expect(page.getByRole('button', { name: 'Resume scene' })).toHaveAttribute('aria-pressed', 'true');
});

async function openFallbackDiagnostics(page, initScript) {
  if (initScript) await page.addInitScript(initScript);
  await page.goto('/?perf=1');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
  await page.getByRole('button', { name: 'Perf' }).click();
  await expect(page.getByRole('heading', { name: 'Route 666 diagnostics' })).toBeVisible();
  return page.getByRole('region', { name: 'Fallback diagnosis' });
}

test('diagnostic panel explains reduced motion while low hardware hints remain eligible', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let diagnosis = await openFallbackDiagnostics(page);
  await expect(diagnosis).toContainText('blocked');
  await expect(diagnosis).toContainText('Reduced-motion preference prevents 3D activation');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  expect(exported.report.runtime.eligibility.blockers).toContain('Reduced-motion preference prevents 3D activation.');
  expect(JSON.stringify(exported)).not.toContain('userAgent');

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?perf=1');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await page.getByRole('button', { name: 'Perf' }).click();
  diagnosis = page.getByRole('region', { name: 'Fallback diagnosis' });
  await expect(diagnosis).toContainText('eligible');
  await expect(diagnosis).toContainText('Canvas mountedyes');
  await expect(diagnosis).toContainText('2 GiB');
  await expect(diagnosis).toContainText('cores 2');
});

test('physical iPhone eligibility report can attempt the shared mobile scene', async ({ browser }) => {
  test.skip(!enabled, 'This test requires the development server.');
  const context = await browser.newContext({
    viewport: { width: 430, height: 669 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => undefined });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  try {
    await page.goto('/?perf=1');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect.poll(() => page.locator('canvas').evaluate(canvas => canvas.width / canvas.clientWidth)).toBeCloseTo(1, 1);
    await page.getByRole('button', { name: 'Perf' }).click();
    const diagnosis = page.getByRole('region', { name: 'Fallback diagnosis' });
    await expect(diagnosis).toContainText('eligible');
    await expect(diagnosis).toContainText('Canvas mountedyes');
    await expect(diagnosis).toContainText('created');
    await expect(diagnosis).toContainText('cores 4');
    await expect(diagnosis).toContainText('memory unknown GiB');
  } finally {
    await context.close();
  }
});

test('Save-Data defer is explained and requesting the scene still permits normal initialization', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    Object.defineProperty(navigator, 'connection', {
      value: Object.assign(new EventTarget(), { saveData: true, effectiveType: '4g' }),
      configurable: true,
    });
  });
  const diagnosis = await openFallbackDiagnostics(page);
  await expect(diagnosis).toContainText('eligible');
  await expect(diagnosis).toContainText('Save-Data preference defers the optional 3D download');
  await expect(page.getByRole('button', { name: 'Load 3D scene' })).toBeVisible();
  await page.getByRole('button', { name: 'Close perf' }).click();
  await page.getByRole('button', { name: 'Load 3D scene' }).click();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await page.getByRole('button', { name: 'Perf' }).click();
  const readyDiagnosis = page.getByRole('region', { name: 'Fallback diagnosis' });
  await expect(readyDiagnosis).toContainText('3d');
});

test('unsupported WebGL context creation is diagnosed while poster fallback remains available', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  const diagnosis = await openFallbackDiagnostics(page, () => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return /webgl/i.test(String(type)) ? null : original.call(this, type, ...args);
    };
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
  await expect(diagnosis).toContainText('Canvas mounted');
  await expect(diagnosis).toContainText(/pending|failed/);
  await expect(diagnosis).toContainText('WebGL1 available');
  await expect(diagnosis).toContainText('WebGL renderer creation failed');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.route-fallback img')).toBeVisible();
});

test('shader/GPU initialization failure is distinguished from eligibility fallback', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  const diagnosis = await openFallbackDiagnostics(page, () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    const original = WebGL2RenderingContext.prototype.clientWaitSync;
    WebGL2RenderingContext.prototype.clientWaitSync = function(...args) {
      return this.WAIT_FAILED || original.apply(this, args);
    };
  });
  await expect(diagnosis).toContainText('failed');
  await expect(diagnosis).toContainText('WAIT_FAILED');
  await expect(page.locator('.route-fallback img')).toBeVisible();
});

test('WebGL context loss is captured in fallback diagnostics', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  await page.goto('/?perf=1');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await page.getByRole('button', { name: 'Perf' }).click();
  await page.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  const diagnosis = page.getByRole('region', { name: 'Fallback diagnosis' });
  await expect(diagnosis).toContainText('yes', { timeout: 10_000 });
  await expect(diagnosis).toContainText('WebGL context was lost');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'fallback');
});

test('scene readiness timeout is reported without forcing or bypassing recovery', async ({ page }) => {
  test.skip(!enabled, 'This test requires the development server.');
  const diagnosis = await openFallbackDiagnostics(page, () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    WebGL2RenderingContext.prototype.clientWaitSync = function() { return this.TIMEOUT_EXPIRED; };
  });
  await expect(diagnosis).toContainText('timed-out', { timeout: 20_000 });
  await expect(diagnosis).toContainText('12 seconds');
  await expect(page.locator('.route-fallback img')).toBeVisible();
});
