import { test, expect } from '@playwright/test';
import { openScene, cameraPose } from './helpers/route-camera.mjs';

async function observe(page) {
  const errors = [], warnings = [];
  let phase = 'initial load';
  await page.exposeBinding('recordNavigationRejection', (_, reason) => errors.push({ phase, type: 'unhandledrejection', ...reason }));
  await page.addInitScript(() => {
    // Observe without preventDefault, promise catches, or modifying browser APIs.
    addEventListener('unhandledrejection', event => window.recordNavigationRejection({
      name: event.reason?.name, message: event.reason?.message, stack: event.reason?.stack, url: location.href,
    }));
  });
  page.on('pageerror', error => errors.push({ phase, type: 'pageerror', message: error.message, stack: error.stack }));
  page.on('console', message => {
    if (message.type() === 'error') errors.push({ phase, type: 'console', message: message.text() });
    if (message.type() === 'warning') warnings.push({ phase, message: message.text(), location: message.location() });
  });
  return {
    phase: value => { phase = value; },
    verify: async info => {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await info.attach('navigation-console', { body: JSON.stringify({ errors, warnings }, null, 2), contentType: 'application/json' });
      expect(errors).toEqual([]);
    },
  };
}

test('normal-motion load, gallery history and case-study document navigation have no console errors or promise rejections', async ({ page }, info) => {
  test.setTimeout(90_000);
  const log = await observe(page);
  await openScene(page);
  for (const [progress, slug, z] of [[.45, 'still-dental', -93], [.96, 'netflix-squid-game-2', -158]]) {
    log.phase(`arrive at ${slug}`);
    await page.evaluate(p => scrollTo({ top: document.querySelector('.immersive-hero').offsetHeight * 8 * p, behavior: 'instant' }), progress);
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', slug);
    await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(.02);
    const scroll = await page.evaluate(() => scrollY);
    const opener = page.getByRole('button', { name: 'View All Projects' });
    log.phase(`open ${slug} gallery`);
    await opener.focus(); await page.keyboard.press('Enter');
    const back = page.getByRole('button', { name: 'Back to 3D Experience' });
    await expect(back).toBeFocused();
    const pose = await cameraPose(page);
    log.phase('Escape dismissal'); await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(1);
    const restored = await cameraPose(page);
    for (const key of ['x', 'y', 'z', 'yaw', 'pitch']) expect(Math.abs(restored[key] - pose[key])).toBeLessThan(.03);
    log.phase('gallery browser Forward'); await page.goForward(); await expect(back).toBeFocused();
    log.phase('gallery return control'); await back.click(); await expect(opener).toBeFocused();
  }
  log.phase('case-study link from gallery');
  await page.getByRole('button', { name: 'View All Projects' }).click();
  await expect(page.getByRole('button', { name: 'Back to 3D Experience' })).toBeFocused();
  await page.locator('.film-reveal').first().focus(); await page.keyboard.press('Enter');
  await page.locator('.film-cell').first().getByRole('link', { name: /View Project/ }).click();
  await expect(page.locator('h1')).toHaveText('Still Dental');
  log.phase('case-study browser Back'); await page.goBack();
  await expect(page.getByRole('button', { name: 'Back to 3D Experience' })).toBeFocused();
  log.phase('case-study browser Forward'); await page.goForward(); await expect(page.locator('h1')).toHaveText('Still Dental');
  log.phase('case-study ordinary link to home');
  await page.locator('.case-header').getByRole('link', { name: 'Back to Projects' }).click();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  log.phase('home reload'); await page.reload();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await log.verify(info);
});

test('reduced-motion HTML gallery and case-study Back remain free of console errors and promise rejections', async ({ page }, info) => {
  const log = await observe(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?gallery=projects#works-film');
  await expect(page.getByRole('button', { name: 'Back to 3D Experience' })).toBeFocused();
  await expect(page.locator('canvas')).toHaveCount(0);
  log.phase('reduced-motion Escape'); await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#works-heading')).toBeFocused();
  log.phase('fallback case-study navigation');
  await page.locator('.film-reveal').first().focus(); await page.keyboard.press('Enter');
  await page.locator('.film-cell').first().getByRole('link', { name: /View Project/ }).click();
  await expect(page.locator('h1')).toHaveText('Still Dental');
  log.phase('fallback case-study Back'); await page.goBack();
  await expect(page.locator('#works-heading')).toBeInViewport();
  await expect(page.locator('canvas')).toHaveCount(0);
  await log.verify(info);
});
