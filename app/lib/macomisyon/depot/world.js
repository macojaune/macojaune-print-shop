import * as THREE from 'three';
import {CYCLE_DURATION,DOCK_HANDOFF_TIME,createActiveClock,sampleTour,sampleSignals} from './ambient.js';
import {colors,material,mesh,box,cylinder,group,sign,parcel,mailer,pallet,rack,trolley,cone,packingTable,forklift,bake,disposeAssetCache} from './props.js';

const STATIONS = [
  {id:'inscrits',code:'01',name:'Les inscrits',short:'Inscrits',position:[-3.65,0,3.05]},
  {id:'retours',code:'03',name:'Les nouveaux avis',short:'Avis',position:[-3.35,0,-.8]},
  {id:'boutiques',code:'02',name:'Les nouvelles boutiques',short:'Boutiques',position:[3.15,0,-.05]},
  {id:'bonus',code:'+',name:'Le bonus',short:'Bonus',position:[3.55,0,4.02]},
];
const DEFAULT_STATE={completed:[],repaired:false,selected:null,statuses:{inscrits:'open',retours:'blocked',boutiques:'blocked',bonus:'open'},revealLocked:false};
const clamp=THREE.MathUtils.clamp;
const motionQuery=()=>window.matchMedia('(prefers-reduced-motion: reduce)');

