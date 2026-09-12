import * as THREE from './node_modules/three/build/three.module.js';

// Parametric warehouse assets. Dimensions are metres in the toy's world.
// Rigid scenery is baked by material after placement, keeping mobile draw calls low.
const geometries = new Map();
const materials = new Map();
export const colors = {
  yellow: 0xffc62b, lightYellow: 0xffdc68, ink: 0x283638, rubber: 0x262b2b,
  cream: 0xf6ecd5, white: 0xf4f3e9, kraft: 0xc69159, kraftLight: 0xdfb37b,
  kraftDark: 0xa87343, tape: 0xe9c99a, teal: 0x518579, steel: 0x748a87,
  orange: 0xe77f48, red: 0xcb674e, blue: 0x7c9caa, floor: 0xcac8b7,
};
export function material(color, extra = {}) {
  const key = `${color}:${JSON.stringify(extra)}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({color, roughness: .82, ...extra}));
  return materials.get(key);
}
export function mesh(geometry, mat, parent) {
  const object = new THREE.Mesh(geometry, mat);
  object.castShadow = true;
  object.receiveShadow = true;
  parent?.add(object);
  return object;
}
/** Bevelled solid box; bevels catch light without making assets look inflated. */
export function box(parent, size, position, color, radius = .025) {
  const [w,h,d] = size;
  const r = Math.min(radius, w*.22,h*.22,d*.22);
  const key = `${w},${h},${d},${r}`;
  if (!geometries.has(key)) {
    if (r < .005) geometries.set(key, new THREE.BoxGeometry(w,h,d));
    else {
      const shape = new THREE.Shape();
      const x=w/2-r,y=h/2-r;
      shape.moveTo(-x,-y);shape.lineTo(x,-y);shape.lineTo(x,y);shape.lineTo(-x,y);shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:1,steps:1});
      geo.translate(0,0,-(d-2*r)/2);
      geometries.set(key,geo);
    }
  }
  const object=mesh(geometries.get(key),typeof color==='number'?material(color):color,parent);
  object.position.set(...position);
  return object;
}
export function cylinder(parent, radius, height, position, color, radiusBottom = radius, segments = 16) {
  const key=`c${radius},${radiusBottom},${height},${segments}`;
  if(!geometries.has(key))geometries.set(key,new THREE.CylinderGeometry(radius,radiusBottom,height,segments));
  const object=mesh(geometries.get(key),typeof color==='number'?material(color):color,parent);
  object.position.set(...position);
  return object;
}
export function tube(parent, points, radius, color) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*5),radius,6,false),material(color),parent);
}
export function group(parent, position=[0,0,0], rotation=0) {
  const object=new THREE.Group();object.position.set(...position);object.rotation.y=rotation;parent?.add(object);return object;
}
/** Canvas artwork is attached to real mesh surfaces, never used as a fake 3D scene. */
export function labelTexture(text, {background='#f4f0de',color='#283638',width=256,height=128,barcode=false}={}) {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');context.fillStyle=background;context.fillRect(0,0,width,height);
  context.fillStyle=color;context.font=`900 ${height*.53}px Arial, sans-serif`;context.textAlign='center';context.textBaseline='middle';
  context.fillText(text,width/2,height*(barcode?.29:.53),width*.85);
  if(barcode){for(let i=0;i<26;i++){const x=width*.14+i*width*.028;context.fillRect(x,height*.56,(i%3+1)*width*.007,height*.25);}context.fillRect(width*.14,height*.87,width*.31,2);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
const labelMaterials=new Map();
function printed(text,options={}) {
  const key=text+JSON.stringify(options);
  if(!labelMaterials.has(key))labelMaterials.set(key,new THREE.MeshStandardMaterial({map:labelTexture(text,options),roughness:.9}));
  return labelMaterials.get(key);
}
export function sign(parent,text,size,position,options={}) {
  return box(parent,size,position,printed(text,options),.006);
}
/** Taped carton with a seam, edge strips and a printed shipping label. */
export function parcel(parent, {position=[0,0,0],size=[.68,.55,.55],rotation=0,tone=0,label='Q',open=false}={}) {
  const g=group(parent,position,rotation),[w,h,d]=size;
  const cardboard=[colors.kraftLight,colors.kraft,colors.kraftDark][tone%3];
  box(g,[w,h,d],[0,h/2,0],cardboard,.045);
  box(g,[w*.15,h+.009,d+.014],[0,h/2,0],colors.tape,.003);
  box(g,[w+.01,.016,.032],[0,h+.006,0],colors.kraftDark,.002);
  if(w>.5){const lab=sign(g,label,[w*.39,h*.32,.015],[-w*.2,h*.57,d/2+.009],{barcode:true});lab.rotation.z=-.04;}
  if(open){
    const flap=box(g,[w*.48,.027,d],[w*.42,h+.12,0],cardboard,.003);flap.rotation.z=.45;
    const flap2=box(g,[w*.48,.027,d],[-w*.42,h+.12,0],cardboard,.003);flap2.rotation.z=-.4;
  }
  return g;
}
/** Soft shipping mailer, with irregular inflated silhouette and heat-sealed edges. */
export function mailer(parent,{position=[0,0,0],size=[.73,.19,.62],rotation=0,dark=false,seed=0}={}) {
  const g=group(parent,position,rotation),[w,h,d]=size;
  const geo=new THREE.SphereGeometry(1,12,7);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const ripple=1+Math.sin((x*9+z*12+seed)*2)*.07;
    p.setXYZ(i,Math.sign(x)*Math.pow(Math.abs(x),.46)*w*.5*ripple,y*h*.5,Math.sign(z)*Math.pow(Math.abs(z),.45)*d*.5*ripple);
  }
  geo.computeVertexNormals();const bag=mesh(geo,material(dark?0x303737:0xf2f0e7,{roughness:.94}),g);bag.position.y=h*.52;
  for(const z of[-d*.47,d*.47])box(g,[w*.83,.021,.043],[0,h*.48,z],dark?0x444c4a:0xdeddd5,.007);
  const lab=sign(g,'Q',[w*.34,.013,d*.45],[-w*.08,h*.98,0],{barcode:true});
  lab.rotation.x=-Math.PI/2;lab.geometry=labelPlane(w*.34,d*.45);lab.rotation.x=-Math.PI/2;
  return g;
}
function labelPlane(w,h){return new THREE.PlaneGeometry(w,h);}
/** Euro-style pallet with open channels and separate upper deck planks. */
export function pallet(parent,{position=[0,0,0],rotation=0,size=[1.15,1]}={}) {
  const g=group(parent,position,rotation),[w,d]=size;
  for(const x of[-w*.37,0,w*.37]){
    box(g,[w*.2,.07,d],[x,.04,0],colors.kraftDark,.012);
    for(const z of[-d*.35,0,d*.35])box(g,[w*.18,.12,d*.18],[x,.125,z],colors.kraft,.01);
  }
  for(let i=0;i<5;i++)box(g,[w,.07,d*.155],[0,.22,-d*.42+i*d*.21],colors.kraftLight,.012);
  return g;
}
/** Industrial rack with double uprights, cross braces, lip rails and packed shelves. */
export function rack(parent,{position=[0,0,0],width=3,height=2.65,depth=.94,bays=3,rotation=0,code='A'}={}) {
  const g=group(parent,position,rotation);
  const bay=width/bays;
  for(let i=0;i<=bays;i++){
    const x=-width/2+i*bay;
    for(const z of[-depth*.46,depth*.46]){
      box(g,[.085,height,.09],[x,height/2,z],colors.steel,.012);
      box(g,[.23,.065,.24],[x,.033,z],colors.ink,.012);
      for(let k=0;k<7;k++)box(g,[.025,.048,.008],[x,.42+k*.3,z+depth*.012],colors.ink,.001);
    }
    for(const y of[.72,1.75]){
      const b=box(g,[.047,.9,.046],[x,y,-depth*.35],colors.steel,.005);b.rotation.x=.5;
    }
  }
  for(let level=0;level<3;level++){
    const y=.22+level*.87;
    box(g,[width,.065,depth],[0,y,0],0xa3af9c,.012);
    for(const z of[-depth*.5,depth*.5])box(g,[width+.08,.12,.08],[0,y-.02,z],colors.orange,.014);
    for(let i=0;i<bays;i++){
      const x=-width/2+(i+.5)*bay;
      if((i+level)%3===1){
        mailer(g,{position:[x-.12,y+.04,.07],size:[bay*.67,.17,.62],dark:level===0,rotation:.1,seed:i});
        mailer(g,{position:[x-.09,y+.2,.06],size:[bay*.67,.14,.54],dark:level!==0,rotation:-.08,seed:i+4});
      }else{
        parcel(g,{position:[x-.12,y+.04,.03],size:[bay*.6,.46+level*.035,.61],tone:(i+level)%3,rotation:.025*(i-1)});
        if(i%2===0)parcel(g,{position:[x+bay*.31,y+.04,.15],size:[bay*.23,.33,.43],tone:1});
      }
      sign(g,`${code}${i+1}`,[.28,.105,.013],[x,y-.02,depth*.55],{height:64});
    }
  }
  sign(g,`${code} / Q`,[.8,.29,.03],[-width*.27,height-.1,depth*.5],{background:'#f7d25a'});
  return g;
}
/** Hand trolley with leaning handle and stacked freight. */
export function trolley(parent,{position=[0,0,0],rotation=0}={}) {
  const g=group(parent,position,rotation);
  box(g,[.8,.075,.7],[0,.19,.08],colors.teal,.024);
  for(const x of[-.34,.34]){
    const wheel=cylinder(g,.18,.105,[x,.19,-.27],colors.rubber);wheel.rotation.z=Math.PI/2;
    tube(g,[[x,.22,-.23],[x,1.34,-.48],[x,1.64,-.45],[x*.55,1.7,-.43]],.043,colors.teal);
  }
  tube(g,[[-.2,1.69,-.43],[0,1.69,-.43],[.2,1.69,-.43]],.047,colors.ink);
  parcel(g,{position:[0,.235,.055],size:[.7,.48,.57],tone:1});
  parcel(g,{position:[-.015,.73,.015],size:[.55,.41,.51],rotation:.09,tone:0});
  return g;
}
export function cone(parent,position,scale=1) {
  const g=group(parent,position);g.scale.setScalar(scale);
  box(g,[.37,.055,.37],[0,.032,0],colors.ink,.023);
  cylinder(g,.04,.48,[0,.3,0],colors.orange,.16,12);
  cylinder(g,.077,.11,[0,.34,0],colors.cream,.1,12);
  return g;
}
/** Packing desk with roll dispenser, mailers and a small ticket printer. */
export function packingTable(parent,{position=[0,0,0],rotation=0}={}) {
  const g=group(parent,position,rotation);
  for(const x of[-.83,.83])for(const z of[-.36,.36])box(g,[.08,.97,.08],[x,.49,z],colors.ink,.01);
  box(g,[1.92,.12,.92],[0,1.03,0],colors.kraftLight,.02);
  box(g,[1.65,.06,.72],[0,.28,0],colors.steel,.01);
  parcel(g,{position:[-.43,1.1,-.02],size:[.73,.48,.62],open:true});
  box(g,[.45,.25,.36],[.55,1.24,-.2],colors.cream,.055);
  box(g,[.29,.06,.022],[.55,1.21,-.004],colors.ink,.003);
  box(g,[.23,.01,.3],[.55,1.1,.13],colors.white,.001);
  for(let i=0;i<4;i++)box(g,[.13,.012,.012],[.55,1.112,.05+i*.036],colors.ink,.001);
  mailer(g,{position:[.39,.34,0],size:[.64,.18,.57],dark:true});
  mailer(g,{position:[-.43,.34,0],size:[.62,.19,.6],dark:false});
  const tape=cylinder(g,.12,.075,[.15,1.12,.27],colors.yellow,.12,16);tape.rotation.x=Math.PI/2;
  return g;
}
/** Detailed electric forklift. Parts are independent for visible staged repair. */
export function forklift(parent,{position=[0,0,0],rotation=-.18}={}) {
  const g=group(parent,position,rotation),body=group(g),forkAssembly=group(g),mast=group(g),hood=group(g,[0,1.45,-.7]);
  // Chassis, stepped counterweight and fenders.
  box(body,[1.38,.39,1.99],[0,.48,-.1],colors.ink,.12);
  box(body,[1.42,.59,.95],[0,.82,-.62],colors.yellow,.14);
  box(body,[1.35,.25,.55],[0,1.06,-.79],colors.lightYellow,.095);
  box(body,[1.43,.15,.78],[0,.66,.33],colors.yellow,.045);
  for(const x of[-.64,.64]){
    box(body,[.16,.19,1.32],[x,.84,.035],colors.yellow,.035);
    box(body,[.18,.12,.49],[x,.37,-.14],colors.steel,.025);
    for(let k=0;k<3;k++)box(body,[.014,.047,.44],[x+Math.sign(x)*.1,.44,-.14+k*.02],colors.ink,.001);
    for(const z of[-.79,.63]){
      const wheel=cylinder(body,z>0?.37:.29,.23,[x,.37,z],colors.rubber,z>0?.37:.29,20);wheel.rotation.z=Math.PI/2;
      const rim=cylinder(body,z>0?.2:.15,.244,[x,.37,z],colors.steel);rim.rotation.z=Math.PI/2;
      const hub=cylinder(body,.08,.26,[x,.37,z],colors.yellow);hub.rotation.z=Math.PI/2;
      for(let j=0;j<12;j++){
        const ang=j*Math.PI/6,r=z>0?.365:.285;
        const tread=box(body,[.24,.034,.075],[x,.37+Math.sin(ang)*r,z+Math.cos(ang)*r],0x343b3b,.01);tread.rotation.x=-ang;
      }
    }
  }
  // Seat and cockpit.
  box(body,[.61,.16,.63],[0,1.09,-.17],colors.ink,.075);
  const back=box(body,[.62,.57,.15],[0,1.42,-.44],colors.ink,.06);back.rotation.x=-.1;
  for(const x of[-.37,.37])box(body,[.07,.09,.37],[x,1.35,-.19],colors.ink,.025);
  const column=cylinder(body,.045,.53,[0,1.2,.51],colors.ink);column.rotation.x=-.35;
  const steer=mesh(new THREE.TorusGeometry(.19,.024,6,18),material(colors.ink),body);steer.position.set(0,1.47,.59);steer.rotation.x=1.08;
  for(const x of[.4,.49]){
    const lever=cylinder(body,.022,.3,[x,1.27,.19],colors.ink);lever.rotation.x=-.21;
    cylinder(body,.048,.055,[x,1.42,.22],colors.orange);
  }
  // The overhead guard remains recognisable even at phone size.
  for(const x of[-.59,.59])for(const z of[-.54,.63])box(body,[.074,1.75,.075],[x,1.58,z],colors.ink,.014);
  box(body,[1.34,.13,1.42],[0,2.49,.025],colors.yellow,.048);
  for(let i=0;i<4;i++)box(body,[.055,.037,1.22],[-.44+i*.29,2.575,.025],colors.ink,.01);
  sign(body,'Q',[.44,.35,.025],[0,2.49,.751],{background:'#ffd03a',width:128,height:128});
  sign(body,'Q',[.62,.42,.023],[0,.87,-1.106],{background:'#ffd03a',width:128,height:128});
  // Raised hood exposes the blue battery rather than merely switching a color.
  box(hood,[1.22,.095,.7],[0,.03,.21],colors.yellow,.055);
  box(body,[1.05,.24,.58],[0,1.14,-.65],colors.ink,.025);
  for(const x of[-.36,-.12,.12,.36]){
    box(body,[.17,.21,.42],[x,1.26,-.65],colors.blue,.02);
    cylinder(body,.035,.032,[x,1.38,-.74],colors.orange);
  }
  const unplugged=tube(g,[[.48,1.32,-.66],[.84,1.14,-.79],[1.02,.68,-.88],[.95,.22,-1.23],[.51,.13,-1.45]],.039,colors.ink);
  const plug=box(g,[.16,.13,.23],[.51,.14,-1.49],colors.orange,.02);
  const prongs=[box(g,[.027,.06,.12],[.47,.14,-1.65],colors.steel,.002),box(g,[.027,.06,.12],[.55,.14,-1.65],colors.steel,.002)];
  // Uprights, inner carriage, chain, hydraulic cylinder and properly separated forks.
  for(const x of[-.48,.48]){
    box(mast,[.115,2.62,.15],[x,1.42,.91],colors.ink,.022);
    box(mast,[.05,2.4,.055],[x,1.43,.808],colors.steel,.008);
  }
  for(const y of[.26,2.65])box(mast,[1.08,.12,.18],[0,y,.92],colors.ink,.02);
  cylinder(mast,.063,1.98,[0,1.29,.93],colors.steel);
  for(const x of[-.3,.3])for(let i=0;i<15;i++)box(mast,[.043,.064,.043],[x,.52+i*.126,.978],colors.steel,.006);
  box(forkAssembly,[1.17,.49,.13],[0,.52,1.04],colors.ink,.025);
  for(const x of[-.4,.4]){
    box(forkAssembly,[.15,.7,.12],[x,.51,1.14],colors.steel,.018);
    box(forkAssembly,[.15,.1,1.37],[x,.2,1.77],colors.steel,.024);
  }
  const load=pallet(forkAssembly,{position:[0,.235,1.86],size:[1.3,1.1]});
  parcel(load,{position:[-.28,.26,-.03],size:[.59,.69,.8],tone:0});
  parcel(load,{position:[.32,.26,-.03],size:[.52,.52,.77],tone:1});
  parcel(load,{position:[.08,.97,0],size:[.63,.4,.62],tone:0});
  const lampMat=material(0xffb535,{emissive:0xff9700,emissiveIntensity:.15,roughness:.3});
  const beacon=cylinder(g,.095,.16,[.46,2.64,-.42],lampMat);
  cylinder(g,.125,.05,[.46,2.56,-.42],colors.ink);
  const headlights=[];
  for(const x of[-.53,.53])headlights.push(box(g,[.2,.14,.065],[x,1.92,.677],material(colors.cream,{emissive:0xffe6a2,emissiveIntensity:.03}),.026));
  bake(body);bake(hood);bake(mast);bake(forkAssembly);
  return {group:g,hood,mast,forks:forkAssembly,unplugged,plug,prongs,beacon,headlights};
}
/** Flatten a rigid asset by material and shadow flags. Dynamic siblings remain separate. */
export function bake(target) {
  target.updateWorldMatrix(true,true);
  const inverse=new THREE.Matrix4().copy(target.matrixWorld).invert(),buckets=new Map();
  target.traverse(object=>{
    if(!object.isMesh||Array.isArray(object.material))return;
    const source=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
    source.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,object.matrixWorld));
    const key=`${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
    if(!buckets.has(key))buckets.set(key,{mat:object.material,castShadow:object.castShadow,receiveShadow:object.receiveShadow,list:[]});
    buckets.get(key).list.push(source);
  });
  target.clear();
  for(const {mat,castShadow,receiveShadow,list} of buckets.values()){
    const joined=new THREE.BufferGeometry();
    for(const name of['position','normal','uv']){
      const total=list.reduce((sum,g)=>sum+(g.getAttribute(name)?.array.length??0),0);
      if(!total)continue;
      const arr=new Float32Array(total);let offset=0;
      for(const geo of list){const a=geo.getAttribute(name);if(a){arr.set(a.array,offset);offset+=a.array.length;}}
      joined.setAttribute(name,new THREE.BufferAttribute(arr,name==='uv'?2:3));
    }
    joined.computeBoundingSphere();
    const merged=mesh(joined,mat,target);
    merged.castShadow=castShadow;merged.receiveShadow=receiveShadow;
    for(const geometry of list)geometry.dispose();
  }
  return target;
}
