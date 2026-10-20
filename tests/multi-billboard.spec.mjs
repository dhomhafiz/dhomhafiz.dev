import { test, expect } from '@playwright/test';
import { PerspectiveCamera, Vector3, MathUtils } from 'three';
import { openScene, cameraPose } from './helpers/route-camera.mjs';

const nav = page => page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true });
const hero = page => page.locator('.immersive-hero');
const ui = page => page.locator('.route-gallery-ui');
const title = page => page.locator('#gallery-heading');
async function scrollProgress(page, progress) {
  const end = await hero(page).evaluate(el => el.offsetHeight * 8);
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), end * progress);
}
async function settle(page, progress, z) {
  await scrollProgress(page, progress);
  await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(.1);
}
async function pointOnScreen(page, position) {
  const pose = await cameraPose(page), size = page.viewportSize();
  const camera = new PerspectiveCamera(58, size.width / size.height, .1, 420);
  camera.position.set(pose.x, pose.y, pose.z);
  camera.rotation.set(MathUtils.degToRad(pose.pitch), MathUtils.degToRad(pose.yaw), 0, 'YXZ');
  camera.updateMatrixWorld();
  const point = new Vector3(...position).project(camera);
  return { x: (point.x + 1) * size.width / 2, y: (1 - point.y) * size.height / 2 };
}

