import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) test(`contact text animates while controls retain their natural size at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  const contact = page.locator('#contact');
  await page.evaluate(() => document.fonts.ready);
  const typography = await contact.evaluate(el => {
    const heading = getComputedStyle(el.querySelector('.contact-title'));
    const button = getComputedStyle(el.querySelector('.hire-button'));
    const family = heading.fontFamily.split(',')[0].replaceAll('"', '').trim();
    return { headingFamily: family, buttonFamily: button.fontFamily.split(',')[0].replaceAll('"', '').trim(), weight: heading.fontWeight, loaded: [...document.fonts].some(font => font.status === 'loaded' && font.family.replaceAll('"', '') === family) };
  });
  expect(typography.headingFamily).not.toBe(typography.buttonFamily);
  expect(typography.weight).toBe('400');
  expect(typography.loaded).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('contact').offsetTop, behavior: 'instant' }));
  await expect(contact).toHaveAttribute('data-contact-motion', 'ready');
  const samples = await page.evaluate(async () => {
    const section = document.getElementById('contact');
    const stage = section.querySelector('.contact-stage');
    const title = section.querySelector('.contact-title');
    const result = [];
    for (const fraction of [.9, .6, .3, 0, .4, .8, .2, 0]) {
      window.scrollTo({ top: section.offsetTop - innerHeight * fraction, behavior: 'instant' });
      for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
      const header = parseFloat(getComputedStyle(section).getPropertyValue('--header-height'));
      const sectionTop = section.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (innerHeight - sectionTop) / (innerHeight - header)));
      const scale = new DOMMatrix(getComputedStyle(title).transform).d;
      const panelHeight = parseFloat(getComputedStyle(stage).height);
      const titleHeight = parseFloat(getComputedStyle(title).height);
      const sample = {
        scale, expected: .035 + .965 * progress,
        panelTop: stage.getBoundingClientRect().top,
        expectedTop: Math.min(header, sectionTop),
        textScale: title.getBoundingClientRect().height / titleHeight,
        backgroundScale: new DOMMatrix(getComputedStyle(stage, '::before').transform).d,
        controls: [...section.querySelectorAll('.hire-button, .contact-social-links a, .contact-copyright')].map(el => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).height)),
      };
      for (let frame = 0; frame < 6; frame++) await new Promise(requestAnimationFrame);
      sample.afterStop = new DOMMatrix(getComputedStyle(title).transform).d;
      result.push(sample);
    }
    return result;
  });
  for (const sample of samples) {
    expect(sample.scale).toBeCloseTo(sample.expected, 3);
    expect(sample.afterStop).toBeCloseTo(sample.scale, 3);
    expect(sample.textScale).toBeCloseTo(sample.scale, 3);
    expect(Math.abs(sample.panelTop - sample.expectedTop)).toBeLessThan(1);
    expect(sample.backgroundScale).toBeCloseTo(sample.scale, 3);
    for (const ratio of sample.controls) expect(ratio).toBeCloseTo(1, 2);
  }
  const works = await page.locator('#works').boundingBox();
  const panel = await contact.boundingBox();
  expect(panel.y - (works.y + works.height)).toBeCloseTo(12, 0);
  await expect(contact).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect(await contact.locator('.contact-stage').evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe('rgb(222, 222, 219)');
  await expect(contact.locator('.hire-button')).toBeInViewport();
  await expect.poll(() => contact.locator('.contact-title').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1, 3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/contact-${width}.png` });
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('contact').offsetTop - innerHeight * .5, behavior: 'instant' }));
  await page.screenshot({ path: `artifacts/contact-rising-${width}.png` });
});

test('reduced motion leaves the contact panel full size', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-stage')).toHaveCSS('transform', 'none');
  await expect(page.locator('.contact-title')).toHaveCSS('transform', 'none');
});
test('WhatsApp button receives hover, click and keyboard focus after contact animation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  const button = page.locator('#contact a.hire-button');
  await expect.poll(() => page.locator('.contact-title').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1, 3);
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(button).toHaveCSS('color', 'rgb(0, 0, 0)');
  expect(await button.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  })).toBe(true);
  await button.evaluate(el => el.addEventListener('click', event => { event.preventDefault(); el.dataset.clicked = 'true'; }));
  await button.click();
  await expect(button).toHaveAttribute('data-clicked', 'true');
  await expect(button).toHaveAttribute('href', /^https:\/\/wa.me\/60197860823\?text=/);
  await page.mouse.move(0, 0);
  await button.blur();
  await expect(button).toHaveCSS('background-color', 'rgb(23, 23, 23)');
  await button.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
