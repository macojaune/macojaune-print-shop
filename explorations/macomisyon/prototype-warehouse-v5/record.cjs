const {chromium}=require('playwright');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:'.impeccable/video',size:{width:390,height:844}}}),page=await context.newPage();
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:58016/');await page.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(4200);
 await page.locator('#demoButton').click();await page.locator('[data-preset=progress]').click();await page.waitForTimeout(3900);
 await page.locator('#demoButton').click();await page.locator('[data-preset=repaired]').click();await page.waitForTimeout(32500);
 const path=await page.video().path();await context.close();fs.copyFileSync(path,'demo-depot-q-v5.webm');await browser.close();console.log('Actual V5 recording: demo-depot-q-v5.webm');
})().catch(error=>{console.error(error);process.exit(1)});
