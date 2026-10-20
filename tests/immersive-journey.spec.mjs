import { test, expect } from '@playwright/test';
import { cameraPose, openScene } from './helpers/route-camera.mjs';

const projects = page => page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true });
async function endScroll(page) {
  return page.locator('.immersive-hero').evaluate(hero => hero.offsetHeight * 8 * .45);
}
async function seek(page, top, z) {
  const entry = await endScroll(page);
  const local = top / entry;
  const progress = local >= 1 ? .45 : .4 * (.5 - Math.sin(Math.asin(1 - 2 * local) / 3));
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), entry / .45 * progress);
  await expect.poll(async () => Math.abs((await cameraPose(page)).z - z), { timeout: 10_000 }).toBeLessThan(0.15);
}

test('native forward and reverse scroll traverse the real pinned scene into Works', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  await page.mouse.move(-10, -10);
  const end = await endScroll(page);
  expect(end).toBeGreaterThan(2500);
  const cases = [[0, 6], [.2, -24], [.4, -65], [.6, -94], [.8, -108], [1, -115]];
  for (const [index, [fraction, z]] of cases.entries()) {
    await seek(page, end * fraction, z);
    expect(Math.abs((await page.locator('.immersive-hero').boundingBox()).y)).toBeLessThan(1);
    const pose = await cameraPose(page);
    expect(Math.abs(pose.x)).toBeLessThan(6.2);
    expect(pose.y).toBeGreaterThan(2.2);
    expect(pose.y).toBeLessThan(4.7);
    expect(Math.abs(pose.yaw)).toBeLessThan(35);
    expect(Math.abs(pose.pitch)).toBeLessThan(20);
    await page.screenshot({ path: `artifacts/milestone-2b/forward-${index}.png` });
  }
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), end * 0.85);
  await expect.poll(async () => (await cameraPose(page)).z).toBeLessThan(-85);
  await page.screenshot({ path: 'artifacts/milestone-2b/arrival.png' });
  await seek(page, end, -115);
  await expect(page.locator('#gallery-heading')).toBeInViewport();
  await expect(page.locator('.route-gallery-ui')).toHaveJSProperty('inert', false);
  await expect(projects(page)).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('canvas')).toHaveCount(1);
  for (const [fraction, z] of cases.slice(0, -1).reverse()) await seek(page, end * fraction, z);
  await expect(page.locator('.hero-copy-block')).toHaveCSS('opacity', '1');
  await expect(projects(page)).not.toHaveAttribute('aria-current');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Projects can be interrupted, restarted, and navigated with keyboard and history', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  await projects(page).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(250);
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(400);
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(600);
  expect(Math.abs(await page.evaluate(() => scrollY) - stopped)).toBeLessThan(2);
  await expect(page).not.toHaveURL(/#works$/);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await projects(page).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(await endScroll(page), 0);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goForward();
  await expect(page).toHaveURL(/#works$/);
  await expect(page.locator('#gallery-heading')).toBeInViewport();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
});

test('rapid scroll and pointer reversals stay bounded, then settle at the same camera path', async ({ page }) => {
  await openScene(page);
  const end = await endScroll(page);
  for (const [fraction, x, y] of [[.8, 1, 1], [.1, 1439, 999], [.95, 1, 999], [.3, 1439, 1]]) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), end * fraction);
    await page.mouse.move(x, y);
    const pose = await cameraPose(page);
    expect(pose.z).toBeGreaterThanOrEqual(-157.1);
    expect(pose.z).toBeLessThanOrEqual(6.1);
    expect(Math.abs(pose.yaw)).toBeLessThan(42);
    expect(Math.abs(pose.pitch)).toBeLessThan(24);
  }
  await page.mouse.move(-10, -10);
  await seek(page, end * .4, -65);
  const settled = await cameraPose(page);
  await page.mouse.move(1439, 500);
  await page.waitForTimeout(900);
  const mouse = await cameraPose(page);
  expect(mouse.z).toBeCloseTo(settled.z, 0);
  expect(Math.abs(mouse.yaw - settled.yaw)).toBeGreaterThan(1);
  expect(Math.abs(mouse.yaw - settled.yaw)).toBeLessThan(8);
  await seek(page, 0, 6);
});

test('refresh restores mid-journey scroll; Works deep links and film links remain usable', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  const end = await endScroll(page);
  await seek(page, end * .4, -65);
  const saved = await page.evaluate(() => scrollY);
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY - history.state.routeJourneyScroll))).toBeLessThan(2);
  expect(Math.abs(await page.evaluate(() => scrollY) - saved)).toBeLessThan(2);
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 65), { timeout: 15_000 }).toBeLessThan(0.15);
  // A fresh visit must clear the previous reload backup rather than resurrect it.
  // Navigating the identical URL can itself behave as a reload in Chromium.
  await page.goto('/work/still-dental/');
  await page.goto('/');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goto('/#works');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('#gallery-heading')).toBeInViewport();
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('#gallery-heading')).toBeInViewport();
  await page.getByRole('link', { name: 'View All Projects', exact: true }).click();
  const cell = page.locator('.film-cell').first();
  await cell.locator('.film-reveal').focus();
  await page.keyboard.press('Enter');
  const link = cell.getByRole('link', { name: /View Project/ });
  const href = await link.getAttribute('href');
  await link.click();
  await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
  await expect(page.locator('h1')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('#works-heading')).toBeInViewport();
});

test('pause keeps the canvas frozen while scroll advances, then resumes onto the current path', async ({ page }) => {
  await openScene(page);
  const end = await endScroll(page);
  await page.getByRole('button', { name: 'Pause scene', exact: true }).click();
  const frozen = await cameraPose(page);
  const progress = .4 * (.5 - Math.sin(Math.asin(.6) / 3));
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), end / .45 * progress);
  await page.waitForTimeout(500);
  expect(await cameraPose(page)).toEqual(frozen);
  await page.getByRole('button', { name: 'Resume scene', exact: true }).click();
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 24)).toBeLessThan(0.15);
});

for (const failure of ['reduced motion', 'context loss']) {
  test(`${failure} releases the enhanced track while retaining the Works destination`, async ({ page }) => {
    await openScene(page);
    await seek(page, await endScroll(page), -115);
    if (failure === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await page.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await expect(page.locator('.route-journey')).not.toHaveAttribute('data-journey');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('#works-heading')).toBeInViewport();
    const after = await page.locator('#works').evaluate(works => works.getBoundingClientRect().top);
    expect(after).toBeGreaterThanOrEqual(60);
    expect(after).toBeLessThan(100);
    await expect(projects(page)).toHaveAttribute('aria-current', 'location');
  });
}
