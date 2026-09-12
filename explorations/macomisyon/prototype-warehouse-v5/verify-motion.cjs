const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=process.env.DEMO_URL||'http://127.0.0.1:58016/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const world=()=>p.evaluate(()=>__demo.getWorld());
 const ready=()=>p.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);
 const preset=async id=>{await p.locator('#demoButton').click();await p.locator(`[data-preset=${id}]`).click();};
 await p.goto(url);await ready();await p.waitForTimeout(500);
 const first=await world();await p.waitForTimeout(1800);const second=await world();
 assert.ok(second.ambientTime>first.ambientTime,'broken depot must already be alive');assert.notEqual(second.alertLevel,first.alertLevel,'amber lights should vary slowly');assert.notDeepEqual(second.signalLevels,first.signalLevels,'mission signals should live');
 await p.locator('#motionButton').click();await p.waitForTimeout(100);const stopped=await world();await p.waitForTimeout(1100);const still=await world();
 assert.equal(still.ambientTime,stopped.ambientTime);assert.equal(still.alertLevel,stopped.alertLevel);assert.deepEqual(still.forkliftPosition,stopped.forkliftPosition);assert.ok(still.renderCount<=stopped.renderCount+1,'paused scene must stop rendering');
 await p.locator('#zoomIn').click();assert.ok((await world()).zoom>stopped.zoom,'camera still responds while paused');assert.equal((await world()).ambientTime,stopped.ambientTime);await p.locator('#recenter').click();
 await p.reload();await ready();assert.equal((await world()).motionPaused,true,'pause preference restored');assert.equal(await p.locator('#motionButton').getAttribute('aria-pressed'),'true');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);assert.equal(await p.locator('#motionButton').isDisabled(),true);assert.match(await p.locator('#motionButton').textContent(),/Mode calme/);assert.equal((await world()).effectiveMotionPaused,true);
 await p.emulateMedia({reducedMotion:'no-preference'});assert.equal((await world()).motionPaused,true,'changing device preference cannot undo explicit pause');
 await p.locator('#motionButton').click();await preset('repaired');await p.reload();await ready();
 assert.equal(await p.locator('#announcement').evaluate(el=>el.classList.contains('visible')),false,'visits must not replay success notices');
 const state=await p.evaluate(()=>__demo.getState()),bounds=await p.locator('.console').boundingBox(),samples=[];
 const start=Date.now();
 while(Date.now()-start<65000){
  const sample=await world();samples.push({time:Math.round(sample.ambientTime),phase:sample.ambientPhase,cycle:sample.cycleIndex,position:sample.forkliftPosition,cargo:sample.cargoVisible,door:sample.doorOpen});
  assert.ok(sample.doorOpen>.99,'door must stay open in service');assert.equal(sample.dispatchProgress,1,'dispatch accomplishment remains acquired');
  if(sample.cycleIndex>=2)break;await p.waitForTimeout(400);
 }
 assert.ok(samples.at(-1).cycle>=2,'two full real-time cycles');
 const phases=new Set(samples.map(s=>s.phase));for(const phase of ['loading','outbound','unloading','returning-empty','home-pause'])assert.ok(phases.has(phase),`missing phase ${phase}`);
 assert.ok(samples.filter(s=>s.phase==='outbound').every(s=>s.cargo),'outbound carries cargo');assert.ok(samples.filter(s=>s.phase==='returning-empty').every(s=>!s.cargo),'return must be empty');
 assert.deepEqual(await p.evaluate(()=>__demo.getState()),state,'ambient loops cannot mutate progress');assert.equal(await p.locator('#announcement').evaluate(el=>el.classList.contains('visible')),false);assert.deepEqual(await p.locator('.console').boundingBox(),bounds);
 // Visibility event semantics are simulated because headless tabs do not reliably background.
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await world();await p.waitForTimeout(1500);assert.equal((await world()).ambientTime,hidden.ambientTime);assert.equal((await world()).effectiveMotionPaused,true);
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(250);const resumed=await world();assert.ok(resumed.ambientTime-hidden.ambientTime<600,'hidden time must not jump the tour');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);const calm=await world();await p.waitForTimeout(800);assert.equal((await world()).ambientTime,calm.ambientTime);assert.equal((await world()).animationRunning,false);assert.ok((await world()).doorOpen>.99);
 await p.emulateMedia({reducedMotion:'no-preference'});await preset('start');assert.ok((await world()).forkliftTilt< -1.4);assert.equal((await world()).repaired,false);assert.equal((await world()).ambientPhase,'alert');
 assert.deepEqual(errors,[]);fs.mkdirSync('.impeccable/review',{recursive:true});fs.writeFileSync('.impeccable/review/motion-verification.json',JSON.stringify({cycles:2,samples,pausePersists:true,calmMode:true,visibilityClock:'simulated visibilitychange event; no hidden time jump',stateUnchanged:true,deviceStable:true,realPhone:false,errors},null,2));
 await browser.close();console.log('Motion passed: two full real-time tours, loaded outbound, empty return, pause/reload, calm mode, hidden clock and scenario reset.');
})().catch(e=>{console.error(e);process.exit(1)});
