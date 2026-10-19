import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) test(`hero text flows in waves while navigation stays stable at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.editorial-hero .water-text')).toHaveCount(5);
  await expect(page.getByRole('heading', { name: 'MOHD HAFIZ', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('href', '#works');
  await expect(page.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '#contact');
  const readings = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('.editorial-hero .water-text')];
    const links = [...document.querySelectorAll('.hero-bottom-bar nav a')];
    const readLinks = () => links.map(el => ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
    const before = readLinks();
    const motions = groups.map(group => {
      const letters = [...group.querySelectorAll('.water-letter')];
      const animations = letters.map(el => el.getAnimations()[0]);
      animations.forEach(animation => { animation.pause(); animation.currentTime = 2000; });
      const start = letters.map(el => new DOMMatrix(getComputedStyle(el).transform).m42);
      animations.forEach(animation => animation.currentTime = 3200);
      const end = letters.map(el => new DOMMatrix(getComputedStyle(el).transform).m42);
      return { start, end };
    });
    return { before, after: readLinks(), motions };
  });
  expect(readings.after).toEqual(readings.before);
  for (const { start, end } of readings.motions) {
    expect(Math.max(...start) - Math.min(...start)).toBeGreaterThan(.2);
    expect(end.some((position, index) => Math.abs(position - start[index]) > .2)).toBe(true);
  }
  await expect(page.locator('.hero-display-name .water-letter').first()).toHaveCSS('color', 'rgb(214, 214, 210)');
  for (const link of await page.locator('.hero-bottom-bar nav a').all()) {
    const rect = await link.boundingBox();
    for (const point of [[rect.x + rect.width / 2, rect.y + 2], [rect.x + 2, rect.y + rect.height / 2], [rect.x + rect.width - 2, rect.y + rect.height / 2], [rect.x + rect.width / 2, rect.y + rect.height - 2]]) {
      await page.mouse.move(...point);
      expect(await link.evaluate((el, position) => el.contains(document.elementFromPoint(...position)), point)).toBe(true);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/hero-water-${width}.png` });
});

test('reduced motion keeps all hero text still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const letters = await page.locator('.editorial-hero .water-letter').evaluateAll(elements => elements.map(el => ({ animation: getComputedStyle(el).animationName, transform: getComputedStyle(el).transform })));
  for (const letter of letters) expect(letter).toEqual({ animation: 'none', transform: 'none' });
});
