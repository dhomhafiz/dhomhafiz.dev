import { test, expect } from '@playwright/test';
import { MathUtils } from 'three';
import { cameraPose, openScene } from './helpers/route-camera.mjs';

test('real camera responds at pointer extremes, reverses safely, and rests without jitter', async ({ page }) => {
  await openScene(page);
  const center = await cameraPose(page);
  expect(center.yaw).toBeCloseTo(0, 3);
  expect(center.y).toBeCloseTo(2.25, 2);
  expect(center.z).toBeCloseTo(6, 2);
  for (const [name, x, y, axis, direction, target] of [
    ['left', 1, 500, 'yaw', 1, 8], ['right', 1439, 500, 'yaw', -1, 8],
    ['top', 720, 1, 'pitch', 1, 3], ['bottom', 720, 999, 'pitch', -1, 3],
  ]) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(750);
    const pose = await cameraPose(page);
    expect((pose[axis] - center[axis]) * direction).toBeGreaterThan(target - 0.3);
    expect((pose[axis] - center[axis]) * direction).toBeLessThanOrEqual(target + 0.01);
    expect(Math.abs(pose.x)).toBeLessThanOrEqual(0.101);
    expect(pose.y).toBeGreaterThan(2.229);
    expect(pose.z).toBeCloseTo(center.z, 3);
    await page.screenshot({ path: `artifacts/camera-comfort/${name}.png` });
  }
  for (const x of [1, 1439, 1, 1439, 1]) {
    await page.mouse.move(x, 500);
    const pose = await cameraPose(page);
    expect(Math.abs(pose.yaw)).toBeLessThanOrEqual(8.01);
  }
  await page.mouse.move(1439, 500);
  await page.waitForTimeout(1800);
  const settled = await cameraPose(page);
  await page.waitForTimeout(250);
  const still = await cameraPose(page);
  expect(Math.abs(settled.yaw - still.yaw)).toBeLessThan(0.001);
  expect(Math.abs(settled.x - still.x)).toBeLessThan(0.0001);
  // A real pointer move beyond the browser viewport resets the influence.
  await page.mouse.move(-10, -10);
  await page.waitForTimeout(1100);
  expect(Math.abs((await cameraPose(page)).yaw)).toBeLessThan(0.03);
  await page.mouse.move(1, 500);
  const entering = await cameraPose(page);
  expect(Math.abs(entering.yaw)).toBeLessThan(7.5);
  await page.waitForTimeout(700);
  expect((await cameraPose(page)).yaw).toBeGreaterThan(7.7);
});

test('scroll travel remains independent of mouse offsets and narrow screens retain the focal point', async ({ page }) => {
  await openScene(page);
  await page.mouse.move(1439, 500);
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const hero = document.querySelector('.immersive-hero');
    const progress = .4 * (.5 - Math.sin(Math.asin(.6) / 3));
    scrollTo({ top: hero.offsetHeight * 8 * progress, behavior: 'instant' });
  });
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 18.5)).toBeLessThan(0.05);
  const active = await cameraPose(page);
  expect(active.z).toBeCloseTo(-18.5, 0);
  expect(Math.abs(active.yaw)).toBeGreaterThan(2);
  expect(Math.abs(active.yaw)).toBeLessThan(11);
  await page.mouse.move(-10, -10);
  await page.waitForTimeout(1100);
  const neutral = await cameraPose(page);
  expect(neutral.z).toBeCloseTo(active.z, 1);
  expect(neutral.y).toBeCloseTo(2.35, 1);
  expect(Math.abs(neutral.pitch)).toBeLessThan(3);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.mouse.move(319, 500);
  await page.waitForTimeout(1200);
  const narrow = await cameraPose(page);
  const halfFov = MathUtils.radToDeg(Math.atan(Math.tan(MathUtils.degToRad(29)) * 320 / 1000));
  expect(Math.abs(narrow.yaw)).toBeLessThan(halfFov * 0.71);
  expect(Math.abs(narrow.yaw)).toBeGreaterThan(halfFov * 0.7 - 0.3);
});
