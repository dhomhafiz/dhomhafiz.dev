import { test, expect } from '@playwright/test';

test.use({ isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

for (const width of [390, 430]) test(`mobile contact squashes vector text without moving controls at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const readings = await page.evaluate(async () => {
    const contact = document.getElementById('contact');
    const title = contact.querySelector('.contact-title');
    const button = contact.querySelector('.hire-button');
    const stage = contact.querySelector('.contact-stage');
    const vector = contact.querySelector('.contact-title-vector');
    const baseline = title.getBoundingClientRect().bottom + scrollY;
    const result = [];
    for (const revealed of [0, 60, 120, 300, 120, 40, 150, 300]) {
      window.scrollTo({ top: baseline - innerHeight + revealed, behavior: 'instant' });
      for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
      result.push({
        title: getComputedStyle(title).transform,
        stage: getComputedStyle(stage).transform,
        background: getComputedStyle(stage, '::before').transform,
        titleHeight: title.getBoundingClientRect().height,
        buttonHeight: button.getBoundingClientRect().height,
        documentTop: title.getBoundingClientRect().top + scrollY,
        willChange: getComputedStyle(stage).willChange,
        vectorTransform: getComputedStyle(vector).transform,
        vectorHeight: vector.getBoundingClientRect().height,
        viewBoxWidth: vector.viewBox.baseVal.width,
      });
    }
    return result;
  });
  for (const reading of readings) {
    expect(reading.title).toBe('none');
    expect(reading.stage).toBe('none');
    expect(reading.background).toBe('none');
    expect(reading.willChange).toBe('auto');
    expect(reading.vectorTransform).toBe('none');
    expect(reading.viewBoxWidth).toBeGreaterThan(0);
    expect(reading.titleHeight).toBeCloseTo(readings[0].titleHeight, 2);
    expect(reading.buttonHeight).toBeCloseTo(readings[0].buttonHeight, 2);
    expect(reading.documentTop).toBeCloseTo(readings[0].documentTop, 1);
  }
  expect(readings[0].vectorHeight).toBeLessThan(readings[1].vectorHeight);
  expect(readings[1].vectorHeight).toBeLessThan(readings[2].vectorHeight);
  expect(readings[2].vectorHeight).toBeLessThan(readings[3].vectorHeight);
  expect(readings[5].vectorHeight).toBeLessThan(readings[4].vectorHeight);
  expect(readings[7].vectorHeight).toBeCloseTo(readings[3].vectorHeight, 1);
  await expect(page.locator('#contact .hire-button')).toBeInViewport();
  await expect(page.locator('#contact .contact-copyright')).toBeInViewport();
  await page.screenshot({ path: `artifacts/contact-mobile-stable-${width}.png` });
  await page.evaluate(() => window.scrollTo({ top: scrollY + document.querySelector('.contact-title').getBoundingClientRect().bottom - innerHeight + 90, behavior: 'instant' }));
  await page.screenshot({ path: `artifacts/contact-mobile-vector-rising-${width}.png` });
});

test('mobile toolbar height changes do not recalculate contact layout or scale', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  const samples = await page.evaluate(async () => {
    const stage = document.querySelector('.contact-stage');
    const title = document.querySelector('.contact-title');
    const result = [];
    for (const height of [844, 740, 800, 844, 740]) {
      Object.defineProperty(visualViewport, 'height', { configurable: true, value: height });
      visualViewport.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
      result.push({ height: stage.getBoundingClientRect().height, top: title.getBoundingClientRect().top, fontSize: getComputedStyle(title).fontSize, transform: getComputedStyle(title).transform, vectorHeight: title.querySelector('svg').getBoundingClientRect().height });
    }
    return result;
  });
  for (const sample of samples) expect(sample).toEqual(samples[0]);
});

test('mobile vector text stops immediately and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('contact').offsetTop - innerHeight * .5, behavior: 'instant' }));
  await expect(page.locator('#contact')).toHaveAttribute('data-contact-motion', 'ready');
  const heights = await page.locator('.contact-title-vector').evaluate(async el => {
    const result = [];
    for (let frame = 0; frame < 15; frame++) {
      await new Promise(requestAnimationFrame);
      result.push(el.getBoundingClientRect().height);
    }
    return result;
  });
  for (const height of heights.slice(2)) expect(height).toBeCloseTo(heights[2], 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.contact-title-vector')).not.toBeVisible();
  await expect(page.locator('.contact-title-native')).toBeVisible();
});
