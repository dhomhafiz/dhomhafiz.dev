import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) test(`responsive hero media and cache at ${width}`, async ({ page, request }) => {
  const requests=[];
  page.on('request', request => { if(request.url().includes('/images/workspace-')) requests.push(new URL(request.url()).pathname); });
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const small=width<=700;
  const poster=small?'/images/workspace-34279733-mobile.webp':'/images/workspace-34279733.webp';
  await expect(page.locator('.hero-video picture img')).toHaveJSProperty('currentSrc', new URL(poster, page.url()).href);
  await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
  await expect(page.locator('video')).toHaveAttribute('src', small?'/videos/workspace-34279733-mobile.mp4':'/videos/workspace-34279733.mp4');
  expect([...new Set(requests)]).toEqual([poster]);
  const response=await request.get(poster);
  expect(response.headers()['cache-control']).toBe('public, max-age=2592000');
  const script=await page.locator('script[src]').first().getAttribute('src');
  expect((await request.get(script)).headers()['cache-control']).toBe('public, max-age=31536000, immutable');
});

test('Save-Data leaves the prioritised poster without fetching footage', async ({ page }) => {
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'},configurable:true}));
  const requests=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))requests.push(r.url())});
  await page.goto('/');await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestIdleCallback(resolve));});
  await expect(page.locator('video')).not.toHaveAttribute('src');expect(requests).toEqual([]);
  expect(await page.locator('.hero-video picture img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
});

test('service animation enhances server-rendered copy only near its section',async({page})=>{
  const response=await page.goto('/');expect(await response.text()).toContain('Landing page design');
  const section=page.locator('#services');await expect(section).not.toHaveAttribute('data-motion','ready');
  await section.scrollIntoViewIfNeeded();await expect(section).toHaveAttribute('data-motion','ready');
  await page.emulateMedia({reducedMotion:'reduce'});await expect(section).not.toHaveAttribute('data-motion','ready');
  await expect(section.locator('.service-row h3').first()).toHaveCSS('opacity','1');
});
