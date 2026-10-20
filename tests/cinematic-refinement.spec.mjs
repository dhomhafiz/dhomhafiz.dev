import { test, expect } from '@playwright/test';

const viewports = [
  [375, 812], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080],
  [375, 600], [390, 568], [767, 720], [768, 600], [1024, 600], [1440, 700], [1920, 700],
];
for (const [width, height] of viewports) test(`cinematic composition at ${width}x${height}`, async ({ page }) => {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const header = page.locator('.editorial-header');
  await expect(header).toHaveAttribute('data-surface', 'top');
  const geometry = await page.evaluate(() => {
    const header = document.querySelector('.editorial-header');
    const hero = document.querySelector('.editorial-hero');
    const copy = document.querySelector('.hero-copy-block');
    const heading = document.querySelector('h1');
    const arrow = document.querySelector('.hero-scroll-arrow');
    const video = document.querySelector('.route-surface');
    const rect = el => el.getBoundingClientRect().toJSON();
    return {
      header: rect(header), hero: rect(hero), copy: rect(copy), heading: rect(heading), video: rect(video),
      arrow: getComputedStyle(arrow).display === 'none' ? null : rect(arrow),
      copyBackground: getComputedStyle(copy).backgroundColor, copyRadius: getComputedStyle(copy).borderRadius,
      gradient: getComputedStyle(document.querySelector('.route-scrim')).backgroundImage,
      headerOpacity: getComputedStyle(header, '::before').opacity,
      overflow: document.documentElement.scrollWidth > innerWidth,
      links: [...header.querySelectorAll('nav a')].map(rect),
    };
  });
  expect(geometry.hero.top).toBeCloseTo(0, 0);
  expect(geometry.hero.height).toBeGreaterThanOrEqual(height - 1);
  expect(geometry.copy.top).toBeGreaterThan(geometry.header.bottom + 16);
  expect(geometry.copy.bottom).toBeLessThan(geometry.hero.bottom - 20);
  expect((geometry.copy.top + geometry.copy.height / 2) / geometry.hero.height).toBeLessThan(.7);
  expect(geometry.video.width).toBeCloseTo(width, 0);
  expect(geometry.video.height).toBeCloseTo(geometry.hero.height, 0);
  expect(geometry.copyBackground).toBe('rgba(0, 0, 0, 0)');
  expect(geometry.copyRadius).toBe('0px');
  expect(geometry.gradient).toContain('linear-gradient');
  expect(geometry.headerOpacity).toBe('0');
  expect(geometry.overflow).toBe(false);
  expect(geometry.links[1].right).toBeLessThanOrEqual(width);
  if (geometry.arrow) expect(geometry.arrow.top).toBeGreaterThan(geometry.heading.bottom + 16);
  await page.screenshot({ path: `artifacts/cinematic-top-${width}x${height}.png` });
  // Check the two light sections with the fixed header, including anchor clearance.
  for (const target of ['works', 'contact']) {
    await page.locator(`.editorial-header nav a[href="#${target}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${target}$`));
    await expect(header).toHaveAttribute('data-surface', 'scrolled');
    await expect.poll(() => header.evaluate(el => getComputedStyle(el, '::before').opacity)).toBe('1');
    await expect(header.locator(`nav a[href="#${target}"]`)).toHaveAttribute('aria-current', 'location');
    await expect(header.locator(`nav a[href="#${target}"]`)).toHaveCSS('color', 'rgb(17, 17, 17)');
    const position = await page.locator(`#${target}`).boundingBox();
    expect(position.y).toBeGreaterThanOrEqual(geometry.header.height - 1);
    if (height >= 768) await page.screenshot({ path: `artifacts/cinematic-${target}-${width}x${height}.png` });
  }
});

test('header shares the hero scroll lifecycle with stable state changes and retained motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const header = page.locator('.editorial-header');
  await expect(header).toHaveAttribute('data-surface', 'top');
  const initial = await header.boundingBox();
  await expect(page.locator('.route-surface')).toHaveCSS('transform', 'none');
  const heading = page.locator('.hero-heading-line-first');
  await expect(heading).toHaveCSS('animation-name', 'none');
  for (const amount of [50, 24, 16, 30]) {
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), amount);
    await expect(header).toHaveAttribute('data-surface', 'scrolled');
    expect(await header.boundingBox()).toEqual(initial);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(header).toHaveAttribute('data-surface', 'top');
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await expect(page.locator('.route-surface')).not.toHaveCSS('transform', 'none');
  // HTML headings stay still while the 3D camera moves.
  const bounds = await page.locator('.hero-heading-line').evaluateAll(lines => lines.map(line => line.getBoundingClientRect().toJSON()));
  for (const bound of bounds) { expect(bound.left).toBeGreaterThanOrEqual(0); expect(bound.right).toBeLessThanOrEqual(1440); }
  await page.locator('.editorial-header nav a[href="#works"]').click();
  const appearance = await header.evaluate(el => ({ surface: getComputedStyle(el, '::before').backgroundColor, blur: getComputedStyle(el, '::before').backdropFilter, transition: getComputedStyle(el, '::before').transitionProperty }));
  expect(appearance.surface).toContain('0.9');
  expect(appearance.blur).toBe('blur(10px)');
  expect(appearance.transition).toBe('opacity');
});
