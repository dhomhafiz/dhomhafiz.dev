import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`header follows sections at ${width} with ${reducedMotion} motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const projects = nav.getByRole('link', { name: 'Projects' });
    const contact = nav.getByRole('link', { name: 'Contact' });
    const active = nav.locator('[aria-current="location"]');
    await expect(active).toHaveCount(0);
    await projects.click();
    await expect(projects).toHaveAttribute('aria-current', 'location');
    await expect(active).toHaveCount(1);
    await expect(projects).toHaveCSS('background-color', 'rgb(247, 248, 249)');
    await contact.click();
    await expect(contact).toHaveAttribute('aria-current', 'location');
    await expect(projects).not.toHaveAttribute('aria-current');
    await expect(contact).toHaveCSS('color', 'rgb(17, 17, 17)');
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#works').offsetTop, behavior: 'instant' }));
    await expect(projects).toHaveAttribute('aria-current', 'location');
    await expect(contact).not.toHaveAttribute('aria-current');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(active).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
