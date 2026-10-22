import { test, expect } from '@playwright/test';
import { openScene, cameraPose } from './helpers/route-camera.mjs';
import fs from 'node:fs';
import sharp from 'sharp';

const directory = 'artifacts/milestone-5c-ui';
const label = process.env.HERO_CAPTURE_LABEL || 'after';

test('captures Hero, Dental, Squid Game, Contact and mobile compositions', async ({ page, browser }) => {
  test.setTimeout(120_000);
  await openScene(page);
  await page.mouse.move(-10, -10);
  await page.evaluate(() => document.fonts.ready);
  const poses = {};
  const capture = async name => {
    poses[name] = await cameraPose(page);
    await page.screenshot({ path: `${directory}/${label}-${name}.png` });
  };
  await capture('hero');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await nav.getByRole('link', { name: 'Projects', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#gallery-heading')).toBeFocused();
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 93)).toBeLessThan(.001);
  await page.mouse.move(-10, -10);
  await capture('dental');
  await page.getByRole('link', { name: 'Next project' }).click();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 158)).toBeLessThan(.001);
  await page.mouse.move(-10, -10);
  await capture('squid');
  await nav.getByRole('link', { name: 'Contact', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hire-heading')).toBeFocused();
  await expect.poll(async () => Math.abs((await cameraPose(page)).z + 278)).toBeLessThan(.001);
  await page.mouse.move(-10, -10);
  await capture('contact');
  await expect(page.locator('canvas')).toHaveCount(1);
  fs.writeFileSync(`${directory}/${label}-poses.json`, JSON.stringify(poses, null, 2));

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
  const mobile = await context.newPage();
  await mobile.goto(new URL('/', page.url()).href);
  await mobile.evaluate(() => document.fonts.ready);
  await expect(mobile.locator('.editorial-brand')).toHaveText('dhomhafiz.dev');
  await expect(mobile.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await mobile.screenshot({ path: `${directory}/${label}-mobile.png` });
  await context.close();
});

for (const width of [390, 1440]) {
  test(`identity and navigation remain sharp, readable and operable at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // Measure layout stability from first paint, including font/avatar loading.
    await page.addInitScript(() => {
      window.heroLayoutShifts = [];
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.heroLayoutShifts.push(entry.value);
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const brand = page.locator('.editorial-brand');
    await expect(brand).toHaveText('dhomhafiz.dev');
    await expect(brand).toHaveAttribute('href', '#top');
    await expect(brand).toHaveCSS('font-weight', '700');
    const avatar = brand.locator('img');
    await expect(avatar).toHaveAttribute('alt', 'Dhom Hafiz');
    await expect(avatar).toHaveCSS('border-radius', '50%');
    const image = await avatar.evaluate(async image => {
      await image.decode();
      const box = image.getBoundingClientRect();
      return { naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, width: box.width, height: box.height };
    });
    expect(image.width).toBe(width <= 700 ? 40 : 44);
    expect(image.height).toBe(image.width);
    expect(image.naturalWidth).toBeGreaterThanOrEqual(image.width * 2);
    expect(image.naturalHeight).toBeGreaterThanOrEqual(image.height * 2);
    const source = await sharp('public/images/hafiz-cinematic-avatar.webp').metadata();
    expect(source.width).toBe(image.naturalWidth);
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const projects = nav.getByRole('link', { name: 'Projects', exact: true });
    const contact = nav.getByRole('link', { name: 'Contact', exact: true });
    await expect(projects).toHaveCSS('color', 'rgb(191, 200, 208)');
    await expect(contact).toHaveCSS('color', 'rgb(191, 200, 208)');
    await projects.focus();
    await expect(projects).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(projects).toHaveAttribute('aria-current', 'location');
    await expect(projects).toHaveCSS('color', 'rgb(255, 255, 255)');
    await contact.focus(); await page.keyboard.press('Enter');
    await expect(contact).toHaveAttribute('aria-current', 'location');
    await expect(contact).toHaveCSS('color', 'rgb(255, 255, 255)');
    await brand.focus(); await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    const boxes = await page.locator('.editorial-brand, .editorial-header nav, .editorial-hero-copy, .hero-scroll-indicator')
      .evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }; }));
    for (let i = 0; i < boxes.length; i++) {
      expect(boxes[i].x).toBeGreaterThanOrEqual(0);
      expect(boxes[i].right).toBeLessThanOrEqual(width);
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y).toBe(true);
      }
    }
    expect(await page.evaluate(() => window.heroLayoutShifts.reduce((a, b) => a + b, 0))).toBeLessThan(.01);
    await expect(page.locator('canvas')).toHaveCount(0);
  });
}
