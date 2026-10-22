import { test, expect } from '@playwright/test';
import { openScene, cameraPose } from './helpers/route-camera.mjs';

async function observe(page, cold = false) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(cold => {
    if (cold) {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    }
    const dawn = new WeakSet(), views = new WeakSet();
    const proto = WebGL2RenderingContext.prototype;
    const locate = proto.getUniformLocation, upload = proto.uniform1f, matrix = proto.uniformMatrix4fv;
    proto.getUniformLocation = function(program, name) {
      const location = locate.call(this, program, name);
      if (location && name === 'uDawn') dawn.add(location);
      if (location && name === 'viewMatrix') views.add(location);
      return location;
    };
    proto.uniform1f = function(location, value) {
      if (dawn.has(location)) window.routeDawn = value;
      return upload.call(this, location, value);
    };
    proto.uniformMatrix4fv = function(location, transpose, value, ...rest) {
      if (views.has(location)) window.cameraView = Array.from(value);
      return matrix.call(this, location, transpose, value, ...rest);
    };
  }, cold);
  return errors;
}
async function seek(page, progress, z) {
  await page.evaluate(p => scrollTo({ top: document.querySelector('.immersive-hero').offsetHeight * 12 * p, behavior: 'instant' }), progress);
  if (z !== undefined) await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(.03);
}
const contactNav = page => page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true });
const cta = page => page.getByRole('link', { name: /LET'S BUILD SOMETHING/ });

test('one reversible highway travels from midnight through dawn and back to both billboards and Hero', async ({ page }) => {
  test.setTimeout(100_000);
  const errors = await observe(page);
  await openScene(page); await page.mouse.move(-10, -10);
  await page.screenshot({ path: 'artifacts/milestone-4/midnight.png' });
  await seek(page, .64, -158);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  expect(await page.evaluate(() => window.routeDawn)).toBe(0);
  const squid = await cameraPose(page);
  await seek(page, 2 / 3 + .0001, -158);
  expect(Math.abs((await cameraPose(page)).yaw - squid.yaw)).toBeLessThan(.1);
  let previous = 0;
  for (const progress of [.74, .81, .9, .975]) {
    await seek(page, progress);
    await expect.poll(() => page.evaluate(() => window.routeDawn)).toBeGreaterThan(previous + .01);
    if (progress === .81) {
      await expect.poll(async () => Math.abs((await cameraPose(page)).z + 216)).toBeLessThan(3);
      await page.screenshot({ path: 'artifacts/milestone-4/transition.png' });
    }
    if (progress === .975) await expect.poll(() => page.evaluate(() => window.routeDawn)).toBe(1);
    previous = await page.evaluate(() => window.routeDawn);
  }
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.03);
  await expect(cta(page)).toBeVisible();
  await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
  await page.screenshot({ path: 'artifacts/milestone-4/dawn-contact.png' });
  const final = await cameraPose(page);
  expect(Math.abs(final.yaw)).toBeLessThan(.05);
  expect(Math.abs(final.x)).toBeLessThan(.02);
  await page.getByRole('button', { name: 'Pause scene', exact: true }).click();
  await seek(page, .81);
  expect(await page.evaluate(() => window.routeDawn)).toBe(1);
  await page.getByRole('button', { name: 'Resume scene', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.routeDawn)).toBeLessThan(.495);
  const dawn = await page.evaluate(() => window.routeDawn);
  await page.waitForTimeout(200); // A stationary journey must not become brighter with time.
  expect(Math.abs(await page.evaluate(() => window.routeDawn) - dawn)).toBeLessThan(.03);
  await seek(page, .64, -158);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await seek(page, .3, -93);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await seek(page, 0, 6);
  expect(await page.evaluate(() => window.routeDawn)).toBe(0);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('#contact')).toHaveCount(1);
  await expect(page.locator('.film-reel')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('Contact is the scroll endpoint and repeated downward input cannot reveal the archive', async ({ page }) => {
  await openScene(page);
  await seek(page, .975, -278);
  await expect(cta(page)).toBeVisible();
  await expect(page.locator('.route-gallery-presentation')).toHaveJSProperty('inert', true);
  await expect(page.locator('.route-gallery-presentation')).toBeHidden();
  const endpoint = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(endpoint);
  await page.mouse.wheel(0, 1400);
  await page.mouse.wheel(0, 1400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(endpoint);
  await expect(cta(page)).toBeVisible();
  await expect(page.locator('#works-heading')).toBeHidden();
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.03);
  await page.mouse.wheel(0, -800);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(endpoint);
  await expect.poll(async () => (await cameraPose(page)).z).toBeGreaterThan(-278);
});

test('Contact keyboard navigation, WhatsApp destination, history, interruption and refresh share the journey', async ({ page, context }) => {
  test.setTimeout(100_000);
  const errors = await observe(page);
  await openScene(page);
  await contactNav(page).focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#hire-heading')).toBeFocused();
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.03);
  await expect(contactNav(page)).toHaveAttribute('aria-current', 'location');
  await page.keyboard.press('Tab'); await expect(cta(page)).toBeFocused();
  await expect(cta(page)).toHaveAttribute('href', /^https:\/\/wa.me\/60197860823\?text=/);
  await context.route('https://wa.me/**', route => route.fulfill({ body: 'WhatsApp navigation verified locally.' }));
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.keyboard.press('Enter')]);
  await expect(popup).toHaveURL(/^https:\/\/wa.me\/60197860823\?text=/); await popup.close();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/#contact$/);
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.03);
  await page.goForward();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await contactNav(page).click(); await expect(page.locator('#hire-heading')).toBeFocused();
  await page.reload();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.03);
  await expect(cta(page)).toBeVisible();
  await seek(page, 0, 6);
  await contactNav(page).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await page.mouse.wheel(0, -160);
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(250);
  expect(Math.abs(await page.evaluate(() => scrollY) - stopped)).toBeLessThan(2);
  expect(errors).toEqual([]);
});

test('fresh Contact deep link restores dawn and a lost context releases the same Contact HTML', async ({ page }) => {
  await observe(page, true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#contact');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.03);
  await expect(cta(page)).toBeVisible();
  await page.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('#contact')).not.toHaveAttribute('data-route-contact');
  await expect(page.locator('#hire-heading')).toBeInViewport();
  await expect(cta(page)).toBeVisible();
  await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
});

for (const mode of ['reduced motion', 'touch mobile', 'unsupported WebGL']) {
  test(`Contact remains directly accessible with ${mode}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: mode === 'touch mobile' ? 390 : 1440, height: 844 },
      isMobile: mode === 'touch mobile', hasTouch: mode === 'touch mobile', reducedMotion: mode === 'reduced motion' ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    try {
      if (mode === 'unsupported WebGL') await page.addInitScript(() => {
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(kind, ...args) { return /webgl/.test(kind) ? null : get.call(this, kind, ...args); };
      });
      await page.goto('/#contact');
      await expect(page.locator('#hire-heading')).toBeInViewport();
      await expect(cta(page)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.locator('#contact').evaluate(section => Math.abs(section.getBoundingClientRect().top - document.querySelector('.editorial-header').offsetHeight))).toBeLessThan(2);
      await expect(page.locator('#contact')).toHaveCount(1);
      await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (mode === 'touch mobile') await page.screenshot({ path: 'artifacts/milestone-4/mobile-contact.png' });
    } finally { await context.close(); }
  });
}
