const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),p=await b.newPage({viewport:{width:390,height:844}});
 const world=()=>p.evaluate(()=>__demo.getWorld()),preset=async id=>{await p.locator('#demoButton').click();await p.locator(`[data-preset=${id}]`).click();};
 await p.goto(process.env.DEMO_URL||'http://127.0.0.1:58016/');await p.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);
 await p.locator('#motionButton').click();await preset('repaired');assert.equal((await world()).dispatchProgress,1);assert.equal((await world()).transitionProgress,null);assert.equal((await world()).doorOpen,1);assert.equal((await world()).forkliftTilt,0);
 await p.locator('#motionButton').click();await preset('start');await preset('repaired');await p.waitForFunction(()=>__demo.getWorld().transitionProgress>.08);await p.locator('#motionButton').click();await p.waitForTimeout(100);const frozen=await world();await p.waitForTimeout(800);assert.equal((await world()).transitionProgress,frozen.transitionProgress);assert.deepEqual((await world()).forkliftPosition,frozen.forkliftPosition);
 await p.locator('#motionButton').click();await p.waitForFunction(()=>__demo.getWorld().transitionProgress===null,{},{timeout:15000});await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>__demo.getWorld().reducedMotion&&__demo.getWorld().tourTime===2800,{},{timeout:3000});const calm=await world();assert.equal(calm.tourTime,2800);await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(120);assert.ok(Math.hypot(...(await world()).forkliftPosition.map((v,i)=>v-calm.forkliftPosition[i]))<.05,'resume must start from calm pose');
 fs.writeFileSync('.impeccable/review/motion-controls-verification.json',JSON.stringify({passed:true,checks:['new state while paused','transition pause and resume','system reduced-motion continuity']},null,2));
 await b.close();console.log('Motion controls passed: new state while paused, paused transition, reduced-motion continuity.');
})().catch(e=>{console.error(e);process.exit(1)});
