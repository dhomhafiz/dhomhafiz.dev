import { test, expect } from '@playwright/test';

for (const width of [390, 1280, 1920]) test(`WhatsApp hover remains active from every edge at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  const contact = page.locator('#contact');
  const button = contact.locator('a.hire-button');
  await expect.poll(() => contact.locator('.contact-title').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1, 3);
  const rect = await button.boundingBox();
  const cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2;
  const paths = {
    top: [[cx, rect.y - 25], [cx, rect.y + 2]],
    left: [[rect.x - 25, cy], [rect.x + 2, cy]],
    right: [[rect.x + rect.width + 25, cy], [rect.x + rect.width - 2, cy]],
    bottom: [[cx, rect.y + rect.height + 25], [cx, rect.y + rect.height - 2]],
  };
  for (const [direction, [from, to]] of Object.entries(paths)) {
    await test.step(`enter from ${direction}`, async () => {
      await page.mouse.move(...from);
      await expect(button).toHaveCSS('background-color', 'rgb(23, 23, 23)');
      await page.mouse.move(...to, { steps: 12 });
      await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      expect(await button.evaluate((el, point) => el.contains(document.elementFromPoint(...point)), to)).toBe(true);
      const hovered = await button.boundingBox();
      expect(hovered.y).toBeCloseTo(rect.y, 1);
      expect(hovered.x).toBeCloseTo(rect.x, 1);
      await expect(button).toHaveCSS('transform', 'none');
    });
  }
});