/** One orthographic miniature. Business rules and persistent progress live in model.js. */
export function createWorld({canvas,container,labels,onSelect}) {
  const scene=new THREE.Scene();
  const root=new THREE.Group();scene.add(root);
  const camera=new THREE.OrthographicCamera(-8,8,8,-8,.1,100);
  const target=new THREE.Vector3(0,.65,0),home=target.clone();
  const offset=new THREE.Vector3(15,18,22);
  const right=new THREE.Vector3(offset.z,0,-offset.x).normalize();
  const away=new THREE.Vector3(offset.x,0,offset.z).normalize();
  const raycaster=new THREE.Raycaster(),pickTargets=[],labelNodes=[],stations=new Map();
  const pointers=new Map();
  let state={...DEFAULT_STATE},renderer=null,raf=0,zoom=1,span=14,width=1,height=1;
  let destroyed=false,contextLost=false,intersecting=true,animation=null,cameraFlight=null,gesture=null,renderCount=0,lastTime=0;
  let visualPose=null,dispatchProgress=0,focusedNode=null;
  let motionPaused=false,ambientTime=0,tourTime=0,ambientPhase='alert',cycleIndex=0,alertLevel=0,signalLevels={};
  let dirty=true,lastDrawTime=-Infinity,ambientLight,sunlight,fill,feeder,scanBeam,bonusIndicator,accidentLight,wallBeacon,wallRotor,wallSpot,truckRotor,truckSpot,backdropMaterial,wallHalo;
  const motionClock=createActiveClock(),cameraClock=createActiveClock(),alertBeacons=[],frameTimes=[];
  let truck,bonusLoad,bonusLights,ceilingLights,warehouseGlow,activeHalo,shutter,cargoRoot,projectHitbox;
  const freight=[];
  const alarmSky=new THREE.Color(0xff652b),normalSky=new THREE.Color(0xfff6dc);
  const alarmGround=new THREE.Color(0x3a151c),normalGround=new THREE.Color(0xa1ac9b);
  const alarmSun=new THREE.Color(0xff6a36),normalSun=new THREE.Color(0xffecc7);
  const alarmBackdrop=new THREE.Color(0x49302a),normalBackdrop=new THREE.Color(0xe3dcc6);
  const alarmFill=new THREE.Color(0xb42d27),normalFill=new THREE.Color(0xffffff);
  let alarmMix=1;
  const reduced=motionQuery();
  let appliedReducedMotion=reduced.matches;
  const disposers=[];
  const active=()=>!destroyed&&!contextLost&&!document.hidden&&intersecting;
  const effectiveMotionPaused=()=>motionPaused||reduced.matches||!active();
  const shouldAnimate=()=>active()&&(cameraFlight!==null||!effectiveMotionPaused());

  function addListener(el,event,handler,options) {
    el.addEventListener(event,handler,options);disposers.push(()=>el.removeEventListener(event,handler,options));
  }
  function prepareScene() {
    scene.background=new THREE.Color(0xe3dcc6);
    ambientLight=new THREE.HemisphereLight(0xfff6dc,0xa1ac9b,2.12);scene.add(ambientLight);
    sunlight=new THREE.DirectionalLight(0xffecc7,3.2);
    sunlight.position.set(-7,15,9);sunlight.castShadow=true;
    sunlight.shadow.mapSize.set(1536,1536);
    Object.assign(sunlight.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:45});
    sunlight.shadow.normalBias=.035;sunlight.shadow.bias=-.00015;
    sunlight.shadow.radius=3;scene.add(sunlight);
    fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(9,7,-4);scene.add(fill);
    warehouseGlow=new THREE.PointLight(0xffdf7a,0,12,1.5);warehouseGlow.position.set(0,3.5,0);scene.add(warehouseGlow);
    const scenery=group(root);
    backdropMaterial=new THREE.MeshBasicMaterial({color:0xe3dcc6});
    const backdrop=box(scenery,[160,.15,160],[0,-.71,0],backdropMaterial,0);backdrop.castShadow=false;
    // A thick floor slab and three cutaway walls give the object a warehouse silhouette.
    box(scenery,[13.95,.49,10.85],[0,-.33,.3],0x929b8c,.11);
    box(scenery,[13.74,.16,10.64],[0,-.015,.3],colors.floor,.065);
    for(let x=-4;x<=4;x+=2)floorLine(scenery,[x,.07,-4.87],[x,.07,4.87],0xb9bbaa,.014);
    for(let z=-3;z<=3;z+=2)floorLine(scenery,[-5.92,.07,z],[5.92,.07,z],0xb9bbaa,.014);
    box(scenery,[13.7,3.35,.2],[0,1.72,-4.8],colors.cream,.045);
    box(scenery,[13.7,.28,.24],[0,.25,-4.73],colors.teal,.025);
    box(scenery,[.2,1.37,4.0],[-6.79,.73,-2.85],colors.cream,.05);
    box(scenery,[.24,.27,4],[-6.77,.25,-2.85],colors.teal,.02);
    box(scenery,[.2,2.62,1.36],[6.79,1.35,-4.2],colors.cream,.045);
    box(scenery,[13.92,.2,.48],[0,3.42,-4.76],colors.teal,.04);
    // Uprights and warm industrial lights under a narrow surviving roof strip.
    ceilingLights=group(root);
    for(const x of[-5.75,-1.9,1.95,5.75]){
      box(scenery,[.13,3.23,.17],[x,1.7,-4.6],colors.steel,.015);
      box(scenery,[.22,.14,.8],[x,3.32,-4.33],colors.steel,.02);
      box(scenery,[.95,.09,.3],[x,3.11,-4.14],colors.ink,.02);
      box(ceilingLights,[.77,.025,.22],[x,3.052,-4.11],material(0xffefc6,{emissive:0xffdc82,emissiveIntensity:.2}),.008);
    }
    // Shipping door is a cutaway loading bay, with corrugated shutter and buffer posts.
    box(scenery,[1.65,2.55,.07],[4.7,1.42,-4.663],colors.ink,.025);
    // The shutter contracts into its header; the opening remains a dark tunnel.
    shutter=group(root,[4.7,.34,-4.6]);
    box(shutter,[1.4,2.14,.05],[0,1.07,0],0xb2b8aa,.01);
    for(let y=.08;y<2.13;y+=.155)box(shutter,[1.38,.018,.018],[0,y,.042],colors.steel,.001);
    box(shutter,[.26,.052,.09],[0,.35,.07],colors.ink,.008);bake(shutter);
    box(scenery,[1.63,.2,.37],[4.7,2.66,-4.55],colors.teal,.04);
    for(let i=0;i<7;i++){
      const roller=cylinder(scenery,.065,1.35,[4.7,.15,-3.7-i*.13],colors.steel,.065,12);roller.rotation.z=Math.PI/2;
    }
    for(const x of[3.96,5.44])box(scenery,[.09,.12,1.02],[x,.15,-4.1],colors.ink,.016);
    sign(scenery,'EXPÉDITION',[1.6,.32,.035],[4.7,2.88,-4.624],{background:'#293a38',color:'#f5eac9',width:512});
    for(const x of[3.7,5.68]){cylinder(scenery,.085,.73,[x,.43,-3.94],colors.yellow);cylinder(scenery,.089,.18,[x,.47,-3.94],colors.ink);}
    sign(scenery,'LE DÉPÔT Q',[3.7,.51,.045],[-2.75,2.95,-4.653],{background:'#f3ecd6',width:1024});
    sign(scenery,'01 — 03',[1.25,.31,.04],[1.5,2.96,-4.65],{background:'#f4ca45',width:512});
    // Shelves mix tall cartons and soft fashion parcels. They are asymmetrical by design.
    rack(scenery,{position:[-3.0,.09,-3.89],width:4.37,height:2.53,depth:1.1,bays:4,code:'A'});
    rack(scenery,{position:[1.08,.09,-3.88],width:2.85,height:2.53,depth:1.04,bays:3,code:'B'});
    // Raised receiving stack on left, finished packing bench on the right.
    const leftPallet=pallet(scenery,{position:[-4.88,.08,.31],rotation:-.06,size:[1.35,1.18]});
    parcel(leftPallet,{position:[-.31,.26,-.15],size:[.61,.74,.8],tone:1});
    parcel(leftPallet,{position:[.32,.26,-.14],size:[.57,.51,.8],tone:0});
    parcel(leftPallet,{position:[-.23,1,-.13],size:[.67,.47,.69],rotation:.12,tone:0});
    mailer(leftPallet,{position:[.35,.78,-.12],size:[.59,.23,.73],dark:true,rotation:-.16});
    trolley(scenery,{position:[-4.63,.07,-1.76],rotation:.35});
    const bags=pallet(scenery,{position:[-4.75,.09,3.26],rotation:.1,size:[1.47,1.17]});
    for(let layer=0;layer<4;layer++)for(let side=0;side<2;side++)mailer(bags,{
      position:[(side-.5)*.68,.26+layer*.175,(layer%2-.5)*.08],size:[.74,.24,.9],
      dark:(layer+side)%3!==1,rotation:(layer%2?-.11:.1)+side*.07,seed:layer*3+side,
    });
    parcel(scenery,{position:[-5.1,.085,1.73],size:[.71,.68,.76],tone:0,rotation:.06});
    parcel(scenery,{position:[-5.12,.77,1.74],size:[.54,.44,.61],tone:1,rotation:-.1});
    packingTable(scenery,{position:[6.1,.07,-1.6],rotation:Math.PI/2});
    parcel(scenery,{position:[6.17,.07,-3.23],size:[.72,.77,.75],tone:1});
    parcel(scenery,{position:[6.12,.85,-3.26],size:[.62,.45,.63],tone:0,rotation:.12});
    mailer(scenery,{position:[6.13,.08,1.41],size:[.75,.22,.64],dark:false,rotation:.14});
    // An open carton of white/black mailers and a roll cage at the front right.
    const dispatch=group(scenery,[6.13,.09,4.14],.07);
    box(dispatch,[1.05,.11,1.32],[0,.15,0],colors.steel,.025);
    for(const x of[-.45,.45])for(const z of[-.59,.59]){
      box(dispatch,[.039,1.49,.039],[x,.94,z],colors.steel,.008);
      const caster=cylinder(dispatch,.075,.066,[x,.06,z],colors.rubber);caster.rotation.z=Math.PI/2;
    }
    for(let j=0;j<4;j++){
      const y=.41+j*.36;
      for(const x of[-.45,.45])box(dispatch,[.031,.029,1.17],[x,y,0],colors.steel,.004);
      box(dispatch,[.9,.027,.03],[0,y,-.59],colors.steel,.003);
    }
    parcel(dispatch,{position:[0,.22,-.13],size:[.75,.6,.71],tone:0});
    mailer(dispatch,{position:[0,.83,0],size:[.81,.21,.88],dark:true,rotation:-.13});
    mailer(dispatch,{position:[0,1.02,.04],size:[.84,.22,.83],dark:false,rotation:.08});
    sign(dispatch,'Q',[.44,.31,.023],[0,1.43,.607],{background:'#f3c42e',width:128,height:128});
    // A few intentional operational details anchor the scale.
    cone(scenery,[-1.65,.09,1.05],.85);cone(scenery,[1.88,.09,-1.56],.8);
    pallet(scenery,{position:[-5.25,.08,-2.67],rotation:.11,size:[.84,.81]});
    pallet(scenery,{position:[-5.25,.35,-2.67],rotation:.07,size:[.84,.81]});
    const board=group(scenery,[5.78,1.62,-2.81],-Math.PI/2);
    box(board,[.65,.8,.07],[0,0,0],colors.kraftDark,.022);
    sign(board,'Q',[.23,.28,.015],[-.1,.17,.042],{barcode:true});
    sign(board,'↗',[.25,.28,.015],[.12,-.17,.042],{});
    // Painted safety rectangles and segmented lane markings stay on the floor.
    dashedLine(scenery,[-1.52,.083,-2.51],[-1.52,.083,4.1],colors.cream,.055,.3,.22);
    dashedLine(scenery,[1.81,.083,-2.51],[1.81,.083,4.1],colors.cream,.055,.3,.22);
    for(const x of[-1.52,1.81])floorLine(scenery,[x,.086,4.15],[x+.6*(x<0?1:-1),.086,4.15],colors.cream,.055);
    for(const z of[-2.31,3.79])floorArrow(scenery,[.18,.087,z],colors.cream,z<0?Math.PI:0);
    for(let i=0;i<6;i++){
      const stripe=box(scenery,[.24,.012,.57],[-.55+i*.25,.085,-2.62],i%2?colors.ink:colors.yellow,0);stripe.rotation.y=-.3;
    }
    // Front slab edge identifies the miniature and keeps the cutaway deliberate.
    sign(scenery,'QUI LIVRE OÙ',[2.12,.24,.024],[-4.25,-.29,5.73],{background:'#435b53',color:'#f8edcb',width:512});
    sign(scenery,'Q / 971',[.85,.23,.024],[5.6,-.29,5.73],{background:'#efc541',width:256});
    bake(scenery);bake(ceilingLights);
    truck=forklift(root,{position:[.05,.07,.03],rotation:-.14,loaded:false});
    projectHitbox=box(truck.group,[1.8,2.85,3.6],[0,1.43,.5],new THREE.MeshBasicMaterial({visible:false}),0);
    projectHitbox.userData.node='project';pickTargets.push(projectHitbox);
    createFreight();
    createAmbientAssets();
    activeHalo=mesh(new THREE.RingGeometry(.77,.86,48),material(colors.yellow,{emissive:colors.yellow,emissiveIntensity:.3,side:THREE.DoubleSide}),root);
    activeHalo.rotation.x=-Math.PI/2;activeHalo.position.set(.05,.086,.06);activeHalo.visible=false;
    for(const definition of STATIONS)createStation(definition);
    bonusLoad=group(root,[3.47,.08,3.44]);
    const bonusBox=parcel(bonusLoad,{position:[0,0,0],size:[.66,.43,.61],tone:0});
    box(bonusBox,[.075,.015,.63],[0,.444,0],colors.teal,.002);
    box(bonusBox,[.69,.016,.075],[0,.445,0],colors.teal,.002);
    for(const x of[-.13,.13]){const bow=mesh(new THREE.TorusGeometry(.1,.019,5,10),material(colors.teal),bonusBox);bow.rotation.x=Math.PI/2;bow.scale.x=1.32;bow.position.set(x,.49,0);}
    for(const [i,code] of ['971','972','973'].entries())sign(bonusLoad,code,[.31,.14,.02],[-.28+i*.3,.38,.319],{background:'#518579',color:'#fff6dc',width:128,height:64});
    bake(bonusLoad);bonusLoad.visible=false;
    bonusLights=group(root);
    for(let i=0;i<5;i++){
      const paper=box(bonusLights,[.07,.015,.14],[2.73+(i%3)*.32,.1,3.01+Math.floor(i/3)*.76],i%2?colors.teal:colors.yellow,.006);
      paper.rotation.y=i*.8;
    }
    bake(bonusLights);bonusLights.visible=false;
    createLabel({id:'project',code:'Q',name:'QuiLivreOù',short:'Le projet'},new THREE.Vector3(.05,2.77,.13));
  }
  function createFreight() {
    cargoRoot=group(root);
    function piece(object,scatter,rotation,assembled){
      bake(object);freight.push({object,scatter:new THREE.Vector3(...scatter),rotation:new THREE.Euler(...rotation),assembled:new THREE.Vector3(...assembled)});
    }
    piece(pallet(cargoRoot,{size:[1.3,1.1]}),[-.75,.64,2.43],[.91,.3,.2],[0,.235,1.86]);
    piece(parcel(cargoRoot,{size:[.59,.69,.8],tone:0}),[-1.46,.4,3.81],[0,.35,1.48],[-.28,.495,1.83]);
    piece(parcel(cargoRoot,{size:[.52,.52,.77],tone:1}),[1.09,.085,3.46],[0,.72,0],[.32,.495,1.83]);
    piece(parcel(cargoRoot,{size:[.63,.4,.62],tone:0}),[.03,.46,4.46],[-1.45,.26,-.12],[.08,1.205,1.86]);
    piece(mailer(cargoRoot,{size:[.63,.18,.59],dark:true}),[.65,.087,2.77],[0,-.42,0],[.32,1.035,1.82]);
    piece(mailer(cargoRoot,{size:[.55,.17,.53],dark:false}),[-2.1,.088,2.83],[0,.24,0],[.09,1.61,1.86]);
  }
  function createAmbientAssets(){
    // Portable industrial warning lamps, with square feet and protective cages.
    // Small ground lamps complement the larger wall and vehicle beacons.
    for(const [x,z] of [[-1.92,.72],[.66,3.08]]){
      const beacon=group(root,[x,.09,z]),housing=group(beacon);
      box(housing,[.49,.105,.42],[0,.053,0],colors.ink,.032);
      box(housing,[.32,.16,.28],[0,.17,0],colors.yellow,.026);
      box(housing,[.35,.045,.29],[0,.17,0],colors.ink,.005);
      cylinder(housing,.058,.36,[0,.42,0],colors.steel);
      cylinder(housing,.215,.075,[0,.625,0],colors.ink);
      cylinder(housing,.215,.065,[0,.977,0],colors.ink);
      const lens=cylinder(beacon,.185,.28,[0,.8,0],material(0xffcb58,{emissive:0xffb325,emissiveIntensity:1.8,roughness:.3}).clone(),.185,20);
      for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5]){
        box(housing,[.022,.33,.022],[Math.cos(a)*.194,.8,Math.sin(a)*.194],colors.steel,.003);
      }
      housing.traverse(object=>{if(object.isMesh)object.castShadow=false;});bake(housing);
      lens.castShadow=false;lens.receiveShadow=false;alertBeacons.push(lens);
    }
    accidentLight=new THREE.PointLight(0xffbb50,0,4.2,2);
    accidentLight.position.set(-1.92,.91,.72);accidentLight.castShadow=false;scene.add(accidentLight);
    // Oversized wall alarm: readable at map scale, with a slow rotating reflector.
    const wallHousing=group(root,[.05,3.35,-4.26]);
    box(wallHousing,[1.05,.12,.68],[0,0,0],colors.ink,.025);
    box(wallHousing,[.12,.55,.52],[0,-.25,-.18],colors.steel,.014);
    cylinder(wallHousing,.34,.07,[0,.08,0],colors.ink);
    cylinder(wallHousing,.34,.05,[0,.73,0],colors.ink);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;box(wallHousing,[.035,.6,.035],[Math.cos(a)*.315,.41,Math.sin(a)*.315],colors.steel,.005);}
    sign(wallHousing,'ARRÊT',[1.0,.29,.04],[0,-.26,.19],{background:'#581d1c',color:'#ffe3a5',width:256});
    bake(wallHousing);
    wallBeacon=cylinder(root,.29,.56,[.05,3.76,-4.26],material(0xff3822,{emissive:0xff220a,emissiveIntensity:2,transparent:true,opacity:.72,depthWrite:false}).clone(),.29,24);
    wallBeacon.castShadow=false;
    wallRotor=group(root,[.05,3.76,-4.26]);
    box(wallRotor,[.35,.4,.065],[0,0,.12],new THREE.MeshBasicMaterial({color:0xffe1a0}),.02).castShadow=false;
    wallSpot=new THREE.SpotLight(0xff2a0c,110,20,.65,.8,1.2);
    wallSpot.position.set(.05,3.8,-4.05);scene.add(wallSpot,wallSpot.target);
    truckRotor=group(truck.group,[.46,2.69,-.42]);
    box(truckRotor,[.2,.17,.04],[0,0,.07],new THREE.MeshBasicMaterial({color:0xfff0b4}),.012).castShadow=false;
    truck.beacon.material.transparent=true;truck.beacon.material.opacity=.7;truck.beacon.material.depthWrite=false;
    truckSpot=new THREE.SpotLight(0xffa126,28,8,.68,.8,1.3);
    truckSpot.position.set(.46,2.7,-.42);truck.group.add(truckSpot,truckSpot.target);
    const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
    const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
    gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.22,'rgba(255,255,255,.55)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
    const glowTexture=new THREE.CanvasTexture(glowCanvas);
    wallHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xff391a,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending}));
    wallHalo.position.set(.05,3.8,-4.26);wallHalo.scale.set(1.7,1.7,1);root.add(wallHalo);
    const truckHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xffa82b,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending}));
    truckHalo.position.set(.46,2.69,-.42);truckHalo.scale.set(.85,.85,1);truck.group.add(truckHalo);
    // A short roller feeder receives the next pallet while the truck waits at home.
    feeder=group(root);
    for(const z of[1.38,2.36])box(feeder,[2.55,.1,.07],[-1.34,.22,z],colors.teal,.01);
    for(let i=0;i<10;i++){
      const roller=cylinder(feeder,.05,.91,[-2.45+i*.24,.25,1.87],colors.steel,.05,12);roller.rotation.x=Math.PI/2;
    }
    bake(feeder);
    scanBeam=box(root,[.037,.01,.84],[-1.2,.315,1.87],material(0x93d2aa,{emissive:0x6ecca4,emissiveIntensity:.6,transparent:true,opacity:.65}).clone(),.002);
    scanBeam.castShadow=false;
    bonusIndicator=cylinder(root,.052,.065,[3.45,.58,3.77],material(colors.teal,{emissive:0x94dab4,emissiveIntensity:.45}).clone());
  }
  function floorLine(parent,start,end,color,thickness=.04) {
    const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),delta=b.clone().sub(a);
    const line=box(parent,[thickness,.003,delta.length()],a.clone().add(b).multiplyScalar(.5).add(new THREE.Vector3(0,.012,0)).toArray(),color,0);
    line.rotation.y=Math.atan2(delta.x,delta.z);line.castShadow=false;return line;
  }
  function dashedLine(parent,start,end,color,thickness=.05,dash=.24,gap=.16) {
    const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),direction=b.clone().sub(a),length=direction.length();direction.normalize();
    for(let i=0;i<length;i+=dash+gap)floorLine(parent,a.clone().addScaledVector(direction,i).toArray(),a.clone().addScaledVector(direction,Math.min(length,i+dash)).toArray(),color,thickness);
  }
  function floorArrow(parent,position,color,rotation) {
    const g=group(parent,position,rotation);
    floorLine(g,[0,0,-.3],[0,0,.26],color,.08);
    floorLine(g,[0,0,.26],[-.19,0,.04],color,.08);floorLine(g,[0,0,.26],[.19,0,.04],color,.08);
  }
  function createStation(definition) {
    const node=group(root,definition.position),staticParts=group(node);
    cylinder(staticParts,.55,.043,[0,.101,0],0xaab7a2,.55,32);
    const ring=mesh(new THREE.RingGeometry(.43,.52,40),material(colors.yellow).clone(),node);
    ring.rotation.x=-Math.PI/2;ring.position.y=.132;
    const center=cylinder(node,.33,.058,[0,.135,0],material(colors.cream),.33,32);
    const number=sign(staticParts,definition.code,[.39,.012,.39],[0,.17,0],{background:'#efe6cd',width:128,height:128});
    number.geometry=new THREE.PlaneGeometry(.39,.39);number.rotation.x=-Math.PI/2;
    for(const [x,z] of[[-.62,-.62],[.62,.62]]){
      floorLine(staticParts,[x,.09,z],[x-Math.sign(x)*.25,.09,z],colors.cream,.045);
      floorLine(staticParts,[x,.09,z],[x,.09,z-Math.sign(z)*.25],colors.cream,.045);
    }
    bake(staticParts);
    const hit=box(node,[1.18,.38,1.18],[0,.24,0],new THREE.MeshBasicMaterial({visible:false}),0);
    hit.userData.node=definition.id;pickTargets.push(hit);
    const sweep=mesh(new THREE.RingGeometry(.37,.41,24,1,0,Math.PI*.42),material(colors.yellow,{transparent:true,opacity:.45,emissive:colors.yellow,emissiveIntensity:.3,side:THREE.DoubleSide}).clone(),node);
    sweep.rotation.x=-Math.PI/2;sweep.position.y=.18;sweep.castShadow=false;
    stations.set(definition.id,{ring,center,sweep,definition,node});
    const labelPosition=new THREE.Vector3(...definition.position).add(new THREE.Vector3(0,.18,.45));
    createLabel(definition,labelPosition);
  }
  function createLabel(definition,position) {
    const el=document.createElement('button');el.type='button';
    el.className=`world-label ${definition.id==='project'?'project-label':'node-label'}`;
    el.dataset.node=definition.id;
    const code=document.createElement('span');code.className='label-code';code.textContent=definition.code;
    const name=document.createElement('span');name.className='label-name';name.textContent=definition.short;
    el.append(code,name);el.addEventListener('click',()=>onSelect?.(definition.id));
    labels.append(el);labelNodes.push({el,definition,position});
  }
  function statusOf(definition) {
    return state.statuses?.[definition.id]??(state.completed.includes(definition.id)?'completed':'open');
  }
  function applyState() {
    if(!truck)return;
    for(const {ring,center,definition} of stations.values()){
      const status=statusOf(definition),selected=state.selected===definition.id;
      ring.material.color.set(status==='completed'?colors.teal:status==='blocked'?0x969e91:colors.yellow);
      ring.material.emissive.set(status==='completed'?colors.teal:colors.yellow);
      ring.material.emissiveIntensity=selected?.18:0;
      center.material=material(status==='completed'?0xc6d9b4:status==='blocked'?0xbec3b3:colors.cream);
    }
    for(const {el,definition} of labelNodes){
      const isProject=definition.id==='project';
      const status=isProject?(state.repaired?'completed':'open'):statusOf(definition);
      const spoken=isProject?(state.repaired?'chariot réparé':'chariot en panne'):{completed:'accompli',blocked:'bloqué',open:'ouvert'}[status];
      el.dataset.status=status;el.dataset.selected=String(state.selected===definition.id);
      const code=el.querySelector('.label-code');
      if(!isProject && status!=='open'){
        const path=status==='completed'?'m5 12 4 4L19 6':'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3';
        code.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
      }else code.textContent=definition.code;

      const masked=!isProject&&status==='blocked'&&!state.revealLocked;
      el.querySelector('.label-name').textContent=masked?'Verrouillée':definition.short;
      el.setAttribute('aria-label',`${masked?'Étape verrouillée':definition.name}, ${spoken}`);
      el.setAttribute('aria-pressed',String(state.selected===definition.id));
    }
    activeHalo.visible=state.selected==='project';
    bonusLoad.visible=state.completed.includes('bonus');bonusLights.visible=bonusLoad.visible;
    const battery=state.repaired;
    truck.unplugged.visible=!battery;truck.plug.visible=!battery;
    truck.prongs?.forEach(part=>part.visible=!battery);
    ambientLight.intensity=battery?2.35:2.12;
    feeder.visible=state.completed.includes('retours');
    bonusIndicator.visible=state.completed.includes('bonus');
  }
  function repairTarget() {
    const upright=state.repaired,gathered=state.completed.includes('retours');
    return {tilt:upright?0:-1.48,hood:upright?0:-.72,mast:gathered?0:-.12,gather:gathered?1:0,lift:state.repaired?.1:0,light:state.repaired?1:state.completed.includes('inscrits')?.3:0,door:state.repaired?1:state.completed.includes('boutiques')?.22:0,dispatch:state.repaired?1:0};
  }
  function currentPose(){return visualPose?{...visualPose}:repairTarget();}
  const smooth=(value)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};
  const phase=(value,start,end)=>smooth((value-start)/(end-start));
  function applyRepairPose(pose,tour=null) {
    visualPose={...pose};dispatchProgress=tour?1:pose.dispatch;
    const d=pose.dispatch,travelA=phase(d,.31,.5),travelB=phase(d,.62,.88);
    const turnA=phase(d,.20,.31),turnB=phase(d,.5,.62);
    const baseX=.05-1.15*clamp(-pose.tilt/1.48,0,1);
    const x=tour?.x??THREE.MathUtils.lerp(THREE.MathUtils.lerp(baseX,3.85,travelA),4.7,travelB);
    const z=tour?.z??THREE.MathUtils.lerp(THREE.MathUtils.lerp(.03,1.75,travelA),-1.63,travelB);
    const yaw=tour?.yaw??THREE.MathUtils.lerp(THREE.MathUtils.lerp(-.14,Math.PI/2,turnA),Math.PI,turnB);
    truck.group.position.set(x,.07+Math.sin(Math.abs(pose.tilt))*.79,z);
    truck.group.rotation.set(0,yaw,pose.tilt);
    truck.hood.rotation.x=pose.hood;truck.mast.rotation.z=pose.mast;
    const lift=tour?.lift??(d>0&&d<1?.68*phase(d,0,.18)*(1-.853*phase(d,.76,.9)):pose.lift);
    truck.forks.position.y=lift;truck.forks.rotation.z=pose.mast*.6;
    truck.group.updateWorldMatrix(true,true);
    // The same carton meshes move from their fallen poses onto the pallet.
    // They then remain fixed on the forks until the short conveyor handoff.
    const truckRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0));
    for(const part of freight){
      const assembled=part.assembled.clone();assembled.y+=lift;
      // Parcels can be sorted while the Fenwick is still down. They join its
      // forks only as the three main goals bring the vehicle back upright.
      const onForks=truck.group.localToWorld(assembled);
      const parked=new THREE.Vector3(assembled.x+.25,assembled.y+.07,assembled.z+1.1);
      const destination=parked.lerp(onForks,1-clamp(-pose.tilt/1.48,0,1));
      part.object.position.lerpVectors(part.scatter,destination,pose.gather);
      part.object.quaternion.setFromEuler(part.rotation).slerp(truckRotation,pose.gather);
      part.object.position.y+=Math.sin(pose.gather*Math.PI)*.28;
    }
    const exit=phase(d,.88,1);
    cargoRoot.position.set(tour?.cargoOffsetX??0,tour?.cargoOffsetY??(-.1*exit),tour?.cargoOffsetZ??(-1.93*exit));
    cargoRoot.visible=tour?.cargoVisible??(exit<.985);
    const door=tour?1:(d>0&&d<1?phase(d,.12,.47):pose.door);
    shutter.position.y=.34+2.05*door;shutter.scale.y=1-.94*door;
    const light=d>0&&d<1?phase(d,0,.18):pose.light;
    warehouseGlow.intensity=light*9;
    ceilingLights.children.forEach(lamp=>lamp.material.emissiveIntensity=.2+light*1.2);
    truck.headlights.forEach(lamp=>lamp.material.emissiveIntensity=.03+light*1.8);
    truck.beacon.material.emissiveIntensity=.12+light*1.1;
    const label=labelNodes.find(entry=>entry.definition.id==='project');
    const anchor=truck.group.localToWorld(new THREE.Vector3(0,1.4,.15)).add(new THREE.Vector3(0,1.35,0));
    if(label)label.position.copy(anchor);
    activeHalo.position.set(anchor.x,.093,anchor.z);
  }
  function showStablePose(){
    if(state.repaired){
      if(reduced.matches)tourTime=2800;
      const tour=sampleTour(tourTime);
      applyRepairPose(repairTarget(),tour);ambientPhase=tour.phase;cycleIndex=tour.cycleIndex;
    }else{
      applyRepairPose(repairTarget());ambientPhase=state.completed.includes('retours')?'gathered':state.completed.includes('inscrits')?'ready':'alert';cycleIndex=0;
    }
  }
  function applySignals(){
    const sample=sampleSignals(ambientTime,state);alertLevel=sample.alertLevel;signalLevels=sample.signalLevels;
    // Fade the emergency atmosphere as the vehicle physically gets back on its wheels.
    const restoredWork=state.completed.filter(id=>id!=='bonus').length;
    alarmMix=clamp(-(visualPose?.tilt??-1.48)/1.48,0,1)*(1-.13*Math.min(restoredWork,2));
    ambientLight.color.copy(normalSky).lerp(alarmSky,alarmMix);
    ambientLight.groundColor.copy(normalGround).lerp(alarmGround,alarmMix);
    ambientLight.intensity=THREE.MathUtils.lerp(2.35,1.05,alarmMix);
    sunlight.color.copy(normalSun).lerp(alarmSun,alarmMix);
    sunlight.intensity=THREE.MathUtils.lerp(3.2,1.35,alarmMix);
    fill.color.copy(normalFill).lerp(alarmFill,alarmMix);fill.intensity=.7;
    backdropMaterial.color.copy(normalBackdrop).lerp(alarmBackdrop,alarmMix);
    scene.background.copy(backdropMaterial.color);
    wallHalo.material.opacity=.48*alarmMix;
    const angle=ambientTime/5600*Math.PI*2;
    wallRotor.rotation.y=angle;wallRotor.visible=alarmMix>.01;
    wallBeacon.material.emissiveIntensity=.05+alarmMix*(1.8+.7*Math.sin(angle)**2);
    wallSpot.intensity=alarmMix*110;
    wallSpot.target.position.set(Math.sin(angle)*6,.5,Math.cos(angle)*4);
    truckRotor.rotation.y=-angle*1.15;
    truckSpot.target.position.set(.46+Math.sin(-angle*1.15)*4,.3,-.42+Math.cos(-angle*1.15)*4);
    truckSpot.intensity=28;
    const alertActive=alarmMix>.01,alertStrength=clamp((alertLevel-.32)/.1,0,1);
    for(const lens of alertBeacons){
      lens.material.color.set(alertActive?0xffcb58:0x9b895d);
      lens.material.emissiveIntensity=alertActive?1.4+.8*alertStrength:.025;
    }
    accidentLight.intensity=alarmMix*(8+3*alertStrength);
    for(const [index,{ring,sweep,definition}] of [...stations.values()].entries()){
      const status=statusOf(definition),level=signalLevels[definition.id];
      ring.material.emissiveIntensity=level*.3+(state.selected===definition.id?.12:0);
      sweep.visible=status!=='blocked';sweep.rotation.z=ambientTime/9000*Math.PI*2+index*1.2;
      sweep.material.color.set(status==='completed'?colors.teal:colors.yellow);sweep.material.opacity=level;
    }
    scanBeam.visible=state.completed.includes('retours');
    scanBeam.position.x=-2.32+sample.scan*2.16;
    scanBeam.material.opacity=.35+(signalLevels.retours??0)*.4;
    bonusIndicator.material.emissiveIntensity=signalLevels.bonus??0;
    if(state.completed.includes('inscrits')){
      truck.beacon.material.emissiveIntensity=sample.beacon;
      truck.headlights.forEach(lamp=>lamp.material.emissiveIntensity=.16+(state.repaired?1.6:0)+sample.beacon*.05);
    }
    truck.beacon.material.emissiveIntensity=1.6+.8*Math.sin(angle*1.15)**2;
  }
  function setState(next,{animate=false,arrival=false}={}) {
    let from=truck?currentPose():null;const previous=state;
    const nextState={completed:Array.isArray(next?.completed)?[...next.completed]:[],repaired:!!next?.repaired,selected:next?.selected??null,statuses:{...DEFAULT_STATE.statuses,...next?.statuses},counts:{...next?.counts},revealLocked:!!next?.revealLocked};
    const mechanicalIds=['inscrits','retours','boutiques'];
    const mechanicalChanged=nextState.repaired!==previous.repaired||mechanicalIds.some(id=>nextState.completed.includes(id)!==previous.completed.includes(id));
    const retreat=(previous.repaired&&!nextState.repaired)||mechanicalIds.some(id=>previous.completed.includes(id)&&!nextState.completed.includes(id));
    state=nextState;applyState();
    if(arrival&&mechanicalChanged){
      from=repairTarget();
      if(state.repaired)Object.assign(from,{tilt:-1.48,hood:-.72,gather:0,mast:-.12,dispatch:0,door:0,light:0,lift:0});
      else if(state.completed.includes('retours'))Object.assign(from,{gather:0,mast:-.12});
      else if(state.completed.includes('boutiques'))Object.assign(from,{door:0,light:0});
      else if(state.completed.includes('inscrits'))Object.assign(from,{light:0});
    }
    if(!mechanicalChanged){applySignals();invalidate();return;}
    animation=null;
    if(retreat||!animate){motionClock.reset();ambientTime=0;}
    tourTime=0;cycleIndex=0;
    if(animate&&from&&!retreat&&!motionPaused&&!reduced.matches){
      const to=repairTarget();
      if(Object.keys(to).some(key=>Math.abs(to[key]-from[key])>.001)){
        animation={from,to,elapsed:0,duration:state.repaired?5500:arrival?2400:1150,arrival};
        applyRepairPose(from);ambientPhase='repairing';motionClock.suspend();
      }
    }
    if(!animation)showStablePose();
    applySignals();invalidate();
  }
  function setMotionPaused(value){
    motionPaused=!!value;syncReducedMotion();motionClock.suspend();
    invalidate();
  }
  function setCamera() {
    camera.position.copy(target).add(offset);camera.lookAt(target);camera.zoom=zoom;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  }
  function resize() {
    if(!renderer||destroyed)return;
    width=Math.max(1,container.clientWidth);height=Math.max(1,container.clientHeight);
    if(renderCount===0)zoom=width<500?1.22:1;
    const aspect=width/height;
    // Width is the limiting axis on a phone. The front corners retain a narrow margin.
    span=Math.max(12.65,18.0/aspect);
    camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;
    renderer.setSize(width,height,false);setCamera();invalidate();
  }
  function projectPoint(id) {
    const entry=labelNodes.find(item=>item.definition.id===id);
    if(!entry)return null;
    const point=entry.position.clone().project(camera);
    return {x:(point.x+1)*width/2,y:(1-point.y)*height/2};
  }
  function positionLabels() {
    const placed=[];
    // Q wins its location above the canopy; floor labels move only when boxes truly overlap.
    const ordered=[...labelNodes].sort((a,b)=>Number(b.definition.id==='project')-Number(a.definition.id==='project'));
    for(const entry of ordered){
      const {el,definition}=entry,p=projectPoint(definition.id);
      const w=el.offsetWidth||86,h=el.offsetHeight||31;
      let x=p.x,y=p.y+(definition.id==='project'?-8:15);
      const isOutside=p.x<0||p.x>width||p.y<0||p.y>height;
      el.hidden=isOutside;if(isOutside)continue;
      x=clamp(x,w/2+8,width-w/2-8);y=clamp(y,h/2+64,height-h/2-58);
      let boxBounds={left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2};
      for(let attempt=0;attempt<5;attempt++){
        const overlap=placed.find(rect=>boxBounds.left<rect.right+6&&boxBounds.right>rect.left-6&&boxBounds.top<rect.bottom+5&&boxBounds.bottom>rect.top-5);
        if(!overlap)break;
        y=clamp(overlap.bottom+h/2+8,h/2+64,height-h/2-58);
        boxBounds={left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2};
      }
      el.style.left=`${Math.round(x)}px`;el.style.top=`${Math.round(y)}px`;
      placed.push(boxBounds);
    }
  }
  function scheduleFrame(){if(active()&&!raf)raf=requestAnimationFrame(render);}
  function invalidate(){dirty=true;scheduleFrame();}
  function render(time) {
    raf=0;if(!active()||!renderer)return;
    syncReducedMotion();
    const fast=dirty||cameraFlight||gesture||(animation&&!effectiveMotionPaused());
    // Ambient motion draws at most 30 frames/s. Camera and repair transitions draw at display rate.
    if(!fast&&time-lastDrawTime<1000/30-.5){scheduleFrame();return;}
    dirty=false;lastTime=time;lastDrawTime=time;
    const motion=motionClock.tick(time,{running:!effectiveMotionPaused()});
    const cameraTick=cameraClock.tick(time,{running:active()});ambientTime=motion.time;
    if(!effectiveMotionPaused()){
      if(animation){
        animation.elapsed+=motion.delta;
        const progress=clamp(animation.elapsed/animation.duration,0,1),ease=animation.arrival?smooth(progress):1-(1-progress)**3,pose={};
        const isDispatch=animation.to.dispatch>animation.from.dispatch;
        for(const key of Object.keys(animation.to)){
          const amount=key==='dispatch'?progress:isDispatch?phase(progress,0,.19):ease;
          pose[key]=THREE.MathUtils.lerp(animation.from[key],animation.to[key],amount);
        }
        applyRepairPose(pose);ambientPhase='repairing';
        if(progress>=1){animation=null;if(state.repaired)tourTime=DOCK_HANDOFF_TIME;showStablePose();}
      }else if(state.repaired){
        tourTime+=motion.delta;showStablePose();
      }
      applySignals();
    }
    if(cameraFlight){
      cameraFlight.elapsed+=cameraTick.delta;
      const progress=clamp(cameraFlight.elapsed/650,0,1),ease=1-(1-progress)**3;
      target.lerpVectors(cameraFlight.from,cameraFlight.to,ease);zoom=THREE.MathUtils.lerp(cameraFlight.fromZoom,cameraFlight.toZoom,ease);setCamera();
      if(progress>=1){const flight=cameraFlight;cameraFlight=null;flight.resolve({id:flight.id,cancelled:false});}
    }
    renderer.render(scene,camera);renderCount++;positionLabels();
    frameTimes.push(time);while(frameTimes.length&&frameTimes[0]<time-1000)frameTimes.shift();
    if(shouldAnimate())scheduleFrame();
  }
  function cancelFlight({finish=false}={}){
    if(!cameraFlight)return;
    const flight=cameraFlight;cameraFlight=null;
    if(finish){target.copy(flight.to);zoom=flight.toZoom;setCamera();}
    flight.resolve({id:flight.id,cancelled:!finish});
  }
  function focusNode(id){
    const definition=STATIONS.find(entry=>entry.id===id);
    if(id!=='project'&&!definition)return Promise.resolve({id,cancelled:true});
    cancelFlight();focusedNode=id;
    const to=id==='project'?truck.group.localToWorld(new THREE.Vector3(0,1.1,.3)):new THREE.Vector3(...definition.position).add(new THREE.Vector3(0,.35,0));
    const toZoom=Math.max(1.95,zoom);
    if(reduced.matches||!active()){
      target.copy(to);zoom=toZoom;setCamera();invalidate();return Promise.resolve({id,cancelled:false});
    }
    cameraClock.suspend();
    return new Promise(resolve=>{cameraFlight={id,from:target.clone(),to,fromZoom:zoom,toZoom,elapsed:0,resolve};invalidate();});
  }
  function resetView(){cancelFlight();focusedNode=null;target.copy(home);zoom=width<500?1.22:1;setCamera();invalidate();}
  function zoomBy(factor){if(!Number.isFinite(factor)||factor<=0)return;cancelFlight();zoom=clamp(zoom*factor,.85,2.8);setCamera();invalidate();}
  function startGesture(e) {
    if(e.button!==0&&e.pointerType==='mouse')return;
    cancelFlight();
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);
    const values=[...pointers.values()];
    gesture={start:{x:e.clientX,y:e.clientY},target:target.clone(),zoom,moved:values.length>1,distance:values.length===2?distance(values):0};
    canvas.style.cursor='grabbing';
  }
  function distance(values){return Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y);}
  function moveGesture(e) {
    if(!pointers.has(e.pointerId)||!gesture)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const values=[...pointers.values()];
    if(values.length===2){
      if(gesture.distance)zoom=clamp(gesture.zoom*distance(values)/gesture.distance,.85,2.8);
      gesture.moved=true;
    }else{
      const dx=e.clientX-gesture.start.x,dy=e.clientY-gesture.start.y;
      if(Math.hypot(dx,dy)>5){
        gesture.moved=true;const units=span/zoom/height;
        target.copy(gesture.target).addScaledVector(right,-dx*units).addScaledVector(away,-dy*units*1.47);
        target.x=clamp(target.x,-3.6,3.6);target.z=clamp(target.z,-3.5,3.5);
      }
    }
    setCamera();invalidate();
  }
  function endGesture(e) {
    const click=gesture&&!gesture.moved&&pointers.size===1;
    pointers.delete(e.pointerId);gesture=null;canvas.style.cursor='grab';
    if(pointers.size){const entry=[...pointers.values()][0];gesture={start:entry,target:target.clone(),zoom,moved:true,distance:0};}
    if(!click||e.type==='pointercancel')return;
    const rect=canvas.getBoundingClientRect();
    const pointer=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    scene.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(pickTargets,false)[0];if(hit)onSelect?.(hit.object.userData.node);
  }
  function visibilityChanged() {
    motionClock.suspend();cameraClock.suspend();
    if(!active()){if(raf)cancelAnimationFrame(raf);raf=0;}
    else invalidate();
  }
  function syncReducedMotion(){
    // Media query values can change before their change event is delivered.
    // Apply the calm pose before the render loop observes the preference and stops.
    if(appliedReducedMotion===reduced.matches)return;
    appliedReducedMotion=reduced.matches;
    motionClock.suspend();cameraClock.suspend();
    if(reduced.matches){
      animation=null;cancelFlight({finish:true});showStablePose();applySignals();
    }
    dirty=true;
  }
  function reducedMotionChanged(){
    syncReducedMotion();invalidate();
  }
  function dispose() {
    destroyed=true;cancelFlight();if(raf)cancelAnimationFrame(raf);raf=0;
    disposers.forEach(dispose=>dispose());
    labelNodes.forEach(({el})=>el.remove());
    const geos=new Set(),mats=new Set(),textures=new Set();
    scene.traverse(object=>{if(object.geometry)geos.add(object.geometry);if(object.material){for(const mat of Array.isArray(object.material)?object.material:[object.material]){mats.add(mat);if(mat.map)textures.add(mat.map);}}});
    geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());disposeAssetCache();renderer?.dispose();renderer?.forceContextLoss();
  }
  function getDebug(){return {
    renderCalls:renderer?.info.render.calls??0,renderCount,zoom,target:target.toArray(),animationRunning:!!raf&&shouldAnimate(),
    visible:active(),reducedMotion:reduced.matches,lastTime,
    alarmMix,wallBeaconAngle:wallRotor?.rotation.y,truckBeaconAngle:truckRotor?.rotation.y,motionPaused,effectiveMotionPaused:effectiveMotionPaused(),ambientTime,ambientPhase,cycleIndex,alertLevel,signalLevels:{...signalLevels},
    tourTime,cycleDuration:CYCLE_DURATION,renderFPS:frameTimes.filter(t=>t>=performance.now()-1000).length,
    arrivalAnimation:!!animation?.arrival,transitionProgress:animation?animation.elapsed/animation.duration:null,forkliftYaw:truck?.group.rotation.y??0,forkHeight:truck?.forks.position.y??0,
    cargoPosition:freight[0]?.object.getWorldPosition(new THREE.Vector3()).toArray(),generalLight:ambientLight?.intensity,
    worldBounds:{min:[-6.98,-.58,-5.13],max:[6.98,3.55,5.73]},
    forkliftTilt:truck?.group.rotation.z??0,forkliftPosition:truck?.group.position.toArray(),cargoGathered:visualPose?.gather??0,
    doorOpen:shutter?clamp((shutter.position.y-.34)/2.05,0,1):0,dispatchProgress,cargoVisible:cargoRoot?.visible??false,
    cameraFlying:!!cameraFlight,focusedNode,focusTarget:cameraFlight?.to.toArray()??target.toArray(),
    repaired:state.repaired,completed:[...state.completed],labels:labelNodes.map(({el,definition})=>({id:definition.id,status:el.dataset.status,hidden:el.hidden})),
  };}
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
    canvas.style.touchAction='none';canvas.style.cursor='grab';
    prepareScene();setCamera();applyState();showStablePose();applySignals();resize();
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);disposers.push(()=>resizeObserver.disconnect());
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;visibilityChanged();},{threshold:.01});observer.observe(container);disposers.push(()=>observer.disconnect());}
    addListener(canvas,'pointerdown',startGesture);addListener(canvas,'pointermove',moveGesture);
    addListener(canvas,'pointerup',endGesture);addListener(canvas,'pointercancel',endGesture);
    addListener(canvas,'wheel',e=>{e.preventDefault();zoomBy(Math.exp(-e.deltaY*.0013));},{passive:false});
    addListener(document,'visibilitychange',visibilityChanged);addListener(reduced,'change',reducedMotionChanged);
    addListener(canvas,'webglcontextlost',e=>{e.preventDefault();contextLost=true;if(raf)cancelAnimationFrame(raf);raf=0;container.dataset.worldError='true';labels.hidden=true;motionClock.suspend();cameraClock.suspend();});
    addListener(canvas,'webglcontextrestored',()=>{contextLost=false;delete container.dataset.worldError;labels.hidden=false;invalidate();});
    document.fonts?.ready.then(()=>{if(!destroyed)invalidate();});
  }catch(error){
    container.dataset.worldError='true';canvas.dispatchEvent(new CustomEvent('worlderror',{detail:error}));dispose();throw error;
  }
  return {setState,setMotionPaused,focusNode,resetView,zoomBy,getDebug,projectPoint,dispose};
}
