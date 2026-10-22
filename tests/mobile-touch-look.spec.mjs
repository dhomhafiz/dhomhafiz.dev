import { test, expect } from '@playwright/test';
import { Euler, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import fs from 'node:fs';

const screenshotDirectory = 'artifacts/milestone-6c1';
fs.mkdirSync(screenshotDirectory, { recursive: true });
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

async function mobilePage(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    const uniforms = new WeakSet();
    const proto = WebGL2RenderingContext.prototype;
    const locate = proto.getUniformLocation;
    proto.getUniformLocation = function(program, name) {
      const location = locate.call(this, program, name);
      if (name === 'viewMatrix' && location) uniforms.add(location);
      return location;
    };
    const upload = proto.uniformMatrix4fv;
    proto.uniformMatrix4fv = function(location, transpose, value, ...rest) {
      if (uniforms.has(location)) window.cameraView = Array.from(value);
      return upload.call(this, location, transpose, value, ...rest);
    };
  });
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
}

async function pose(page) {
  const view = await page.evaluate(() => window.cameraView);
  expect(view).toHaveLength(16);
  const world = new Matrix4().fromArray(view).invert();
  const rotation = new Euler().setFromRotationMatrix(world, 'YXZ');
  const position = new Vector3().setFromMatrixPosition(world);
  return { yaw: rotation.y, pitch: rotation.x, position };
}

async function drag(page, start, end, hold = false) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y }] });
  await page.waitForTimeout(40);
  const samples = [];
  for (let step = 1; step <= 5; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{
      x: start.x + (end.x - start.x) * step / 5,
      y: start.y + (end.y - start.y) * step / 5,
    }] });
    await page.waitForTimeout(40);
    samples.push(await pose(page));
  }
  if (hold) return { cdp, samples };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return { samples };
}

async function release(cdp) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function assertNeutral(page, baseline) {
  await expect.poll(async () => {
    const current = await pose(page);
    return Math.abs(current.yaw - baseline.yaw) + Math.abs(current.pitch - baseline.pitch);
  }).toBeLessThan(0.003);
}

test('touch horizontal intent looks, vertical and diagonal intent scroll, and release recenters', async ({ page }) => {
  test.setTimeout(90_000);
  await mobilePage(page);
  await expect.poll(async () => Math.abs((await pose(page)).position.y - 2.25)).toBeLessThan(0.001);
  const baseline = await pose(page);
  await page.screenshot({ path: `${screenshotDirectory}/mobile-camera-neutral.png` });
  const canvas = await page.locator('.route-canvas canvas').boundingBox();
  const center = { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 };
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('.immersive-hero')?.classList.contains('immersive-hero'),
    { x: center.x, y: center.y })).toBe(true);
  const leftDrag = await drag(page, { x: center.x + 120, y: center.y }, { x: center.x - 120, y: center.y }, true);
  const leftLook = leftDrag.samples[leftDrag.samples.length - 1];
  expect(leftLook.yaw).toBeGreaterThan(baseline.yaw + 0.06);
  expect(Math.abs(leftLook.yaw - baseline.yaw)).toBeLessThan(0.18);
  await page.screenshot({ path: `${screenshotDirectory}/mobile-camera-left-look.png` });
  await release(leftDrag.cdp);
  await assertNeutral(page, baseline);
  const rightDrag = await drag(page, { x: center.x - 120, y: center.y }, { x: center.x + 120, y: center.y }, true);
  const rightLook = rightDrag.samples[rightDrag.samples.length - 1];
  expect(rightLook.yaw).toBeLessThan(baseline.yaw - 0.06);
  expect(Math.abs(rightLook.yaw - baseline.yaw)).toBeLessThan(0.18);
  await page.screenshot({ path: `${screenshotDirectory}/mobile-camera-right-look.png` });
  await release(rightDrag.cdp);
  await assertNeutral(page, baseline);

  const scrollBeforeDiagonal = await page.evaluate(() => scrollY);
  await drag(page, { x: center.x, y: center.y }, { x: center.x + 45, y: center.y - 50 });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBeforeDiagonal);
  await expect.poll(async () => Math.abs((await pose(page)).yaw - baseline.yaw)).toBeLessThan(0.003);
  const scrollAfterForward = await page.evaluate(() => scrollY);
  await drag(page, { x: center.x, y: center.y }, { x: center.x, y: center.y + 150 });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(scrollAfterForward);
});

test('touch look supports pitch, billboard drag suppression, tap, gallery, pause, and Contact', async ({ page }) => {
  test.setTimeout(120_000);
  await mobilePage(page);
  await expect.poll(async () => Math.abs((await pose(page)).position.y - 2.25)).toBeLessThan(0.001);
  const home = await pose(page);
  const canvas = await page.locator('.route-canvas canvas').boundingBox();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).tap();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await expect.poll(async () => (await pose(page)).position.z).toBeLessThan(-70);
  const billboard = new PerspectiveCamera(58, 390 / 844, 0.1, 420);
  const current = await pose(page);
  billboard.position.copy(current.position);
  billboard.rotation.set(current.pitch, current.yaw, 0, 'YXZ');
  billboard.updateMatrixWorld();
  const point = new Vector3(15.9, 13.6, -115).project(billboard);
  const screen = { x: (point.x + 1) * 195, y: (1 - point.y) * 422 };
  expect(screen.x).toBeGreaterThan(0);
  expect(screen.x).toBeLessThan(390);
  expect(screen.y).toBeGreaterThan(0);
  expect(screen.y).toBeLessThan(844);
  const billboardDrag = await drag(page, screen, { x: screen.x - 180, y: screen.y - 42 }, true);
  await release(billboardDrag.cdp);
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  const looked = billboardDrag.samples[billboardDrag.samples.length - 1];
  expect(Math.abs(looked.yaw - current.yaw)).toBeGreaterThan(0.03);
  expect(Math.abs(looked.pitch - current.pitch)).toBeGreaterThan(0.005);
  expect(Math.abs(looked.pitch - current.pitch)).toBeLessThan(0.12);
  await assertNeutral(page, current);
  await page.touchscreen.tap(screen.x, screen.y);
  await expect(page).toHaveURL(/\/work\/still-dental\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await expect(page.getByRole('button', { name: 'Pause scene' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause scene' }).tap();
  await expect(page.getByRole('button', { name: 'Resume scene' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Resume scene' }).tap();
  await page.getByRole('button', { name: 'View All Projects' }).tap();
  await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to 3D Experience' }).tap();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  const still = await page.locator('.route-canvas canvas').boundingBox();
  expect(still.width).toBe(canvas.width);

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page.locator('#hire-heading')).toBeVisible();
  await page.locator('#contact .hire-button').evaluate(element =>
    element.addEventListener('click', event => {
      event.preventDefault();
      window.contactActionInvoked = true;
    }, { once: true }));
  await page.locator('#contact .hire-button').tap();
  await expect.poll(() => page.evaluate(() => window.contactActionInvoked)).toBe(true);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).tap();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect.poll(async () => {
    const currentPose = await pose(page);
    return Math.abs(currentPose.yaw - home.yaw) + Math.abs(currentPose.pitch - home.pitch);
  }).toBeLessThan(0.003);
});
