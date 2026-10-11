import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test(`opening horizontal scrub and vertical release at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.locator('.hero-stage').evaluate(stage => ({
      start: stage.offsetTop + Math.max(0, parseFloat(stage.style.getPropertyValue('--opening-height')) - innerHeight),
      distance: parseFloat(stage.style.getPropertyValue('--opening-distance')),
    }));
    for (const progress of [0, .5, 1, .5, 0]) {
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), geometry.start + geometry.distance * progress);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = await page.evaluate(() => ({
        x: new DOMMatrix(getComputedStyle(document.querySelector('.hero-intro-track')).transform).m41,
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        heroScale: new DOMMatrix(getComputedStyle(document.querySelector(".hero-horizontal-frame")).transform).a,
        heroClip: getComputedStyle(document.querySelector(".hero-horizontal-frame")).clipPath,
      }));
      expect(state.x).toBeCloseTo(-state.width * progress, 0);
      expect(state.overflow).toBe(false);
      expect(state.heroScale).toBeCloseTo(1 - (width < 768 ? .02 : .04) * progress, 3);
      if (progress > 0) expect(state.heroClip).toContain("round");
      if (progress === .5 && (width === 390 || width === 1440)) await page.screenshot({ path: `artifacts/hero-intro-rounded-${width}.png` });
    }
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), geometry.start + geometry.distance + 100);
    expect(await page.locator('.portfolio-content').evaluate(node => node.getBoundingClientRect().top)).toBeCloseTo(800, 0);
    if (width === 390 || width === 1440) await page.screenshot({ path: `artifacts/introduction-${width}.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => page.locator('.hero-intro-track').evaluate(node => getComputedStyle(node).transform)).toBe('none');
    expect(await page.locator('.introduction').evaluate(node => node.inert)).toBe(false);
    expect(await page.locator('.hero-title').evaluate(node => getComputedStyle(node).fontFamily)).toEqual(await page.locator('.introduction h2').evaluate(node => getComputedStyle(node).fontFamily));
  });
}

for (const [width, height] of [[360, 667], [390, 844], [768, 700], [1440, 768], [1920, 1080]]) {
  test(`complete Hero visible without scrolling at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.hero-copy').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished)));
    const initial = await page.evaluate(() => {
      const hero = document.querySelector('.cinematic-hero');
      const overlay = document.querySelector('.hero-overlay');
      const copy = document.querySelector('.hero-copy').getBoundingClientRect();
      const header = document.querySelector('.cinematic-header').getBoundingClientRect();
      return { height: hero.getBoundingClientRect().height, viewport: innerHeight, top: copy.top, bottom: copy.bottom, header: header.bottom, overflow: overlay.scrollHeight > overlay.clientHeight + 1, scroll: scrollY };
    });
    expect(initial.scroll).toBe(0);
    expect(initial.height).toBe(initial.viewport);
    expect(initial.top).toBeGreaterThanOrEqual(initial.header);
    expect(initial.bottom).toBeLessThanOrEqual(initial.viewport);
    expect(initial.overflow).toBe(false);
    if (width === 390 || width === 1440) await page.screenshot({ path: `artifacts/hero-fit-${width}.png` });
    await page.evaluate(() => window.scrollTo({ top: 50, behavior: 'instant' }));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    expect(await page.locator('.hero-intro-track').evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m41)).toBeLessThan(0);
  });
}

for (const [width, height] of [[360, 667], [390, 844], [768, 700], [1440, 768]]) {
  test(`introduction portrait fits at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo({ top: parseFloat(document.querySelector('.hero-stage').style.getPropertyValue('--opening-distance')), behavior: 'instant' }));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const state = await page.locator('.introduction').evaluate(section => {
      const image = section.querySelector('img');
      const portrait = image.getBoundingClientRect();
      const paragraph = section.querySelector('.introduction-copy p').getBoundingClientRect();
      const content = section.querySelector('.introduction-inner').getBoundingClientRect();
      return { loaded: image.complete && image.naturalWidth > 0, portraitBottom: portrait.bottom, copyTop: paragraph.top, top: section.querySelector(".intro-label").getBoundingClientRect().top, bottom: section.querySelector(".introduction-copy p:last-child").getBoundingClientRect().bottom, header: document.querySelector('.cinematic-header').getBoundingClientRect().bottom };
    });
    expect(state.loaded).toBe(true);
    expect(state.portraitBottom).toBeLessThan(state.copyTop);
    expect(state.top).toBeGreaterThanOrEqual(state.header);
    expect(state.bottom).toBeLessThanOrEqual(height);
    await expect(page.locator('.intro-label')).toHaveText('Introduction / 01');
    await page.screenshot({ path: `artifacts/intro-portrait-${width}.png` });
  });
}

for (const width of [390, 768, 1440]) {
  test(`Introduction to Selected work uses existing cover at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const distance = await page.locator('.hero-stage').evaluate(stage => parseFloat(stage.style.getPropertyValue('--opening-distance')));
    for (const progress of [0, .4, .8, .4, 0]) {
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), distance + 900 * progress);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = await page.locator('.section-transition-frame').first().evaluate(frame => ({
        scale: new DOMMatrix(getComputedStyle(frame).transform).a,
        trackX: new DOMMatrix(getComputedStyle(frame.querySelector('.hero-intro-track')).transform).m41,
        workTop: document.querySelector('.portfolio-content').getBoundingClientRect().top,
      }));
      expect(state.scale).toBeCloseTo(1 - (width < 768 ? .02 : .04) * progress, 3);
      expect(state.trackX).toBeCloseTo(-width, 0);
      expect(state.workTop).toBeCloseTo(900 * (1 - progress), 0);
      if (progress === .4) await page.screenshot({ path: `artifacts/intro-work-transition-${width}.png` });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await page.locator('.section-transition-frame').first().evaluate(frame => getComputedStyle(frame).transform)).toBe('none');
  });
}
