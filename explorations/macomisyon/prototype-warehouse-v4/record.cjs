const {chromium}=require('playwright');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:'.impeccable/video',size:{width:390,height:844}}}),page=await context.newPage();
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:58015/');await page.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1500);
 await page.locator('#missionsButton').click();await page.waitForTimeout(1300);await page.locator('[data-locate=retours]').click();await page.waitForTimeout(1400);await page.locator('#missionsButton').click();await page.waitForTimeout(1800);await page.locator('[data-locate=inscrits]').click();await page.waitForTimeout(1300);
 await page.locator('#demoButton').click();await page.locator('[data-preset=ahead]').click();await page.locator('#missionsButton').click();await page.waitForTimeout(1800);await page.locator('#sheetClose').click();
 await page.locator('#demoButton').click();for(let i=0;i<8;i++){await page.locator('[data-credit=inscrits]').click();await page.waitForTimeout(120);}await page.waitForTimeout(2300);
 await page.locator('#demoButton').click();for(let i=0;i<5;i++){await page.locator('[data-credit=boutiques]').click();await page.waitForTimeout(120);}await page.waitForTimeout(7500);
 const path=await page.video().path();await context.close();fs.copyFileSync(path,'demo-depot-q-v4.webm');await browser.close();console.log('Actual V4 recording: demo-depot-q-v4.webm');
})().catch(error=>{console.error(error);process.exit(1)});
