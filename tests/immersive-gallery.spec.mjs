import { test, expect } from '@playwright/test';
import { cameraPose, openScene } from './helpers/route-camera.mjs';
import { PerspectiveCamera, Vector3, Euler, MathUtils } from 'three';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const settings = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/features/immersive/routeBillboardSettings.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, settings);
const billboard = settings.exports.billboardDestinations[0];
// Invert smoothstep to exercise the original Dental waypoints in the longer journey.
const firstTravel = progress => billboard.viewStart * (.5 - Math.sin(Math.asin(1 - 2 * progress) / 3));
function projectedBillboard(pose, width = 1440, height = 1000) {
  const camera = new PerspectiveCamera(58, width / height, .1, 420);
  camera.position.set(pose.x, pose.y, pose.z);
  camera.rotation.set(MathUtils.degToRad(pose.pitch), MathUtils.degToRad(pose.yaw), 0, 'YXZ');
  camera.updateMatrixWorld();
  const corners = [-1, 1].flatMap(x => [-1, 1].map(y => new Vector3(x * billboard.screen.width / 2, y * billboard.screen.height / 2, 0)
    .applyEuler(new Euler(0, billboard.rotationY, 0)).add(new Vector3(...billboard.position)).project(camera)));
  const xs = corners.map(p => (p.x + 1) * width / 2), ys = corners.map(p => (1 - p.y) * height / 2);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys), camera };
}

const projects = page => page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true });
async function galleryEnd(page) {
  return page.locator('.immersive-hero').evaluate(hero => hero.offsetHeight * 8);
}
async function seek(page, top, z) {
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), top);
  await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(0.2);
}

