import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test.use({ viewport: { width: 430, height: 669 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

async function geometry(page) {
  return page.evaluate(() => {
    const selectors = ['html', 'body', '.editorial-page', '#main', '.route-journey', '.immersive-hero', '.route-gallery-presentation', '#contact', '.editorial-header nav'];
    const elements = Object.fromEntries(selectors.map(selector => {
      const element = document.querySelector(selector), rect = element.getBoundingClientRect(), css = getComputedStyle(element);
      return [selector, { top: rect.top, bottom: rect.bottom, height: rect.height, documentBottom: rect.bottom + scrollY,
        background: css.backgroundColor, position: css.position, overflow: css.overflow, minHeight: css.minHeight,
        paddingBottom: css.paddingBottom, transform: css.transform }];
    }));
    return { scrollY, scrollHeight: document.documentElement.scrollHeight, innerHeight, clientHeight: document.documentElement.clientHeight,
      visualViewport: { height: visualViewport?.height, offsetTop: visualViewport?.offsetTop }, elements,
      bottomStack: document.elementsFromPoint(innerWidth / 2, innerHeight - 4).map(element => `${element.tagName}.${element.className}`) };
  });
}

async function maximumScroll(page) {
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)))).toBeLessThanOrEqual(1);
}

function assertBoundary(snapshot) {
  const hero = snapshot.elements['.immersive-hero'], nav = snapshot.elements['.editorial-header nav'];
  expect(hero.top, JSON.stringify(snapshot)).toBeGreaterThanOrEqual(-1);
  expect(hero.bottom).toBeGreaterThanOrEqual(snapshot.innerHeight - 1);
  expect(snapshot.scrollHeight).toBeLessThanOrEqual(snapshot.elements['.route-journey'].documentBottom + 1);
  expect(nav.bottom).toBeLessThanOrEqual(hero.bottom);
  expect(nav.top).toBeGreaterThanOrEqual(hero.top);
}

async function swipe(page, cdp, from, to) {
  const x = page.viewportSize().width - 15;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from }] });
  for (let step = 1; step <= 6; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from + (to - from) * step / 6 }] });
    await page.waitForTimeout(50);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(200);
}

test('maximum Contact scroll ends on the sticky scene surface', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page.locator('#hire-heading')).toBeFocused();
  await maximumScroll(page);
  const snapshot = await geometry(page);
  const label = process.env.CONTACT_CAPTURE_LABEL || 'after';
  fs.mkdirSync('artifacts/contact-end-boundary', { recursive: true });
  fs.writeFileSync(`artifacts/contact-end-boundary/${label}-geometry.json`, JSON.stringify(snapshot, null, 2));
  await page.screenshot({ path: `artifacts/contact-end-boundary/${label}-contact-max.png` });
  assertBoundary(snapshot);
  const all = [snapshot];
  const cdp = await page.context().newCDPSession(page);
  for (const [width, height, insets] of [[430, 600, { top: 59, bottom: 34 }], [430, 932, { top: 59, bottom: 34 }],
    [932, 430, { left: 59, right: 59, bottom: 21 }], [430, 669, { top: 59, bottom: 34 }]]) {
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets });
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.locator('.immersive-hero').evaluate(hero => hero.offsetHeight)).toBe(height);
    await expect.poll(() => page.evaluate(() => Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)))).toBeLessThanOrEqual(1);
    const state = await geometry(page);
    all.push(state); assertBoundary(state);
    // Repeated native downward swipes at the real document maximum.
    for (let attempt = 0; attempt < 3; attempt++) {
      await swipe(page, cdp, height * .7, height * .3);
    }
    await expect.poll(() => page.evaluate(() => Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)))).toBeLessThanOrEqual(1);
    assertBoundary(await geometry(page));
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }))
      .toHaveAttribute('aria-current', 'location');
    await page.screenshot({ path: `artifacts/contact-end-boundary/${label}-contact-max-${width}x${height}.png` });
  }
  fs.writeFileSync(`artifacts/contact-end-boundary/${label}-viewports.json`, JSON.stringify(all, null, 2));
  for (const selector of ['html', 'body', '.editorial-page']) {
    await expect(page.locator(selector)).toHaveCSS('background-color', 'rgb(8, 14, 23)');
  }
});

