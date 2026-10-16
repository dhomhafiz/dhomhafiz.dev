import { test, expect } from '@playwright/test';
for(const width of [320,390,768,1440,1920]) {
 test(`editorial layout, navigation and media at ${width}`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
  expect(await page.locator('video').evaluate(v=>({muted:v.muted,inline:v.playsInline,w:v.videoWidth}))).toMatchObject({muted:true,inline:true,w:1120});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.evaluate(()=>document.querySelector('video').getBoundingClientRect().bottom<document.querySelector('h1').getBoundingClientRect().top)).toBe(true);
  expect(await page.evaluate(()=>[...document.fonts].some(f=>f.status==='loaded'&&!f.family.includes('Fallback')))).toBe(true);
  await expect(page.locator('.hero-video button')).toHaveCount(0);
  await page.locator('header nav a').first().click();await expect(page).toHaveURL(/#works$/);
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
