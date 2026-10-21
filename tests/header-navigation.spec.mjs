import { test, expect } from '@playwright/test';
import { openScene, cameraPose } from './helpers/route-camera.mjs';

for (const width of [390, 1440]) for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`header follows sections at ${width} with ${reducedMotion} motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    // Exercise section-position navigation without the optional immersive track.
    await page.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 }));
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

const immersiveNav = page => page.locator('.editorial-header nav');
async function expectDestination(page, destination) {
  const nav = immersiveNav(page);
  await expect(nav.locator('[aria-current="location"]')).toHaveCount(destination ? 1 : 0);
  for (const [href, name] of [['#works', 'projects'], ['#contact', 'contact']]) {
    const link = nav.locator(`a[href="${href}"]`);
    if (name === destination) await expect(link).toHaveAttribute('aria-current', 'location');
    else await expect(link).not.toHaveAttribute('aria-current');
  }
}
async function seekDestination(page, progress, z) {
  await page.evaluate(progress => {
    const track = document.querySelector('.route-journey');
    const hero = track.querySelector('.immersive-hero');
    scrollTo({ top: scrollY + track.getBoundingClientRect().top + (track.offsetHeight - hero.offsetHeight) * progress, behavior: 'instant' });
  }, progress);
  await expect.poll(async () => Math.abs((await cameraPose(page)).z - z)).toBeLessThan(.03);
}

test('immersive navigation follows Hero, both billboards, gallery and Contact in both directions', async ({ page }) => {
  test.setTimeout(120_000);
  await openScene(page);
  await page.mouse.move(-10, -10);
  await expectDestination(page, null);
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expectDestination(page, null);

  for (const [progress, z, slug] of [[.3, -115, 'still-dental'], [.64, -194, 'netflix-squid-game-2']]) {
    await seekDestination(page, progress, z);
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', slug);
    await expectDestination(page, 'projects');
    await page.getByRole('button', { name: 'View All Projects' }).click();
    await expect(page.locator('.route-gallery-presentation')).toHaveAttribute('data-presentation', 'active');
    // The header is inert behind the modal, but its navigation state must remain correct.
    await expectDestination(page, 'projects');
    await page.keyboard.press('Escape');
    await expect(page.locator('.route-gallery-presentation')).not.toHaveAttribute('data-presentation', 'active');
    await expectDestination(page, 'projects');
  }
  await immersiveNav(page).locator('a[href="#contact"]').click();
  await expect(page.locator('#hire-heading')).toBeFocused();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-contact', 'active');
  await expectDestination(page, 'contact');

  for (const [progress, z, slug] of [[.64, -194, 'netflix-squid-game-2'], [.3, -115, 'still-dental']]) {
    await seekDestination(page, progress, z);
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', slug);
    await expectDestination(page, 'projects');
  }
  // The URL still contains #contact: destination state, not the hash, is authoritative.
  await seekDestination(page, 0, 6);
  await expectDestination(page, null);
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expectDestination(page, null);
});

test('a gallery opened over Hero activates Projects and dismissal restores neither pill', async ({ page }) => {
  test.setTimeout(90_000);
  await openScene(page);
  await page.goto('/?gallery=projects');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('.route-gallery-presentation')).toHaveAttribute('data-presentation', 'active');
  await expectDestination(page, 'projects');
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('.route-gallery-presentation')).toHaveAttribute('data-presentation', 'active');
  await expectDestination(page, 'projects');
  await page.keyboard.press('Escape');
  await expect(page.locator('.route-gallery-presentation')).not.toHaveAttribute('data-presentation', 'active');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expectDestination(page, null);
});