test('elastic endpoint resize preserves Contact instead of jumping Home', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await maximumScroll(page);
  await expect(page.locator('#contact')).toHaveAttribute('data-route-contact', 'active');
  // Chromium does not implement Safari rubber-banding. Inject only its reported
  // out-of-range scroll coordinate, then exercise the real viewport resize handler.
  const result = await page.evaluate(async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    const before = document.scrollingElement.scrollTop;
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => document.scrollingElement.scrollTop + 80 });
    try {
      visualViewport.dispatchEvent(new Event('resize'));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    } finally {
      if (descriptor) Object.defineProperty(window, 'scrollY', descriptor);
      else delete window.scrollY;
    }
    return { before, after: document.scrollingElement.scrollTop };
  });
  expect(result.after).toBeCloseTo(result.before, 0);
  await expect(page.locator('#contact')).toHaveAttribute('data-route-contact', 'active');
});

test('maximum endpoint reverses to Squid Game and preserves gallery, history and Contact links', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await nav.getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page.locator('#hire-heading')).toBeFocused();
  await maximumScroll(page);
  const cdp = await context.newCDPSession(page);
  const target = await page.evaluate(() => document.querySelector('.immersive-hero').offsetHeight * 12 * .65);
  // Real touch events exercise native reverse scrolling, without a test-only scroll controller.
  for (let attempt = 0; attempt < 14 && await page.evaluate(() => scrollY) > target; attempt++) {
    await swipe(page, cdp, 100, 400);
  }
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await expect(nav.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('aria-current', 'location');
  const previous = await page.evaluate(() => scrollY);
  await page.getByRole('button', { name: 'View All Projects' }).tap();
  await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(previous, 0);
  await page.goForward();
  await expect(page.getByRole('dialog', { name: 'Selected Works' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to 3D Experience' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.immersive-hero')).toHaveAttribute('data-billboard', 'netflix-squid-game-2');
  await nav.getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page.locator('#hire-heading')).toBeFocused();
  await maximumScroll(page);
  await expect.poll(() => page.evaluate(() => history.state?.routeJourneyScroll)).toBe(await page.evaluate(() => scrollY));
  await page.reload();
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)))).toBeLessThanOrEqual(1);
  assertBoundary(await geometry(page));
  const links = page.locator('#contact a');
  for (const link of await links.all()) {
    await expect(link).toBeVisible();
    expect(await link.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return element.contains(hit);
    })).toBe(true);
  }
  // Intercept external navigation so the CTA test never sends a real message.
  await context.route('https://wa.me/**', route => route.fulfill({ body: 'Local CTA check' }));
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.locator('#contact .hire-button').tap()]);
  await expect(popup).toHaveURL(/^https:\/\/wa.me\//);
  await popup.close();
});

for (const mode of ['reduced motion', 'no WebGL', 'context loss']) {
  test(`${mode} retains the ordinary HTML endpoint and background`, async ({ page }) => {
    if (mode === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (mode === 'no WebGL') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
    await page.goto('/');
    if (mode === 'context loss') {
      await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready', { timeout: 45_000 });
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(8, 14, 23)');
      await page.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    }
    await expect(page.locator('.route-journey')).not.toHaveAttribute('data-journey', 'active');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.editorial-page')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByRole('link', { name: 'Projects', exact: true }).tap();
    await expect(page.locator('#works-heading')).toBeInViewport();
    await nav.getByRole('link', { name: 'Contact', exact: true }).tap();
    await expect(page.locator('#hire-heading')).toBeInViewport();
    await maximumScroll(page);
    await expect(page.locator('#contact .hire-button')).toBeVisible();
    await expect(page.locator('#contact')).toHaveJSProperty('inert', false);
  });
}
