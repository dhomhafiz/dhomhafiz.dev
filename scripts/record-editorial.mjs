import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width:1440, height:1000 }, recordVideo: { dir:'.media-source/editorial', size:{width:1440,height:1000} }, reducedMotion:'reduce' });
const page = await context.newPage();
await page.goto('http://127.0.0.1:4174/demo-dental/');
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:'.media-source/dental-home.png'});
for(let i=0;i<50;i++){await page.evaluate(y=>scrollTo(0,y),i*10);await page.waitForTimeout(80)}
const video = page.video(); await context.close();
await fs.copyFile(await video.path(),'.media-source/dental-home.webm');
const c2=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'.media-source/editorial',size:{width:1440,height:1000}},reducedMotion:'reduce'});
const p2=await c2.newPage();await p2.goto('http://127.0.0.1:4174/demo-dental/');await p2.locator('#booking').scrollIntoViewIfNeeded();await p2.evaluate(()=>document.fonts.ready);await p2.screenshot({path:'.media-source/dental-booking.png'});
await p2.locator('#treatment').selectOption({index:1});await p2.waitForTimeout(1200);await p2.locator('#treatment').selectOption({index:2});await p2.waitForTimeout(2800);
const v2=p2.video();await c2.close();await fs.copyFile(await v2.path(),'.media-source/dental-booking.webm');await browser.close();

