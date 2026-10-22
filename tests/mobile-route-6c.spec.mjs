import { test, expect } from '@playwright/test';
import { Euler, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import fs from 'node:fs';

const screenshotDirectory = 'artifacts/milestone-6c';
fs.mkdirSync(screenshotDirectory, { recursive: true });

const surface = page => page.locator('.route-surface');
const nav = page => page.getByRole('navigation', { name: 'Main navigation' });
const destinations = [
  { slug: 'still-dental', position: [15.9, 13.6, -115], rotationY: -0.45, width: 15.1, height: 10.6 },
  { slug: 'netflix-squid-game-2', position: [-15.9, 15.6, -182], rotationY: 0.45, width: 15.1, height: 11.425 },
];

async function openMobile(page, viewport) {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    const uniforms = new WeakSet();
    const proto = WebGL2RenderingContext.prototype;
    const locate = proto.getUniformLocation;
    proto.getUniformLocation = function(program, name) {
      const location = locate.call(this, program, name);
      if (name === 'viewMatrix' && location) uniforms.add(location);
      return location;
    };
    const upload = proto.uniformMatrix4fv;
    proto.uniformMatrix4fv = function(location, transpose, value, ...rest) {
      if (uniforms.has(location)) window.cameraView = Array.from(value);
      return upload.call(this, location, transpose, value, ...rest);
    };
  });
  await page.goto('/');
  await expect(surface(page)).toHaveAttribute('data-scene', 'ready');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
}

async function cameraPose(page) {
  const view = await page.evaluate(() => window.cameraView);
  expect(view).toHaveLength(16);
  const world = new Matrix4().fromArray(view).invert();
  const rotation = new Euler().setFromRotationMatrix(world, 'YXZ');
  const position = new Vector3().setFromMatrixPosition(world);
  return { position, rotation };
}

async function assertScreenFits(page, destination) {
  const pose = await cameraPose(page);
  const size = page.viewportSize();
  const camera = new PerspectiveCamera(58, size.width / size.height, 0.1, 420);
  camera.position.copy(pose.position);
  camera.rotation.copy(pose.rotation);
  camera.updateMatrixWorld();
  const center = new Vector3(...destination.position);
  const billboardRotation = new Euler(0, destination.rotationY, 0);
  for (const x of [-destination.width / 2, destination.width / 2]) {
    for (const y of [-destination.height / 2, destination.height / 2]) {
      const point = new Vector3(x, y, 0.06).applyEuler(billboardRotation).add(center).project(camera);
      expect(Math.abs(point.x), `${destination.slug} horizontal screen corner`).toBeLessThan(0.98);
      expect(Math.abs(point.y), `${destination.slug} vertical screen corner`).toBeLessThan(0.98);
    }
  }
}

