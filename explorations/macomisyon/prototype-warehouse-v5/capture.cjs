const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 fs.mkdirSync('.impeccable/review',{recursive:true});
 const b=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 for(const [name,width,height] of [['desktop',1280,900],['mobile',390,844],['small',360,740],['user-584',584,1037],['user-993',993,1037]]){
  const context=await b.newContext({viewport:{width,height}}),p=await context.newPage();await p.goto(process.env.DEMO_URL||'http://127.0.0.1:58016/');await p.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
  const bounds=await p.locator('.console').boundingBox(),shot=async suffix=>{await p.waitForTimeout(350);await p.screenshot({path:`.impeccable/review/${name}${suffix?'-'+suffix:''}.png`,fullPage:true});};
  await shot('');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
  await p.locator('#demoButton').click();await shot('console');await p.locator('[data-motion-toggle]').click();await p.locator('#sheetClose').click();assert.equal(await p.locator('#motionButton').getAttribute('aria-pressed'),'true');assert.deepEqual(await p.locator('.console').boundingBox(),bounds);
  if(name==='mobile')await shot('paused');await p.locator('#motionButton').click();
  if(name==='mobile'){
   await p.locator('#demoButton').click();await p.locator('[data-preset=repaired]').click();await p.reload();await p.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);
   await p.waitForFunction(()=>__demo.getWorld().ambientPhase==='outbound');await shot('outbound');
   await p.waitForFunction(()=>__demo.getWorld().ambientPhase==='returning-empty',{},{timeout:20000});await shot('return');
  }
  await context.close();
 }
 await b.close();console.log('Final views captured, including user viewport 993x1037 and mobile loaded/empty tour.');
})().catch(e=>{console.error(e);process.exit(1)});