test('one continuous road visits both roadside screens and reverses through stable viewing intervals', async ({ page }) => {
  test.setTimeout(100_000);
  const previews = new Set();
  page.on('request', request => { if (/dental-home|squid-game-2-installation/.test(request.url())) previews.add(new URL(request.url()).pathname); });
  await openScene(page);
  await page.mouse.move(-10, -10);
  await page.screenshot({ path: 'artifacts/milestone-3b/hero.png' });
  expect(previews.has('/images/dental-home.webp')).toBe(true);
  expect(previews.has('/images/squid-game-2-installation.webp')).toBe(true);
  await settle(page, .45, -115);
  await expect(hero(page)).toHaveAttribute('data-billboard', 'still-dental');
  await expect(title(page)).toHaveText('Still Dental');
  await expect(ui(page).getByText('Concept Project · Healthcare')).toBeVisible();
  await expect(ui(page).getByRole('link', { name: 'View All Projects', exact: true })).toHaveAttribute('href', '#works-film');
  const dental = await cameraPose(page);
  expect(dental.x).toBeGreaterThan(0); expect(dental.yaw).toBeLessThan(0);
  await page.screenshot({ path: 'artifacts/milestone-3b/dental.png' });
  await settle(page, .48, -115);
  expect(Math.abs((await cameraPose(page)).yaw - dental.yaw)).toBeLessThan(.05);

  await settle(page, .72, -172.1328);
  await expect(ui(page)).toHaveJSProperty('inert', true);
  await expect(ui(page)).toHaveAttribute('aria-hidden', 'true');
  const highway = await cameraPose(page);
  expect(Math.abs(highway.yaw)).toBeLessThan(10);
  await page.screenshot({ path: 'artifacts/milestone-3b/highway.png' });
  await page.mouse.move(1439, 500);
  await expect.poll(async () => Math.abs((await cameraPose(page)).yaw - highway.yaw)).toBeGreaterThan(.3);
  expect(Math.abs((await cameraPose(page)).yaw - highway.yaw)).toBeLessThan(8);
  expect(Math.abs((await cameraPose(page)).z - highway.z)).toBeLessThan(.1);
  await page.mouse.move(-10, -10);

  await settle(page, .96, -194);
  await expect(hero(page)).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await expect(title(page)).toHaveText('Netflix Squid Game 2 Interactive Poll System');
  await expect(ui(page).getByText('Interactive Installation · Python')).toBeVisible();
  await expect(ui(page).getByRole('link', { name: 'View All Projects', exact: true })).toHaveAttribute('href', '#works-film');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(ui(page).getByRole('link', { name: /case study/ })).toHaveCount(1);
  await expect(page.locator('#works')).toHaveJSProperty('inert', true);
  const voting = await cameraPose(page);
  expect(voting.x).toBeLessThan(0); expect(voting.yaw).toBeGreaterThan(0);
  const beyond = await pointOnScreen(page, [0, 0, -250]);
  expect(beyond.x).toBeGreaterThan(0); expect(beyond.x).toBeLessThan(1440);
  expect(beyond.y).toBeLessThan(1000);
  await page.screenshot({ path: 'artifacts/milestone-3b/voting.png' });
  await settle(page, .99, -194);
  expect(Math.abs((await cameraPose(page)).yaw - voting.yaw)).toBeLessThan(.05);
  await page.setViewportSize({ width: 768, height: 1024 });
  await scrollProgress(page, .96);
  await expect(title(page)).toBeInViewport();
  await page.screenshot({ path: 'artifacts/milestone-3b/voting-narrow.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await settle(page, .72, -172.1328);
  await settle(page, .45, -115);
  expect(Math.abs((await cameraPose(page)).yaw - dental.yaw)).toBeLessThan(.1);
  await settle(page, 0, 6);
  await expect(ui(page)).toHaveJSProperty('inert', true);
  await expect(page.locator('.hero-copy-block')).toHaveCSS('opacity', '1');
});

test('both physical screens hover and open their own existing case study, restoring on Back', async ({ page }) => {
  test.setTimeout(100_000);
  await openScene(page);
  await nav(page).click();
  await expect(page).toHaveURL(/#works$/);
  for (const [slug, position, z] of [
    ['still-dental', [15.9, 13.6, -138], -115],
    ['netflix-squid-game-2', [-15.9, 13.6, -218], -194],
  ]) {
    await expect(hero(page)).toHaveAttribute('data-billboard', slug);
    await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(.1);
    const point = await pointOnScreen(page, position);
    await page.mouse.move(point.x, point.y);
    await expect(ui(page)).toHaveAttribute('data-hovered', 'true');
    await page.mouse.move(10, 500);
    await expect(ui(page)).not.toHaveAttribute('data-hovered');
    await page.mouse.click(point.x, point.y);
    await expect(page).toHaveURL(new RegExp(`/work/${slug}/$`));
    await expect(page.locator('h1')).toBeVisible();
    await page.goBack();
    await expect(hero(page)).toHaveAttribute('data-billboard', slug);
    await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
    if (slug === 'still-dental') await page.getByRole('link', { name: 'Next project', exact: true }).click();
  }
});

test('keyboard, next/previous, history, film-strip and Contact retain native destinations', async ({ page }) => {
  test.setTimeout(100_000);
  await openScene(page);
  await nav(page).focus(); await page.keyboard.press('Enter');
  await expect(title(page)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'View Still Dental case study' })).toBeFocused();
  await page.getByRole('link', { name: 'Next project', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(title(page)).toHaveText(/Squid Game/);
  await expect(title(page)).toBeFocused();
  await page.keyboard.press('Tab');
  const link = page.getByRole('link', { name: /View Netflix Squid Game 2.*case study/ });
  await expect(link).toBeFocused(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/netflix-squid-game-2\/$/);
  await page.goBack();
  await expect(hero(page)).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await page.getByRole('link', { name: 'Previous project', exact: true }).click();
  await expect(title(page)).toHaveText('Still Dental');
  // Labels change on zone entry; history commits when link navigation finishes.
  await expect(title(page)).toBeFocused();
  await page.goBack();
  await expect(hero(page)).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await page.goForward();
  await expect(hero(page)).toHaveAttribute('data-billboard', 'still-dental');
  await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.locator('#works')).toHaveJSProperty('inert', false);
  await nav(page).click();
  await page.getByRole('link', { name: 'View All Projects', exact: true }).click();
  await expect(page.locator('#works-heading')).toBeInViewport();
  await expect(ui(page)).toHaveJSProperty('inert', true);
});

test('second focus and highway reload restore; a fresh Works deep link starts at Dental', async ({ page }) => {
  test.setTimeout(100_000);
  await openScene(page); await nav(page).click();
  await expect(page).toHaveURL(/#works$/);
  await expect(title(page)).toBeFocused();
  for (const [progress, z] of [[.96, -194], [.72, -172.1328]]) {
    await settle(page, progress, z);
    await expect.poll(() => page.evaluate(() => Math.abs(Number(sessionStorage.getItem(`route-journey:${location.pathname}${location.search}${location.hash}`)) - scrollY))).toBeLessThan(1);
    await page.reload();
    await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
    await expect.poll(async () => Math.abs((await cameraPose(page)).z - z), { timeout: 15_000 }).toBeLessThan(.15);
    if (progress > .9) await expect(hero(page)).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
    else await expect(ui(page)).toHaveJSProperty('inert', true);
  }
  await page.goto('/work/still-dental/'); await page.goto('/#works');
  await expect(hero(page)).toHaveAttribute('data-billboard', 'still-dental');
  await expect(title(page)).toHaveText('Still Dental');
});

test('a pending second preview keeps both displays behind readiness', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/images/squid-game-2-installation.webp', async route => { await gate; await route.continue(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.locator('.route-canvas')).toHaveCSS('opacity', '0');
  await expect(page.locator('h1')).toBeVisible();
  release();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
});