test('billboard is visible from Hero, grows along the roadside approach, and reverses in one canvas', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  await page.mouse.move(-10, -10);
  const end = await galleryEnd(page);
  let previousArea = 0;
  for (const [index, fraction, z] of [[0, 0, 6], [1, .4, -65], [2, .6, -94], [3, .8, -108], [4, 1, -115]]) {
    await seek(page, end * firstTravel(fraction), z);
    const pose = await cameraPose(page);
    expect(Math.abs(pose.x)).toBeLessThan(6.2);
    expect(Math.abs(pose.yaw)).toBeLessThan(35);
    expect(Math.abs(pose.pitch)).toBeLessThan(22);
    const box = projectedBillboard(pose);
    expect(box.width * box.height).toBeGreaterThan(previousArea);
    previousArea = box.width * box.height;
    if (fraction === 0) { expect(box.width).toBeGreaterThan(40); expect(box.x).toBeGreaterThan(720); }
    if (fraction === 1) {
      // The road-facing screen has less diagonal perspective stretch than the old oblique sign.
      expect(box.width).toBeGreaterThan(400); expect(box.height).toBeGreaterThan(280);
      expect(box.y).toBeGreaterThan(64); expect(box.y + box.height).toBeLessThan(900);
      const beyond = new Vector3(0, 0, -230).project(box.camera);
      expect(beyond.x).toBeGreaterThan(-1); expect(beyond.x).toBeLessThan(1);
      expect((beyond.x + 1) * 720).toBeLessThan(box.x);
      expect((1 - beyond.y) * 500).toBeLessThan(1000);
    }
    await page.screenshot({ path: `artifacts/roadside-billboard/journey-${index}.png` });
    if (fraction === .8) await page.mouse.move(720, 480); // Hover before arrival becomes interactive.
  }
  await page.mouse.move(721, 480);
  await expect(page.locator('.route-gallery-ui')).toHaveAttribute('data-hovered', 'true');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.route-gallery-ui')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#works')).toHaveJSProperty('inert', true);
  await expect(projects(page)).toHaveAttribute('aria-current', 'location');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), (await galleryEnd(page)) * .45);
  // A smaller, road-facing display may fit without the old display's camera retreat.
  await expect.poll(async () => (await cameraPose(page)).z).toBeGreaterThan(-115.1);
  const narrow = projectedBillboard(await cameraPose(page), 768, 1024);
  expect(narrow.x).toBeGreaterThan(0);
  expect(narrow.x + narrow.width).toBeLessThan(768);
  expect(narrow.y).toBeGreaterThan(64);
  expect(narrow.y + narrow.height).toBeLessThan(924);
  await page.mouse.move(384, 512);
  await expect(page.locator('.route-gallery-ui')).toHaveAttribute('data-hovered', 'true');
  await page.screenshot({ path: 'artifacts/roadside-billboard/narrow-billboard.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.mouse.move(-10, -10);
  await seek(page, end * firstTravel(.6), -94);
  await seek(page, 0, 6);
  await expect(page.locator('.route-gallery-ui')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero-copy-block')).toHaveCSS('opacity', '1');
});

test('physical Dental screen hovers, clicks through to the existing case study, and restores on Back', async ({ page }) => {
  await openScene(page);
  await projects(page).click();
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await page.mouse.move(720, 480);
  await expect(page.locator('.route-gallery-ui')).toHaveAttribute('data-hovered', 'true');
  await page.screenshot({ path: 'artifacts/roadside-billboard/hover.png' });
  await page.mouse.move(20, 500);
  await expect(page.locator('.route-gallery-ui')).not.toHaveAttribute('data-hovered');
  await page.mouse.click(720, 480);
  await expect(page).toHaveURL(/\/work\/still-dental\/$/);
  await expect(page.locator('h1')).toHaveText('Still Dental');
  await page.goBack();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-gallery', 'active');
  await expect(page).toHaveURL(/#works$/);
});

test('keyboard link and film switch keep one active presentation without losing carousel links', async ({ page }) => {
  await openScene(page);
  await projects(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'View Still Dental case study' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/still-dental\/$/);
  await page.goBack();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-gallery', 'active');
  await page.getByRole('button', { name: 'View All Projects' }).click();
  await expect(page).toHaveURL(/\?gallery=projects#works$/);
  await expect(page.locator('#works')).toHaveJSProperty('inert', false);
  await expect(page.locator('.immersive-hero')).toHaveJSProperty('inert', true);
  await expect(page.locator('#works-heading')).toBeInViewport();
  const first = page.locator('.film-cell').first();
  await first.locator('.film-reveal').focus();
  await page.keyboard.press('Enter');
  await first.getByRole('link', { name: /View Project/ }).click();
  await expect(page).toHaveURL(/\/work\/still-dental\/$/);
});

test('gallery deep links and mid-journey refresh restore while cinematic Contact keeps the archive inert', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  await seek(page, (await galleryEnd(page)) * firstTravel(.6), -94);
  await page.waitForTimeout(200); // Allow the existing debounced scroll persistence to settle.
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 94), { timeout: 15_000 }).toBeLessThan(0.2);
  await page.goto('/#works');
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-gallery', 'active');
  await page.reload();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-gallery', 'active');
  await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.locator('#works')).toHaveJSProperty('inert', true);
  await page.goto('/#works-film');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('.route-gallery-presentation')).toHaveAttribute('data-presentation', 'active');
  await expect(page.locator('.route-gallery-presentation')).toHaveAttribute('role', 'dialog');
  await expect(page.locator('#works-heading')).toBeInViewport();
  await expect(page.locator('.route-gallery-ui')).toHaveJSProperty('inert', true);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('.route-gallery-presentation')).not.toHaveAttribute('data-presentation', 'active');
});

test('pending preview stays behind readiness; a failed preview falls back to the HTML gallery', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/images/dental-home.webp', async route => { await gate; await route.abort(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await expect(page.locator('h1')).toBeVisible();
  release();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.locator('.route-journey')).not.toHaveAttribute('data-journey');
  await projects(page).click();
  await expect(page.locator('#works-heading')).toBeInViewport();
  await expect(page.locator('#works')).toHaveJSProperty('inert', false);
});
