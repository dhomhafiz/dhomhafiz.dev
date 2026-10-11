import { test, expect } from '@playwright/test';
import fs from 'node:fs';

function captureErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  return errors;
}

async function scrollTo(page, top) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
  // Two frames flush the existing scroll RAF and style updates, without elapsed-time sequences.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function expectBelowHeader(page, selector) {
  await expect.poll(() => page.evaluate(selector => {
    const target = document.querySelector(selector).getBoundingClientRect();
    const header = document.querySelector('.cinematic-header').getBoundingClientRect();
    return target.top >= header.bottom - 1 && target.top <= header.bottom + 50;
  }, selector)).toBe(true);
}

// Opening scrub coverage lives in introduction.spec.mjs.

for (const width of [390, 768, 1440]) {
  test(`hero CTAs, category activation and contact at ${width}px`, async ({ page }) => {
    const errors = captureErrors(page);
    let payload;
    await page.route('https://api.emailjs.com/**', async route => {
      if (route.request().method() === 'POST') payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' } });
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const primary = page.locator('.hero-copy a[href="#services"]');
    await expect(primary).toContainText('Find my website package');
    await primary.focus();
    await primary.press('Enter');
    await expectBelowHeader(page, '#services');
    await expect(page.locator('#services')).toBeFocused();
    // Reduced motion makes the repeated filtering/contact checks deterministic;
    // smooth hero navigation above still exercises the default motion preference.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const category of ['Enterprise Systems', 'All', 'Live Interactive Demo']) {
      await page.getByRole('button', { name: category, exact: true }).evaluate(node => node.click());
      await scrollTo(page, 0);
      const demo = page.locator('.hero-copy a[href="#live-demo"]');
      await expect(demo).toContainText('See a live demo');
      await demo.evaluate(node => node.click());
      await expect(page.getByRole('button', { name: 'Live Interactive Demo', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#project-results article')).toHaveCount(1);
      await expectBelowHeader(page, '#live-demo');
      await expect(page.locator('#live-demo')).toBeFocused();
    }
    for (const [index, id] of ['essential', 'business', 'application'].entries()) {
      await page.locator('#services a[href="#contact-form"]').nth(index).evaluate(node => node.click());
      await expect(page.locator('#contact-package')).toHaveValue(id);
      await expectBelowHeader(page, '#contact-form');
      await expect(page.locator('#contact-form')).toBeFocused();
    }
    await page.locator('#contact-package').selectOption('business');
    await page.locator('#contact-name').fill('Validation Visitor');
    await page.locator('#contact-email').fill('validation@example.com');
    await page.locator('#contact-message').fill('Please help with our business website.');
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('Thanks!');
    expect(payload.template_params.message).toContain('Service package: Custom Business Website');
    await expect(page.locator('#contact-package')).toHaveValue('');
    await expect(page.locator('#contact-name')).toHaveValue('');
    expect(errors).toEqual([]);
  });
}

test('dental route, prefetched data, booking and back navigation', async ({ page }) => {
  const errors = captureErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect((await page.request.get('/demo-dental/')).status()).toBe(200);
  expect((await page.request.get('/demo-dental/__next.demo-dental.__PAGE__.txt')).status()).toBe(200);
  expect((await page.request.get('/demo-dental/index.txt')).status()).toBe(200);
  await page.goto('/#live-demo', { waitUntil: 'networkidle' });
  const link = page.locator('#live-demo a[href*="demo-dental"]').first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/demo-dental\/$/);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.getByRole('button', { name: 'Smile goals', exact: true }).click();
  await page.locator('#pricing article button').first().click();
  await expect(page.locator('#treatment')).toHaveValue('whitening');
  await page.locator('#booking fieldset button[aria-pressed="false"]:not([disabled])').first().click();
  await page.locator('[aria-label="Appointment times"] button:not([disabled])').first().click();
  await page.locator('#patient-name').fill('Demo Visitor');
  await page.locator('#patient-email').fill('demo@example.com');
  await page.getByRole('button', { name: 'Preview my appointment' }).click();
  await expect(page.locator('#booking [role="status"]')).toContainText('no appointment has been booked');
  await page.goBack({ waitUntil: 'networkidle' });
  await expect(page.locator('.hero-copy')).toBeAttached();
  expect(errors).toEqual([]);
});

test('failed contact delivery preserves details and allows retry', async ({ page }) => {
  const errors = captureErrors(page);
  let delivered = false;
  await page.route('https://api.emailjs.com/**', route => route.fulfill({ status: delivered ? 200 : 503, contentType: 'text/plain', body: delivered ? 'OK' : 'Unavailable', headers: { 'access-control-allow-origin': '*' } }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contact', { waitUntil: 'networkidle' });
  await page.locator('#contact-name').fill('Retry Visitor');
  await page.locator('#contact-email').fill('retry@example.com');
  await page.locator('#contact-message').fill('Please retain my enquiry if delivery fails.');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('please try again');
  await expect(page.locator('#contact-name')).toHaveValue('Retry Visitor');
  await expect(page.locator('#contact-message')).toHaveValue('Please retain my enquiry if delivery fails.');
  delivered = true;
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('Thanks!');
  // A mocked HTTP 503 is expected here; page/runtime errors remain forbidden.
  expect(errors.filter(error => !error.includes('503'))).toEqual([]);
});
