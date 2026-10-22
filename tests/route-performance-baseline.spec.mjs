import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const durationMs = 3000;
const outputDirectory = 'artifacts/milestone-6d1';
fs.mkdirSync(outputDirectory, { recursive: true });

const hardwareChromePath = process.env.ROUTE_BASELINE_CHROME_PATH;
if (hardwareChromePath) {
  test.use({ launchOptions: { executablePath: hardwareChromePath, headless: false } });
}

async function preparePage(page, mobile) {
  if (mobile) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });
  }
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => window.__routePerformance?.report().initializationMs ?? null)).not.toBeNull();
}

async function measure(page, name, action) {
  await page.evaluate(label => window.__routePerformance.startScenario(label), name);
  if (action) await action();
  await page.waitForTimeout(durationMs);
  const sample = await page.evaluate(() => window.__routePerformance.endScenario());
  expect(sample, `${name} should collect rendered frames`).not.toBeNull();
  if (name === 'Gallery open') expect(sample.frames).toBe(0);
  else expect(sample.frames).toBeGreaterThan(0);
  return sample;
}

async function setProgress(page, progress) {
  await page.evaluate(value => {
    const hero = document.querySelector('.immersive-hero');
    window.scrollTo({ top: hero.offsetHeight * 12 * value, behavior: 'instant' });
  }, progress);
}

async function lookAround(page, mobile) {
  if (!mobile) {
    const bounds = await page.locator('.immersive-hero').boundingBox();
    for (let index = 0; index < 12; index++) {
      await page.mouse.move(bounds.x + bounds.width * (index % 2 ? 0.25 : 0.75), bounds.y + bounds.height * 0.45);
      await page.waitForTimeout(80);
    }
    return;
  }

  const bounds = await page.locator('.immersive-hero').boundingBox();
  const y = bounds.y + bounds.height * 0.45;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: bounds.x + bounds.width * 0.65, y }],
  });
  for (let index = 0; index < 8; index++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: bounds.x + bounds.width * (index % 2 ? 0.35 : 0.65), y }],
    });
    await page.waitForTimeout(100);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function runBaseline(page, mobile, repeatImportant = false) {
  const measurements = [];
  const capture = async (name, action) => measurements.push(await measure(page, name, action));
  const nav = page.locator('.editorial-header nav');
  const projectsLink = nav.locator('a[href="#works"]');
  const contactLink = nav.locator('a[href="#contact"]');

  await capture('Hero idle');
  await capture('Hero camera look-around', () => lookAround(page, mobile));
  await capture('Hero to Dental scroll', () => projectsLink.click());
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await capture('Dental billboard viewing stop');

  await capture('Dental to Squid Game scroll', () => setProgress(page, 0.47));
  await setProgress(page, 0.64);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await capture('Squid Game viewing stop');

  await capture('Squid Game to Contact scroll', () => contactLink.click());
  await expect(page.locator('#contact')).toHaveAttribute('data-route-contact', 'active');
  await capture('Contact idle');

  await projectsLink.click();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await page.getByRole('button', { name: 'View All Projects' }).click();
  await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
  await page.waitForTimeout(350);
  await capture('Gallery open');
  await capture('Gallery close', () => page.getByRole('button', { name: 'Back to 3D Experience' }).click());
  await expect(page.getByRole('dialog')).toHaveCount(0);
  if (repeatImportant) {
    await nav.locator('a[href="#top"]').click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await capture('Hero idle');
    await capture('Hero camera look-around', () => lookAround(page, mobile));
    await projectsLink.click();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
    await capture('Dental billboard viewing stop');
    await setProgress(page, 0.64);
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
    await capture('Squid Game viewing stop');
    await contactLink.click();
    await expect(page.locator('#contact')).toHaveAttribute('data-route-contact', 'active');
    await capture('Contact idle');
  }
  return measurements;
}

const profiles = hardwareChromePath
  ? [{ name: 'desktop-hardware-chrome', mobile: false, viewport: { width: 1440, height: 1000 }, repeatImportant: true }]
  : [
      { name: 'desktop', mobile: false, viewport: { width: 1440, height: 1000 } },
      { name: 'chromium-mobile-emulation', mobile: true, viewport: { width: 390, height: 844 } },
    ];

for (const profile of profiles) {
  test(`${profile.name} Route 666 performance baseline`, async ({ browser, baseURL }) => {
    test.setTimeout(240_000);
    const context = await browser.newContext({
      baseURL,
      viewport: profile.viewport,
      deviceScaleFactor: profile.mobile ? 3 : 1,
      isMobile: profile.mobile,
      hasTouch: profile.mobile,
    });
    const page = await context.newPage();
    try {
      await preparePage(page, profile.mobile);
      const measurements = await runBaseline(page, profile.mobile, profile.repeatImportant);
      const report = await page.evaluate(() => window.__routePerformance.report());
      const browserSession = await browser.newBrowserCDPSession();
      const systemInfo = await browserSession.send('SystemInfo.getInfo');
      await browserSession.detach();
      const gpu = {
        devices: systemInfo.gpu.devices,
        featureStatus: systemInfo.gpu.featureStatus,
        displayType: systemInfo.gpu.auxAttributes.displayType,
        glImplementationParts: systemInfo.gpu.auxAttributes.glImplementationParts,
        glRenderer: systemInfo.gpu.auxAttributes.glRenderer,
        glVendor: systemInfo.gpu.auxAttributes.glVendor,
      };
      const repeated = measurements.slice(10);
      const repeatability = repeated.map((secondRun, index) => {
        const firstRun = measurements[index];
        return {
          scenario: secondRun.name,
          firstFps: firstRun.averageFps,
          repeatFps: secondRun.averageFps,
          fpsDifference: secondRun.averageFps - firstRun.averageFps,
          firstP95Ms: firstRun.frameTimeMs.p95,
          repeatP95Ms: secondRun.frameTimeMs.p95,
          p95DifferenceMs: secondRun.frameTimeMs.p95 - firstRun.frameTimeMs.p95,
        };
      });
      const artifact = { profile: profile.name, browserVersion: await browser.version(), viewport: profile.viewport, gpu, report, measurements, repeatability };
      fs.writeFileSync(`${outputDirectory}/${profile.name}.json`, JSON.stringify(artifact, null, 2));
      console.log(`ROUTE_PERFORMANCE_BASELINE ${JSON.stringify(artifact)}`);
      expect(measurements).toHaveLength(profile.repeatImportant ? 15 : 10);
      if (profile.repeatImportant) {
        const renderer = measurements[0].webgl.unmaskedRenderer ?? measurements[0].webgl.renderer;
        expect(renderer).not.toMatch(/SwiftShader|Software Rasterizer/i);
        expect(renderer).toMatch(/NVIDIA|AMD|Intel/i);
        expect(gpu.featureStatus.webgl).toBe('enabled');
      }
    } finally {
      await context.close();
    }
  });
}
