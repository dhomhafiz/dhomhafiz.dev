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
    for (const fraction of [.9, .6, .3, 0, .4, .8, .2, 1, 0]) {
      window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - innerHeight * fraction, behavior: 'instant' });
      for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
      const header = parseFloat(getComputedStyle(section).getPropertyValue('--header-height'));
      const sectionTop = section.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (innerHeight - sectionTop) / (innerHeight - header)));
      const scale = new DOMMatrix(getComputedStyle(title).transform).d;
      const mobile = innerWidth <= 700;
      const easedProgress = mobile ? progress ** 2 * (3 - 2 * progress) : progress ** 2;
      const stageRect = stage.getBoundingClientRect();
      const titleTop = title.parentElement.getBoundingClientRect().bottom - title.offsetHeight - stageRect.top;
      const titleContainerOffset = new DOMMatrix(getComputedStyle(title.parentElement).transform).f;
      const actionsOffset = new DOMMatrix(getComputedStyle(section.querySelector('.contact-actions')).transform).f;
      const closeStart = mobile ? .3 : .97;
      const gapCloseProgress = Math.max(0, Math.min(1, (progress - closeStart) / (1 - closeStart)));
      const easedGapClose = gapCloseProgress ** 2 * (3 - 2 * gapCloseProgress);
      const expectedGap = 24;
      const titleHeight = parseFloat(getComputedStyle(title).height);
      const sample = {
        progress, scale, expected: .01 + .99 * easedProgress, expectedGap,
        titleContainerOffset, actionsOffset,
        panelTop: stageRect.top,
        expectedTop: Math.min(header, sectionTop),
        textScale: title.getBoundingClientRect().height / titleHeight,
        backgroundScale: new DOMMatrix(getComputedStyle(stage, '::before').transform).d,
        gapAboveTitle: titleTop - stage.clientHeight * (1 - new DOMMatrix(getComputedStyle(stage, '::before').transform).d),
        backgroundTopInset: stage.clientHeight * (1 - new DOMMatrix(getComputedStyle(stage, '::before').transform).d),
        expectedBackgroundTopInset: (titleTop - expectedGap) * (1 - easedGapClose),
        controls: [...section.querySelectorAll('.hire-button, .contact-social-links a, .contact-copyright')].map(el => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).height)),
      };
      for (let frame = 0; frame < 6; frame++) await new Promise(requestAnimationFrame);
      sample.afterStop = new DOMMatrix(getComputedStyle(title).transform).d;
      sample.afterStopPanelScale = new DOMMatrix(getComputedStyle(stage, '::before').transform).d;
      result.push(sample);
    }
    return result;
  });
  for (const sample of samples) {
    expect(sample.scale).toBeCloseTo(sample.expected, 3);
    expect(sample.afterStop).toBeCloseTo(sample.scale, 3);
    expect(sample.afterStopPanelScale).toBeCloseTo(sample.backgroundScale, 3);
    expect(sample.textScale).toBeCloseTo(sample.scale, 3);
    expect(Math.abs(sample.panelTop - sample.expectedTop)).toBeLessThan(1);
    for (const ratio of sample.controls) expect(ratio).toBeCloseTo(1, 2);
  }
  const visibleGaps = samples.filter(sample => sample.progress > .1);
  expect(visibleGaps.length).toBeGreaterThan(1);
  const closeStart = width <= 700 ? .3 : .97;
  for (const sample of visibleGaps.filter(sample => sample.progress <= closeStart)) expect(sample.gapAboveTitle).toBeCloseTo(sample.expectedGap, 0);
  const fullPanel = samples.find(sample => sample.progress === 1);
  expect(fullPanel).toBeDefined();
  expect(fullPanel.backgroundScale).toBeCloseTo(1, 3);
  expect(fullPanel.backgroundTopInset).toBeCloseTo(0, 0);
  if (width <= 700) {
    const shift = -Math.min(96, Math.max(56, 900 * .12));
    expect(fullPanel.titleContainerOffset).toBeCloseTo(shift, 0);
    expect(fullPanel.actionsOffset).toBeCloseTo(shift, 0);
  }
  for (const sample of visibleGaps) expect(sample.backgroundTopInset).toBeCloseTo(sample.expectedBackgroundTopInset, 0);
  const works = await page.locator('#works').boundingBox();
  const panel = await contact.boundingBox();
  expect(panel.y - (works.y + works.height)).toBeCloseTo(12, 0);
  await expect(contact).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect(await contact.locator('.contact-stage').evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe('rgb(222, 222, 219)');
  await expect(contact.locator('.hire-button')).toBeInViewport();
  await expect.poll(() => contact.locator('.contact-title').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1, 3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (width <= 700) {
    const stable = await page.evaluate(async () => {
      const section = document.getElementById('contact');
      const stage = section.querySelector('.contact-stage');
      const title = section.querySelector('.contact-title');
      const values = [];
      for (let frame = 0; frame < 12; frame++) {
        await new Promise(requestAnimationFrame);
        values.push([
          new DOMMatrix(getComputedStyle(title).transform).d,
          new DOMMatrix(getComputedStyle(stage, '::before').transform).d,
        ]);
      }
      return values;
    });
    for (let index = 1; index < stable.length; index++) {
      expect(Math.abs(stable[index][0] - stable[index - 1][0])).toBeLessThan(.001);
      expect(Math.abs(stable[index][1] - stable[index - 1][1])).toBeLessThan(.001);
    }
  }
  await page.screenshot({ path: `artifacts/contact-${width}.png` });
  await page.evaluate(() => {
    const section = document.getElementById('contact');
    window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - innerHeight * .5, behavior: 'instant' });
  });
  await page.screenshot({ path: `artifacts/contact-rising-${width}.png` });
});

test('reduced motion leaves the contact panel full size', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-stage')).toHaveCSS('transform', 'none');
  await expect(page.locator('.contact-title')).toHaveCSS('transform', 'none');
});
test('header Contact link aligns the full section below the sticky header', async ({ page }) => {
  await page.goto('/');
  await page.locator('.editorial-header nav a[href="#contact"]').click();
  await expect.poll(() => page.locator('#contact').evaluate(el => Math.round(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).getPropertyValue('--header-height'))))).toBeCloseTo(0, 0);
  await expect.poll(() => page.locator('.contact-title').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1, 3);
  const background = await page.locator('#contact .contact-stage').evaluate(el => {
    const section = el.closest('#contact');
    const bounds = el.getBoundingClientRect();
    return {
      color: getComputedStyle(el, '::before').backgroundColor,
      scale: new DOMMatrix(getComputedStyle(el, '::before').transform).d,
      top: bounds.top,
      sectionTop: section.getBoundingClientRect().top,
    };
  });
  expect(background.color).toBe('rgb(222, 222, 219)');
  expect(Math.abs(background.top - background.sectionTop)).toBeLessThan(1);
  expect(background.scale).toBeCloseTo(1, 3);
  await expect(page.locator('#contact .hire-button')).toBeInViewport();
});
test('mobile contact panel tracks the changing viewport height', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const stage = page.locator('#contact .contact-stage');
  const measureHeight = () => stage.evaluate(el => {
    const header = parseFloat(getComputedStyle(el.closest('#contact')).getPropertyValue('--header-height'));
    return { height: el.getBoundingClientRect().height, expected: innerHeight - header };
  });
  expect(await measureHeight()).toMatchObject({ height: 784, expected: 784 });

  await page.setViewportSize({ width: 390, height: 740 });
  await expect.poll(async () => {
    const { height, expected } = await measureHeight();
    return Math.abs(height - expected);
  }).toBeLessThan(1);
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
