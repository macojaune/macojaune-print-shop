import test from 'node:test';
import assert from 'node:assert/strict';
import {CYCLE_DURATION,DOCK_HANDOFF_TIME,ALERT_PERIOD,createActiveClock,sampleTour,sampleSignals,routePose} from './ambient.js';
const near=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);

test('a restored repaired depot loads, delivers, returns empty and starts another trip',()=>{
  assert.equal(sampleTour(0).phase,'loading');assert.equal(sampleTour(0).cargoVisible,true);
  const dock=sampleTour(DOCK_HANDOFF_TIME);assert.equal(dock.phase,'dock-pause');assert.equal(dock.cargoVisible,false);
  near(dock.x,4.7);near(dock.z,-1.63);
  const returning=sampleTour(15000);assert.equal(returning.phase,'returning-empty');assert.equal(returning.cargoVisible,false);
  assert.ok(returning.z>dock.z);
  const home=sampleTour(21500);assert.equal(home.phase,'home-pause');assert.equal(home.cargoVisible,false);
  near(home.x,.05);near(home.z,.03);
  const next=sampleTour(CYCLE_DURATION+1000);assert.equal(next.cycleIndex,1);assert.equal(next.phase,'loading');assert.equal(next.cargoVisible,true);
});

test('truck position, heading and fork height remain continuous across every phase and cycle boundary',()=>{
  for(const time of [1800,2800,4000,6800,8000,10800,11400,12800,13800,14800,16800,18000,20000,20800,22000,44000]){
    const before=sampleTour(time-.001),after=sampleTour(time+.001);
    for(const key of ['x','z','yaw','lift'])near(before[key],after[key],.0001);
  }
});

test('the completed one-shot hands off at the exact dock pose without putting freight back on the forks',()=>{
  const final=routePose(1),ambient=sampleTour(DOCK_HANDOFF_TIME);
  near(final.x,ambient.x);near(final.z,ambient.z);near(final.yaw,ambient.yaw);
  near(ambient.lift,.1);assert.equal(ambient.cargoVisible,false);
});

test('all return samples are empty and stay on the same warehouse route',()=>{
  for(let time=12800;time<CYCLE_DURATION;time+=17){
    const sample=sampleTour(time);assert.equal(sample.cargoVisible,false);
    assert.ok(sample.x>=.05&&sample.x<=4.7);assert.ok(sample.z>=-1.63&&sample.z<=1.75);
  }
});

test('paused and hidden clocks neither advance nor catch up when resumed',()=>{
  const clock=createActiveClock();clock.tick(0);clock.tick(30);near(clock.time,30);
  clock.tick(70,{running:false});clock.tick(3000,{running:false});near(clock.time,30);
  clock.suspend();near(clock.tick(4000).delta,0);near(clock.tick(4030).time,60);
  clock.suspend();near(clock.tick(100000).time,60);near(clock.tick(100030).time,90);
  clock.reset();near(clock.time,0);near(clock.tick(500000).delta,0);
});

test('portable amber signal stays slow and disappears after the truck is upright',()=>{
  assert.ok(ALERT_PERIOD>=4000);
  const samples=Array.from({length:300},(_,i)=>sampleSignals(i*50,{statuses:{inscrits:'open',retours:'blocked'}}));
  for(const sample of samples){assert.ok(sample.alertLevel>=.32&&sample.alertLevel<=.42+1e-9);assert.equal(sample.signalLevels.retours,.05);}
  near(sampleSignals(0).alertLevel,sampleSignals(ALERT_PERIOD).alertLevel);
  assert.ok(sampleSignals(400,{completed:['inscrits']}).alertLevel>0);
  assert.equal(sampleSignals(400,{repaired:true}).alertLevel,0);
});
