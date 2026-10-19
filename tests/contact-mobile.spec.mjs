import { test, expect } from '@playwright/test';

test.use({ isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

for (const width of [390, 430]) test(`mobile contact keeps native text sharp through scrolling at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const readings = await page.evaluate(async () => {
    const contact = document.getElementById('contact');
    const title = contact.querySelector('.contact-title');
    const button = contact.querySelector('.hire-button');
    const stage = contact.querySelector('.contact-stage');
    const documentTop = contact.getBoundingClientRect().top + scrollY;
    const result = [];
    for (const fraction of [.9, .6, .3, 0, .3, .7, .4, 0]) {
      window.scrollTo({ top: documentTop - innerHeight * fraction, behavior: 'instant' });
      for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
      result.push({
        title: getComputedStyle(title).transform,
        stage: getComputedStyle(stage).transform,
        background: getComputedStyle(stage, '::before').transform,
        titleHeight: title.getBoundingClientRect().height,
        buttonHeight: button.getBoundingClientRect().height,
        documentTop: title.getBoundingClientRect().top + scrollY,
        willChange: getComputedStyle(stage).willChange,
      });
    }
    return result;
  });
  for (const reading of readings) {
    expect(reading.title).toBe('none');
    expect(reading.stage).toBe('none');
    expect(reading.background).toBe('none');
    expect(reading.willChange).toBe('auto');
    expect(reading.titleHeight).toBeCloseTo(readings[0].titleHeight, 2);
    expect(reading.buttonHeight).toBeCloseTo(readings[0].buttonHeight, 2);
    expect(reading.documentTop).toBeCloseTo(readings[0].documentTop, 1);
  }
  await expect(page.locator('#contact .hire-button')).toBeInViewport();
  await expect(page.locator('#contact .contact-copyright')).toBeInViewport();
  await page.screenshot({ path: `artifacts/contact-mobile-stable-${width}.png` });
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
      result.push({ height: stage.getBoundingClientRect().height, top: title.getBoundingClientRect().top, fontSize: getComputedStyle(title).fontSize, transform: getComputedStyle(title).transform });
    }
    return result;
  });
  for (const sample of samples) expect(sample).toEqual(samples[0]);
});
