// Deterministic visual timing. Nothing here reads or writes mission progress.
export const CYCLE_DURATION = 22000;
export const DOCK_HANDOFF_TIME = 12800;
export const ALERT_PERIOD = 5600;
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const between=(time,start,end)=>smooth((time-start)/(end-start));
const mix=(a,b,t)=>a+(b-a)*t;

/** A clock whose anchor is discarded while the surface is hidden or manually paused. */
export function createActiveClock(initialTime=0){
  let time=initialTime,anchor=null;
  return {
    tick(now,{running=true}={}){
      const delta=running&&anchor!==null?clamp(now-anchor,0,100):0;
      anchor=now;time+=delta;
      return {time,delta};
    },
    reset(value=0){time=value;anchor=null;},
    suspend(){anchor=null;},
    get time(){return time;},
  };
}

/** The outbound route is shared with v4's repair, and retraced empty on the return. */
export function routePose(progress){
  const a=between(progress,.31,.5),b=between(progress,.62,.88);
  const turnA=between(progress,.20,.31),turnB=between(progress,.5,.62);
  return {
    x:mix(mix(.05,3.85,a),4.7,b),
    z:mix(mix(.03,1.75,a),-1.63,b),
    yaw:mix(mix(-.14,Math.PI/2,turnA),Math.PI,turnB),
  };
}

/** One continuous 22-second work cycle, beginning with the next pallet at the feeder. */
export function sampleTour(elapsed){
  const total=Math.max(0,Number.isFinite(elapsed)?elapsed:0);
  const cycleIndex=Math.floor(total/CYCLE_DURATION),time=total%CYCLE_DURATION;
  let phase,route=0,lift=0,cargoVisible=true,cargoOffsetX=0,cargoOffsetZ=0,cargoOffsetY=0,exit=0;
  if(time<1800){phase='loading';cargoOffsetX=-1.7*(1-between(time,0,1800));}
  else if(time<2800){phase='lifting';lift=.68*between(time,1800,2800);}
  else if(time<4000){phase='turning-out';route=mix(.20,.31,between(time,2800,4000));lift=.68;}
  else if(time<6800){phase='outbound';route=mix(.31,.5,between(time,4000,6800));lift=.68;}
  else if(time<8000){phase='turning-dock';route=mix(.5,.62,between(time,6800,8000));lift=.68;}
  else if(time<10800){phase='approaching-dock';route=mix(.62,.88,between(time,8000,10800));lift=.68;}
  else if(time<12800){
    phase='unloading';route=.88;
    lift=mix(.68,.1,between(time,10800,11400));
    exit=between(time,11400,12800);cargoVisible=exit<.985;
    cargoOffsetY=-.1*exit;cargoOffsetZ=-1.93*exit;
  }
  else if(time<13800){phase='dock-pause';route=.88;lift=.1;cargoVisible=false;}
  else if(time<16800){phase='returning-empty';route=mix(.88,.62,between(time,13800,16800));lift=mix(.1,0,between(time,13800,14800));cargoVisible=false;}
  else if(time<18000){phase='turning-home';route=mix(.62,.5,between(time,16800,18000));cargoVisible=false;}
  else if(time<20000){phase='returning-empty';route=mix(.5,.31,between(time,18000,20000));cargoVisible=false;}
  else if(time<20800){phase='turning-home';route=mix(.31,.20,between(time,20000,20800));cargoVisible=false;}
  else {phase='home-pause';cargoVisible=false;}
  return {phase,cycleIndex,time,route,...routePose(route),lift,cargoVisible,cargoOffsetX,cargoOffsetY,cargoOffsetZ,exit};
}

/** Slow local levels only. The warehouse's general lighting never pulses. */
export function sampleSignals(time,{completed=[],statuses={},repaired=false}={}){
  const safeTime=Number.isFinite(time)?time:0;
  const pulse=(period,offset=0)=>(1+Math.sin(safeTime/period*Math.PI*2+offset))/2;
  const alertLevel=repaired?0:.32+.1*pulse(ALERT_PERIOD);
  const signalLevels={};
  ['inscrits','retours','boutiques','bonus'].forEach((id,index)=>{
    const status=statuses[id]??(completed.includes(id)?'completed':'open');
    signalLevels[id]=status==='blocked'?.05:status==='completed'?.38+.1*pulse(6400,index*.9):.2+.1*pulse(6800,index*.9);
  });
  return {alertLevel,signalLevels,scan:(1-Math.cos(safeTime/7200*Math.PI*2))/2,beacon:.88+.16*pulse(6400)};
}
