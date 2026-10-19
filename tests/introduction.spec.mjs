import { test, expect } from '@playwright/test';
for(const width of [320,390,768,1440,1920]) {
 test(`editorial layout, navigation and media at ${width}`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
  expect(await page.locator('video').evaluate(v=>({muted:v.muted,inline:v.playsInline,w:v.videoWidth}))).toMatchObject({muted:true,inline:true,w:width<=700?640:1120});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.editorial-header, .hero-copy-block, .hero-scroll-arrow')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'MOHD HAFIZ', exact: true })).toBeVisible();
  const nameStyle = await page.locator('.hero-display-name').evaluate(el => ({
    bounds: el.getBoundingClientRect().toJSON(),
    family: getComputedStyle(el).fontFamily,
    bodyFamily: getComputedStyle(document.querySelector('.hero-bottom-brand')).fontFamily,
    weight: getComputedStyle(el).fontWeight,
    barTop: document.querySelector('.hero-bottom-bar').getBoundingClientRect().top,
  }));
  expect(nameStyle.family).not.toBe(nameStyle.bodyFamily);
  expect(nameStyle.weight).toBe('400');
  expect(nameStyle.bounds.x).toBeGreaterThanOrEqual(0);
  expect(nameStyle.bounds.right).toBeLessThanOrEqual(width);
  expect(nameStyle.bounds.width).toBeGreaterThan(width * .8);
  expect(nameStyle.bounds.bottom).toBeLessThan(nameStyle.barTop);
  await expect(page.locator('.hero-bottom-location .sr-only')).toHaveText('Kuala Lumpur, MY');
  await expect(page.locator('.hero-bottom-bar nav a').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  const alignment = await page.evaluate(() => {
    const hero = document.querySelector('.editorial-hero').getBoundingClientRect();
    const bar = document.querySelector('.hero-bottom-bar').getBoundingClientRect();
    const brand = document.querySelector('.hero-bottom-brand').getBoundingClientRect();
    const nav = document.querySelector('.hero-bottom-bar nav').getBoundingClientRect();
    const location = document.querySelector('.hero-bottom-location').getBoundingClientRect();
    return { brandCenter: brand.x + brand.width / 2, viewportCenter: innerWidth / 2, bottom: bar.bottom, heroBottom: hero.bottom, navRight: nav.right, brandLeft: brand.left, brandRight: brand.right, locationLeft: location.left, navY: nav.y + nav.height / 2, brandY: brand.y + brand.height / 2, locationY: location.y + location.height / 2, heroHeight: hero.height, screenHeight: innerHeight };
  });
  expect(alignment.brandCenter).toBeCloseTo(alignment.viewportCenter, 0);
  expect(alignment.bottom).toBeCloseTo(alignment.heroBottom, 0);
  expect(alignment.navRight).toBeLessThan(alignment.brandLeft);
  expect(alignment.brandRight).toBeLessThan(alignment.locationLeft);
  expect(alignment.navY).toBeCloseTo(alignment.brandY, 0);
  expect(alignment.locationY).toBeCloseTo(alignment.brandY, 0);
  expect(alignment.heroHeight).toBeCloseTo(alignment.screenHeight, 0);
  await page.screenshot({path:`artifacts/hero-bottom-${width}.png`});
  expect(await page.evaluate(()=>[...document.fonts].some(f=>f.status==='loaded'&&!f.family.includes('Fallback')))).toBe(true);
  await expect(page.locator('.hero-video button')).toHaveCount(0);
  await page.locator('.hero-bottom-bar nav a').first().click();await expect(page).toHaveURL(/#works$/);
  const whatsapp = page.locator('#contact .hire-button');
  await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/60197860823\?text=/);
  await page.getByRole('link',{name:'Contact',exact:true}).click();await expect(page).toHaveURL(/#contact$/);
  const url=new URL(await whatsapp.getAttribute('href'));
  expect(url.searchParams.get('text')).toBe("Hi Dhom Hafiz, I'd like to discuss a landing page for my business.");
  await expect(page.locator('#contact')).not.toContainText('belum');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.screenshot({path:`artifacts/editorial-${width}.png`,fullPage:true});expect(errors).toEqual([]);
 });
}
test('reduced motion keeps a poster and failed media has a fallback',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');expect(await page.locator('video').getAttribute('src')).toBeNull();
 await page.emulateMedia({reducedMotion:'no-preference'});await page.route('**/*.mp4',r=>r.abort());await page.reload();await expect(page.locator('.hero-video-fallback')).toBeVisible();
});
test('blocked autoplay keeps the poster without controls',async({page})=>{
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'))}});
 await page.goto('/');await expect(page.getByRole('status')).toContainText('Autoplay unavailable');await expect(page.locator('.hero-video button')).toHaveCount(0);expect(await page.locator('video').evaluate(v=>v.controls)).toBe(false);
});

test('hero video and bottom navigation fill the screen after viewport resizing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [390, 1440]) for (const height of [700, 900]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.locator('.editorial-hero').evaluate(el => Math.abs(el.getBoundingClientRect().height - innerHeight))).toBeLessThan(1);
    const sizes = await page.evaluate(() => {
      const video = document.querySelector('.hero-video').getBoundingClientRect();
      const bar = document.querySelector('.hero-bottom-bar').getBoundingClientRect();
      return { width: video.width, height: video.height, bottom: bar.bottom, left: video.left };
    });
    expect(sizes.width).toBeCloseTo(width, 0);
    expect(sizes.height).toBeCloseTo(height, 0);
    expect(sizes.bottom).toBeCloseTo(height, 0);
    expect(sizes.left).toBeCloseTo(0, 0);
  }
});
