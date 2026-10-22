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
    const home = nav.getByRole('link', { name: 'Home' });
    const projects = nav.getByRole('link', { name: 'Projects' });
    const contact = nav.getByRole('link', { name: 'Contact' });
    const active = nav.locator('[aria-current="location"]');
    await expect(home).toHaveAttribute('aria-current', 'location');
    await expect(active).toHaveCount(1);
    await expect(nav).toHaveCSS('flex-direction', width <= 700 ? 'row' : 'column');
    const labelTransform = await home.locator('.editorial-nav-label').evaluate(element => getComputedStyle(element).transform);
    expect(width <= 700 ? labelTransform === 'none' : labelTransform !== 'none').toBeTruthy();
    await expect(home).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await projects.click();
    await expect(projects).toHaveAttribute('aria-current', 'location');
    await expect(active).toHaveCount(1);
    await expect(projects).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(projects).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await contact.click();
    await expect(contact).toHaveAttribute('aria-current', 'location');
    await expect(projects).not.toHaveAttribute('aria-current');
    await expect(contact).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#works').offsetTop, behavior: 'instant' }));
    await expect(projects).toHaveAttribute('aria-current', 'location');
    await expect(contact).not.toHaveAttribute('aria-current');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(home).toHaveAttribute('aria-current', 'location');
    await home.focus();
    await expect(home).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(home).toHaveAttribute('aria-current', 'location');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width > 700) {
      await page.setViewportSize({ width, height: 500 });
      const bounds = await nav.boundingBox();
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(500);
      await expect(nav.locator('.editorial-nav-label').first()).toHaveCSS('font-size', '11px');
    }
  });
}

const immersiveNav = page => page.locator('.editorial-header nav');
async function expectDestination(page, destination) {
  const nav = immersiveNav(page);
  const selected = destination ?? 'home';
  await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
  for (const [href, name] of [['#top', 'home'], ['#works', 'projects'], ['#contact', 'contact']]) {
    const link = nav.locator(`a[href="${href}"]`);
    if (name === selected) await expect(link).toHaveAttribute('aria-current', 'location');
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
async function seekNavigationProgress(page, progress) {
  await page.evaluate(progress => {
    const track = document.querySelector('.route-journey');
    const hero = track.querySelector('.immersive-hero');
    scrollTo({ top: scrollY + track.getBoundingClientRect().top + (track.offsetHeight - hero.offsetHeight) * progress, behavior: 'instant' });
  }, progress);
  const projectStart = .4 * 8 / 12;
  const destination = progress < projectStart ? 'top' : progress <= .84 ? 'works' : 'contact';
  await expect(page.locator('.route-journey')).toHaveAttribute('data-navigation', destination);
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
  await immersiveNav(page).locator('a[href="#works"]').click();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await expectDestination(page, 'projects');
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
  await expectDestination(page, 'projects');
  await seekNavigationProgress(page, 0);
  await expectDestination(page, null);
  await seekNavigationProgress(page, .26);
  await expectDestination(page, null);
  await seekNavigationProgress(page, .27);
  await expectDestination(page, 'projects');

  for (const [progress, z, slug] of [[.3, -93, 'still-dental'], [.64, -158, 'netflix-squid-game-2']]) {
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
  await seekNavigationProgress(page, .47);
  await expectDestination(page, 'projects');
  await seekNavigationProgress(page, .83);
  await expectDestination(page, 'projects');
  await seekNavigationProgress(page, .84);
  await expectDestination(page, 'projects');
  await seekNavigationProgress(page, .85);
  await expectDestination(page, 'contact');
  await immersiveNav(page).locator('a[href="#contact"]').click();
  await expect(page.locator('#hire-heading')).toBeFocused();
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-contact', 'active');
  await expectDestination(page, 'contact');

  await seekNavigationProgress(page, .85);
  await expectDestination(page, 'contact');
  for (const progress of [.64, .47, .3, .27]) {
    await seekNavigationProgress(page, progress);
    if (progress === .64) await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
    if (progress === .3 || progress === .27) await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'still-dental');
    await expectDestination(page, 'projects');
  }
  await seekNavigationProgress(page, .26);
  await expectDestination(page, null);
  // The URL still contains #contact: destination state, not the hash, is authoritative.
  await seekDestination(page, 0, 6);
  await expectDestination(page, null);
  await page.reload();
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expectDestination(page, null);
});

test('a gallery opened over Hero activates Projects and dismissal restores Home', async ({ page }) => {
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
