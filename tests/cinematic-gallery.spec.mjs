import { test, expect } from '@playwright/test';
import { openScene, cameraPose } from './helpers/route-camera.mjs';

const archive = page => page.getByRole('dialog', { name: 'Selected Works' });
const open = page => page.getByRole('button', { name: 'View All Projects' });
const back = page => page.getByRole('button', { name: 'Back to 3D Experience' });
async function arrive(page, progress, slug) {
  await page.evaluate(p => scrollTo({ top: document.querySelector('.immersive-hero').offsetHeight * 8 * p, behavior: 'instant' }), progress);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', slug);
  const z = progress > .9 ? -194 : -115;
  await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(.02);
}

for (const [progress, slug] of [[.45, 'still-dental'], [.96, 'netflix-squid-game-2']]) {
  test(`archive freezes and restores ${slug}, with one reel and keyboard containment`, async ({ page }) => {
    await openScene(page);
    await arrive(page, progress, slug);
    await open(page).focus();
    await page.keyboard.press('Enter');
    await expect(back(page)).toBeFocused();
    const frozen = await cameraPose(page);
    const scroll = await page.evaluate(() => scrollY);
    await expect(archive(page)).toBeVisible();
    await expect(page.locator('.film-reel')).toHaveCount(1);
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('.route-journey')).toHaveJSProperty('inert', true);
    await expect(page.locator('.skip-link')).toHaveJSProperty('inert', true);
    await page.mouse.move(-10, -10);
    await page.mouse.move(600, 500);
    await page.mouse.wheel(0, 750);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    expect(await cameraPose(page)).toEqual(frozen);
    await back(page).focus();
    await page.keyboard.press('Shift+Tab');
    expect(await archive(page).evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(archive(page)).toHaveCount(0);
    await expect(open(page)).toBeFocused();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', slug);
    expect(Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(1);
    const restored = await cameraPose(page);
    for (const key of ['x', 'y', 'z', 'yaw', 'pitch']) expect(Math.abs(restored[key] - frozen[key])).toBeLessThan(.03);
    await expect(page.locator('.skip-link')).toHaveJSProperty('inert', false);
  });
}

test('Back, Forward, refresh, rapid dismissal, carousel and case-study Back preserve the archive', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  await arrive(page, .96, 'netflix-squid-game-2');
  await open(page).click();
  await expect(back(page)).toBeFocused();
  await page.goBack();
  await expect(archive(page)).toHaveCount(0);
  await page.goForward();
  await expect(back(page)).toBeFocused();
  // Reverse an in-flight dismissal; its old completion must not unlock the page.
  await page.goBack();
  await page.goForward();
  await expect(back(page)).toBeFocused();
  await expect(page.locator('.route-journey')).toHaveJSProperty('inert', true);
  await page.reload();
  await expect(back(page)).toBeFocused();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await back(page).click();
  await expect(archive(page)).toHaveCount(0);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 194)).toBeLessThan(.1);
  await open(page).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(archive(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/gallery=projects/);
  await open(page).click();
  await expect(back(page)).toBeFocused();
  const viewport = page.locator('.film-viewport');
  await viewport.focus(); await page.keyboard.press('End');
  await expect(page.locator('.film-cell').last()).toHaveAttribute('data-active', 'true');
  await page.locator('.film-cell').last().locator('.film-reveal').focus();
  await page.keyboard.press('Enter');
  await page.locator('.film-cell').last().getByRole('link', { name: /View Project/ }).click();
  await expect(page).toHaveURL(/\/work\/netflix-squid-game-2\/$/);
  await page.goBack(); await expect(back(page)).toBeFocused();
  await expect(page.locator('.film-reel')).toHaveCount(1);
  await page.screenshot({ path: 'artifacts/cinematic-gallery/desktop.png' });
});

test('resize preserves normalized journey position and an existing manual pause', async ({ page }) => {
  await openScene(page);
  await arrive(page, .96, 'netflix-squid-game-2');
  await page.getByRole('button', { name: 'Pause scene', exact: true }).click();
  await open(page).click();
  await expect(back(page)).toBeFocused();
  await page.setViewportSize({ width: 1100, height: 800 });
  await back(page).click();
  await expect(archive(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Resume scene', exact: true })).toBeVisible();
  expect(await page.evaluate(() => scrollY / (document.querySelector('.immersive-hero').offsetHeight * 8))).toBeCloseTo(.96, 3);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
});

test('Forward after further highway scrolling returns to the current billboard without replaying the old camera path', async ({ page }) => {
  await openScene(page);
  await arrive(page, .45, 'still-dental');
  await open(page).click(); await expect(back(page)).toBeFocused();
  await page.goBack(); await expect(archive(page)).toHaveCount(0);
  await arrive(page, .96, 'netflix-squid-game-2');
  await page.goForward(); await expect(back(page)).toBeFocused();
  const pose = await cameraPose(page);
  await back(page).click(); await expect(archive(page)).toHaveCount(0);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  expect(Math.abs((await cameraPose(page)).z - pose.z)).toBeLessThan(.03);
});

test('switching to reduced motion while open releases the archive to accessible fallback HTML', async ({ page }) => {
  await openScene(page);
  await arrive(page, .45, 'still-dental');
  await open(page).click(); await expect(back(page)).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(archive(page)).toHaveCount(0);
  await expect(page.locator('#works')).toHaveJSProperty('inert', false);
  await expect(page.locator('#works-heading')).toBeFocused();
  await expect(page.locator('#works-heading')).toBeInViewport();
});

for (const fallback of ['desktop', 'reduced motion', 'no WebGL', 'mobile']) {
  test(`direct archive URL remains usable with ${fallback}`, async ({ page }) => {
    if (fallback === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (fallback === 'mobile') await page.setViewportSize({ width: 390, height: 844 });
    if (fallback === 'no WebGL') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
        return /webgl/.test(kind) ? null : original.call(this, kind, ...args);
      };
    });
    await page.goto('/?gallery=projects#works-film');
    await expect(back(page)).toBeFocused();
    await expect(page.locator('.film-reel')).toHaveCount(1);
    await expect(page.locator('#works')).toHaveJSProperty('inert', false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (fallback === 'mobile') await page.screenshot({ path: 'artifacts/cinematic-gallery/mobile.png' });
    await page.keyboard.press('Escape');
    await expect(archive(page)).toHaveCount(0);
    await expect(page).toHaveURL(/\/#works-film$/);
    await expect(page.locator('#works-heading')).toBeFocused();
    await expect(page.locator('#works-heading')).toBeInViewport();
    await expect(page.locator('.editorial-header')).toHaveJSProperty('inert', false);
  });
}
