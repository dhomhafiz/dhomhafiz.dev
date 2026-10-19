import { test, expect } from '@playwright/test';

const sizes = [[375,812], [390,844], [768,1024], [1024,768], [1440,900], [1920,1080], [390,568], [1024,600]];
async function openReel(page) {
  await page.goto('/#works');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#works').scrollIntoViewIfNeeded();
}
for (const [width, height] of sizes) test(`film composition and case studies at ${width}x${height}`, async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openReel(page);
  const cells = page.locator('.film-cell');
  await expect(cells).toHaveCount(2);
  await expect(cells.first()).toHaveAttribute('data-active', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Previous project', exact: true })).toBeDisabled();
  const before = await cells.first().boundingBox();
  const exposure = await cells.first().locator('.film-window').boundingBox();
  expect(exposure.width).toBeGreaterThan(before.width * .9);
  await page.screenshot({ path: `artifacts/film-after-${width}x${height}.png` });
  await cells.first().locator('.film-reveal').focus();
  await page.keyboard.press('Enter');
  await expect(cells.first().locator('.film-information')).toBeVisible();
  const after = await cells.first().boundingBox();
  expect(after.width).toBeCloseTo(before.width, 1);
  expect(after.height).toBeCloseTo(before.height, 1);
  await expect(cells.first().getByRole('link', { name: /View Project/ })).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(cells.first().locator('.film-information')).not.toBeVisible();
  await page.getByRole('button', { name: 'Next project', exact: true }).click();
  await expect(cells.last()).toHaveAttribute('data-active', 'true');
  await cells.last().locator('.film-reveal').focus();
  await page.keyboard.press('Space');
  await expect(cells.last().getByRole('link', { name: 'The Rakyat Post' })).toHaveAttribute('href', /therakyatpost\.com/);
  await page.screenshot({ path: `artifacts/film-reveal-${width}x${height}.png` });
  await cells.last().getByRole('link', { name: /View Project/ }).click();
  await expect(page).toHaveURL(/\/work\/netflix-squid-game-2\/$/);
  await expect(page.locator('h1')).toHaveText('Netflix Squid Game 2 Interactive Poll System');
  await expect(page.locator('.case-story')).toContainText('Blue for Continue, Red for Withdraw');
  await expect(page.locator('.case-hero a')).toHaveText(/The Rakyat Post/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/case-netflix-${width}x${height}.png`, fullPage: true });
  await page.goBack();
  await expect(page.locator('.film-cell').last()).toHaveAttribute('data-active', 'true');
  await page.getByRole('button', { name: 'Previous project', exact: true }).click();
  await page.locator('.film-reveal').first().focus();
  await page.keyboard.press('Enter');
  await page.locator('.film-cell').first().getByRole('link', { name: /View Project/ }).click();
  await expect(page).toHaveURL(/\/work\/still-dental\/$/);
  await expect(page.getByRole('link', { name: 'Explore interactive demo' })).toHaveAttribute('href', '/demo-dental/');
  await expect(page.locator('.case-gallery img')).toHaveCount(2);
  await page.locator('.case-gallery').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.case-gallery img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.locator('.case-gallery img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/case-dental-${width}x${height}.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test('mouse drag, hover and keyboard navigation keep the reel stable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openReel(page);
  const frame = page.locator('.film-window').first();
  const rect = await frame.boundingBox();
  await frame.hover();
  await expect(frame.locator('.film-image')).toHaveCSS('filter', 'blur(4px)');
  await expect(frame.locator('.film-information')).toBeVisible();
  await frame.locator('.film-reveal').focus();
  await page.keyboard.press('Enter');
  await expect(frame.locator('.film-information')).toBeVisible();
  const y = rect.y + rect.height * .45;
  await page.mouse.move(rect.x + rect.width * .85, y);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .1, y, { steps: 16 });
  await page.mouse.up();
  await expect(page.locator('.film-cell').last()).toHaveAttribute('data-active', 'true');
  await expect(page).toHaveURL(/#works$/);
  const reel = page.locator('.film-viewport');
  await reel.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.film-cell').first()).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.film-cell').last()).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.film-cell').first()).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('End');
  await expect(page.locator('.film-cell').last()).toHaveAttribute('data-active', 'true');
});

test('touch tap reveals, outside dismisses, swipe navigates without opening a project', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await openReel(page);
    const frame = page.locator('.film-cell').first();
    await frame.locator('.film-reveal').tap();
    await expect(frame.locator('.film-information')).toBeVisible();
    await frame.getByRole('button', { name: /Close/ }).tap();
    await expect(frame.locator('.film-information')).not.toBeVisible();
    await frame.locator('.film-reveal').tap();
    await page.locator('.film-counter').tap();
    await expect(frame.locator('.film-information')).not.toBeVisible();
    const rect = await page.locator('.film-window').first().boundingBox();
    const client = await context.newCDPSession(page);
    const y = Math.max(100, rect.y + rect.height / 2);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] });
    for (let x = 310; x >= 45; x -= 25) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('.film-cell').last()).toHaveAttribute('data-active', 'true');
    await expect(page.locator('.film-information[aria-hidden="false"]')).toHaveCount(0);
    await expect(page).toHaveURL(/#works$/);
    const before = await page.evaluate(() => scrollY);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y }] });
    for (let distance = 20; distance <= 200; distance += 20) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: y - distance }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  } finally { await context.close(); }
});

test('normal-motion project navigation and Back, including rapid activation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => window.addEventListener('pageswap', event => {
    sessionStorage.setItem('film-test-native-transition', String(Boolean(event.viewTransition)));
  }));
  await openReel(page);
  await page.locator('.film-window').first().hover();
  const link = page.locator('.film-cell').first().getByRole('link', { name: /View Project/ });
  await link.dblclick({ noWaitAfter: true });
  await expect(page).toHaveURL(/\/work\/still-dental\/$/);
  await expect(page.locator('.case-hero img')).toBeVisible();
  if (await page.evaluate(() => 'onpageswap' in window)) {
    expect(await page.evaluate(() => sessionStorage.getItem('film-test-native-transition'))).toBe('true');
  }
  await page.goBack();
  await expect(page.locator('.film-cell').first()).toHaveAttribute('data-active', 'true');
  await expect(page.locator('.editorial-header')).toBeVisible();
  expect(errors).toEqual([]);
});

test('project routes have unique metadata, real media and sitemap entries', async ({ page, request }) => {
  for (const slug of ['still-dental', 'netflix-squid-game-2']) {
    expect((await page.goto(`/work/${slug}/`)).status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/\| Mohd Hafiz$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://dhomhafiz.dev/work/${slug}/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://dhomhafiz.dev/work/${slug}/`);
    const images = await page.locator('meta[property="og:image"]').allTextContents();
    expect(images).toHaveLength(1);
    const src = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(src).toMatch(/https:\/\/dhomhafiz\.dev\/images\//);
    expect((await request.get(new URL(src).pathname)).ok()).toBe(true);
    for (const href of await page.locator('.case-pagination a').evaluateAll(links => links.map(a => a.getAttribute('href')))) expect((await request.get(href.split('#')[0])).ok()).toBe(true);
  }
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('https://dhomhafiz.dev/work/still-dental/');
  expect(xml).toContain('https://dhomhafiz.dev/work/netflix-squid-game-2/');
});

test('real project anchors remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/#works');
    await page.locator('.film-noscript a').first().click();
    await expect(page).toHaveURL(/\/work\/still-dental\/$/);
    await expect(page.locator('h1')).toHaveText('Still Dental');
    await page.getByRole('link', { name: 'Explore interactive demo' }).click();
    await expect(page).toHaveURL(/\/demo-dental\/$/);
  } finally { await context.close(); }
});
