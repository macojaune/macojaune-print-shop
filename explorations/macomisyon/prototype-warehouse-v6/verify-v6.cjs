const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const url=process.env.DEMO_URL||'http://127.0.0.1:58017/';
  const ready=()=>p.waitForFunction(()=>window.__demo?.getWorld()?.renderCalls>0);
  const world=()=>p.evaluate(()=>__demo.getWorld());
  const load=async counts=>{await p.evaluate(counts=>{localStorage.setItem('macomisyon-warehouse-v6',JSON.stringify({schema:1,counts,completed:[],repaired:false,seenEvents:[]}));localStorage.removeItem('macomisyon-warehouse-v6-motion')},counts);await p.reload();await ready();};
  await p.goto(url);await ready();const first=await world();await p.waitForTimeout(800);const second=await world();
  assert.equal(second.alarmMix,1);assert.notEqual(first.wallBeaconAngle,second.wallBeaconAngle);assert.notEqual(first.truckBeaconAngle,second.truckBeaconAngle);
  await p.screenshot({path:'.impeccable/review/alert-mobile.png'});
  assert.equal(await p.getByText('Mode calme',{exact:true}).count(),0);
  await p.locator('#motionButton').click();await p.waitForTimeout(100);const frozen=await world();await p.waitForTimeout(500);assert.equal((await world()).wallBeaconAngle,frozen.wallBeaconAngle);await p.locator('#motionButton').click();
  const reports=[];
  for(const [name,counts,property,target] of [
   ['upright',{inscrits:10,retours:2,boutiques:1,bonus:0},'forkliftTilt',0],
   ['gathered',{inscrits:10,retours:5,boutiques:1,bonus:0},'cargoGathered',1],
   ['dock',{inscrits:10,retours:2,boutiques:5,bonus:0},'doorOpen',.22],
   ['repaired',{inscrits:10,retours:5,boutiques:5,bonus:0},'doorOpen',1],
  ]){
   await load(counts);const entry=await world();assert.equal(entry.arrivalAnimation,true,name+' entry');assert.ok(entry[property]!==target,name+' must start before final pose');
   const state=await p.evaluate(()=>__demo.getState());await p.screenshot({path:`.impeccable/review/${name}-arrival.png`});
   await p.waitForFunction(()=>__demo.getWorld().transitionProgress===null,{},{timeout:20000});const done=await world();assert.ok(Math.abs(done[property]-target)<.001,name+' ends');
   assert.deepEqual(await p.evaluate(()=>__demo.getState()),state);assert.equal(await p.locator('#announcement').evaluate(el=>el.classList.contains('visible')),false);
   reports.push({name,arrival:true,completed:true,stateUnchanged:true});
   if(name==='upright')assert.equal(done.alarmMix,0);
   if(name==='gathered')await p.screenshot({path:'.impeccable/review/gathered-mobile.png'});
  }
  await p.waitForFunction(()=>__demo.getWorld().ambientPhase==='returning-empty',{},{timeout:20000});assert.equal((await world()).cargoVisible,false);
  await p.waitForFunction(()=>__demo.getWorld().ambientPhase==='outbound',{},{timeout:30000});assert.equal((await world()).cargoVisible,true);
  await p.screenshot({path:'.impeccable/review/tour-mobile.png'});
  await p.locator('#motionButton').click();await p.reload();await ready();assert.equal((await world()).arrivalAnimation,false);assert.equal((await world()).motionPaused,true);
  await load({inscrits:2,retours:0,boutiques:0,bonus:0});await p.setViewportSize({width:1280,height:800});await p.waitForTimeout(400);await p.screenshot({path:'.impeccable/review/alert-desktop.png'});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
  fs.writeFileSync('.impeccable/review/verification.json',JSON.stringify({reports,alarmAndGyros:true,pause:true,repairedTour:true,errors},null,2));
  console.log('V6 passed: alarm, both gyros, four arrival states, unchanged progress, tour, pause/reload, mobile and desktop.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