async function screenPoint(page, destination) {
  const pose = await cameraPose(page);
  const size = page.viewportSize();
  const camera = new PerspectiveCamera(58, size.width / size.height, 0.1, 420);
  camera.position.copy(pose.position);
  camera.rotation.copy(pose.rotation);
  camera.updateMatrixWorld();
  const point = new Vector3(...destination.position).project(camera);
  return { x: (point.x + 1) * size.width / 2, y: (1 - point.y) * size.height / 2 };
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

test('mobile portrait and landscape keep the shared journey, screens, and controls framed', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    baseURL: test.info().project.use.baseURL });
  const page = await context.newPage();
  try {
    await openMobile(page, { width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: 'I AM HAFIZ.' })).toBeVisible();
    await page.screenshot({ path: `${screenshotDirectory}/portrait-hero.png` });

    await nav(page).getByRole('link', { name: 'Projects', exact: true }).tap();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[0].slug);
    await expect(page.locator('#gallery-heading')).toHaveText('Still Dental');
    await assertScreenFits(page, destinations[0]);
    expect(overlaps(await page.locator('#gallery-heading').boundingBox(), await page.getByRole('button', { name: 'Pause scene' }).boundingBox())).toBe(false);
    await page.screenshot({ path: `${screenshotDirectory}/portrait-dental.png` });

    const cdp = await context.newCDPSession(page);
    const scrollBeforeSwipe = await page.evaluate(() => scrollY);
    const swipePoint = await screenPoint(page, destinations[0]);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: swipePoint.x, y: swipePoint.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: swipePoint.x, y: swipePoint.y - 130 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: swipePoint.x, y: swipePoint.y - 190 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page).toHaveURL(/\/#works$/);
    const scrollAfterForwardSwipe = await page.evaluate(() => scrollY);
    expect(scrollAfterForwardSwipe).toBeGreaterThan(scrollBeforeSwipe);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 420 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 550 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(scrollAfterForwardSwipe);
    await expect(page).toHaveURL(/\/#works$/);

    await nav(page).getByRole('link', { name: 'Projects', exact: true }).tap();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[0].slug);
    const tapPoint = await screenPoint(page, destinations[0]);
    await page.touchscreen.tap(tapPoint.x, tapPoint.y);
    await expect(page).toHaveURL(/\/work\/still-dental\/$/);
    await page.goBack();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[0].slug);
    await page.getByRole('button', { name: 'View All Projects' }).tap();
    await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
    await page.getByRole('button', { name: 'Back to 3D Experience' }).tap();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[0].slug);

    await page.getByRole('link', { name: 'Next project', exact: true }).tap();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[1].slug);
    await expect(page.locator('#gallery-heading')).toContainText('Squid Game');
    await assertScreenFits(page, destinations[1]);
    await page.screenshot({ path: `${screenshotDirectory}/portrait-squid-game.png` });
    await page.reload();
    await expect(surface(page)).toHaveAttribute('data-scene', 'ready');
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[1].slug);

    await nav(page).getByRole('link', { name: 'Contact', exact: true }).tap();
    await expect(page.locator('#hire-heading')).toBeVisible();
    await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
    const contactCta = page.locator('#contact .hire-button');
    await expect(contactCta).toBeEnabled();
    await expect(contactCta).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    await contactCta.evaluate(element => element.addEventListener('click', event => {
      event.preventDefault();
      window.contactActionInvoked = true;
    }, { once: true }));
    await contactCta.tap();
    await expect.poll(() => page.evaluate(() => window.contactActionInvoked)).toBe(true);
    expect((await page.locator('#contact').boundingBox()).y).toBe(0);
    await page.screenshot({ path: `${screenshotDirectory}/portrait-contact.png` });

    await nav(page).getByRole('link', { name: 'Home', exact: true }).tap();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.getByRole('heading', { name: 'I AM HAFIZ.' })).toBeVisible();
    expect(overlaps(await page.getByRole('heading', { name: 'I AM HAFIZ.' }).boundingBox(),
      await page.getByRole('button', { name: 'Pause scene' }).boundingBox())).toBe(false);
    await page.screenshot({ path: `${screenshotDirectory}/landscape-hero.png` });
    await nav(page).getByRole('link', { name: 'Projects', exact: true }).tap();
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[0].slug);
    await assertScreenFits(page, destinations[0]);
    await page.screenshot({ path: `${screenshotDirectory}/landscape-billboard.png` });
    const progressBeforeRotation = await page.evaluate(() => {
      const track = document.querySelector('.route-journey');
      const hero = document.querySelector('.immersive-hero');
      return (scrollY + track.getBoundingClientRect().top) / (hero.offsetHeight * 12);
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', destinations[0].slug);
    const progressAfterRotation = await page.evaluate(() => {
      const track = document.querySelector('.route-journey');
      const hero = document.querySelector('.immersive-hero');
      return (scrollY + track.getBoundingClientRect().top) / (hero.offsetHeight * 12);
    });
    expect(Math.abs(progressAfterRotation - progressBeforeRotation)).toBeLessThan(0.005);
    await assertScreenFits(page, destinations[0]);

    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2,
      baseURL: test.info().project.use.baseURL });
    const desktopPage = await desktopContext.newPage();
    try {
      await openMobile(desktopPage, { width: 1440, height: 1000 });
      await expect(desktopPage.getByRole('button', { name: 'Pause scene' })).toBeVisible();
      await desktopPage.screenshot({ path: `${screenshotDirectory}/desktop-regression-check.png` });
    } finally {
      await desktopContext.close();
    }
  } finally {
    await context.close();
  }
});
