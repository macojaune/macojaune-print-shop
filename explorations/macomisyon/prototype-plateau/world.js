import * as THREE from './node_modules/three/build/three.module.js';
import {projects,nodeById,accessible,done,status} from './data.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
export function createWorld({canvas,container,labels,onProject,onNode,onView}){
 let renderer,camera,scene,root,frame=0,focus=null,zoom=1,baseSpan=20,camAnim=null,pawnAnim=null,angle=.48;
 const target=new THREE.Vector3(0,0,0),pointers=new Map(),meshes=[],nodeLabels=[],projectLabels=[],rings={},pawns={},routes={},effects=[];
 const m={yellow:mat(0xfbbf24),cream:mat(0xffedbd),ink:mat(0x16241c),teal:mat(0x118e7b),green:mat(0x577d41),wood:mat(0x9b632c),white:mat(0xf6f0d8),orange:mat(0xf09321)};
 function mesh(geo,material,parent=root){const x=new THREE.Mesh(geo,material);x.castShadow=true;x.receiveShadow=true;parent.add(x);return x}
 function box(w,h,d,material,pos,parent=root){const x=mesh(new THREE.BoxGeometry(w,h,d),material,parent);x.position.set(...pos);return x}
 function cyl(rt,rb,h,material,pos,parent=root){const x=mesh(new THREE.CylinderGeometry(rt,rb,h,24),material,parent);x.position.set(...pos);return x}
 function nodePos(k,id){const p=projects[k],n=nodeById(k,id);return new THREE.Vector3(...p.center).add(new THREE.Vector3(...n.pos));}
 function tree(x,z,size,g){box(.11,size*.55,.11,m.wood,[x,size*.26,z],g);const c=mesh(new THREE.IcosahedronGeometry(size*.45,0),m.green,g);c.position.set(x,size*.75,z);const d=mesh(new THREE.IcosahedronGeometry(size*.32,0),m.teal,g);d.position.set(x+.12,size*1.07,z);}
 function flag(x,z,g){box(.06,1.5,.06,m.ink,[x,.75,z],g);box(.65,.4,.04,m.yellow,[x+.33,1.24,z],g);}
 function tile(k){const p=projects[k],g=new THREE.Group();g.position.set(...p.center);root.add(g);const outline=k==='q'?[[-3.6,3.5],[2.7,3.5],[3.6,2.5],[3.6,-2.8],[2.6,-3.6],[-2.8,-3.6],[-3.6,-2.7]]:[[-3.5,3.4],[2.8,3.4],[3.8,2.2],[3.8,-1.9],[2.7,-3.8],[-2.9,-3.8],[-3.8,-2.6],[-3.8,1.8]];const sh=new THREE.Shape();outline.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:1.35,bevelEnabled:true,bevelSize:.12,bevelThickness:.1,bevelSegments:1,steps:1});const land=mesh(geo,[m.cream,mat(p.color)],g);land.rotation.x=-Math.PI/2;land.position.y=-1.45;land.userData={k};meshes.push(land);
 // Chunky cliff details, a perimeter railing and a little landing.
 for(let i=0;i<4;i++)box(.38,.52,.32,i%2?m.teal:m.ink,[-2.5+i*1.25,-.95,3.57],g);
 for(const [x,z,s] of [[-3,-2.7,.95],[3.1,2.5,.8],[-3.1,.1,.75],[.6,-3.1,.55]])tree(x,z,s,g);
 box(1,.13,1.05,m.wood,[-2.2,-.02,3.8],g);for(let i=0;i<4;i++)box(.95,.045,.04,m.cream,[-2.2,.06,3.45+i*.2],g);
 // Q's stall suggests discovering shops. Shootareas carries a camera and viewing frames.
 if(k==='q'){
  box(1.8,.2,1.5,m.yellow,[1.9,.1,-2.1],g);for(const x of[1.12,2.67])for(const z of[-2.7,-1.5])box(.09,1.35,.09,m.ink,[x,.82,z],g);
  const roof=box(2.05,.19,1.8,m.yellow,[1.9,1.62,-2.1],g);roof.rotation.z=.07;
  box(1.6,.57,.55,m.wood,[1.9,.54,-1.5],g);for(let i=0;i<3;i++){box(.36,.32,.36,m.orange,[1.4+i*.45,.95,-1.8],g);box(.045,.325,.365,m.cream,[1.4+i*.45,.95,-1.8],g)}flag(2.9,-2.65,g);
  box(.85,.55,.06,m.ink,[-2.9,.3,1.35],g);box(.65,.34,.065,m.yellow,[-2.9,.3,1.36],g);
 }else{
  const photo=new THREE.Group();photo.position.set(1.8,.65,-2.1);g.add(photo);box(1.4,.95,.6,m.yellow,[0,.22,0],photo);box(.65,.22,.5,m.ink,[-.22,.82,0],photo);const lens=cyl(.42,.42,.55,m.ink,[0,.25,.49],photo);lens.rotation.x=Math.PI/2;const glass=cyl(.3,.3,.07,m.teal,[0,.25,.8],photo);glass.rotation.x=Math.PI/2;box(.16,.12,.13,m.orange,[.45,.77,0],photo);box(.12,.9,.12,m.ink,[1.8,.25,-2.1],g);
  for(let i=0;i<2;i++){box(.07,1,.07,m.wood,[2.5+i*.7,.5,-.8],g)}box(.78,.65,.06,m.ink,[2.85,.78,-.8],g);box(.64,.51,.075,m.teal,[2.85,.78,-.79],g);flag(-2.9,-2.7,g);
 }
 // Branches are painted routes on one continuous project platform.
 for(const [aId,bId]of p.edges){const a=new THREE.Vector3(...nodeById(k,aId).pos),b=new THREE.Vector3(...nodeById(k,bId).pos),route=new THREE.Group();g.add(route);for(let j=1;j<12;j++){const t=j/12,v=a.clone().lerp(b,t);const dot=cyl(.075,.075,.035,m.white,[v.x,.025,v.z],route);dot.castShadow=false;}routes[k+bId]=route;}
 for(const n of p.nodes){const np=new THREE.Vector3(...n.pos);const ring=cyl(.4,.4,.065,m.ink,[np.x,.04,np.z],g);ring.userData={k,id:n.id};meshes.push(ring);cyl(.27,.27,.07,n.kind==='intro'?m.teal:m.cream,[np.x,.045,np.z],g);rings[k+n.id]=ring;
  const hit=mesh(new THREE.CylinderGeometry(.65,.65,.35,12),new THREE.MeshBasicMaterial({visible:false}),g);hit.position.set(np.x,.15,np.z);hit.userData={k,id:n.id};meshes.push(hit);
  const el=document.createElement('button');el.className='map-label node-label';el.dataset.project=k;el.dataset.node=n.id;el.setAttribute('aria-label',`${p.name} : ${n.title}`);el.onclick=()=>onNode(k,n.id);labels.append(el);nodeLabels.push({el,k,n,pos:nodePos(k,n.id).add(new THREE.Vector3(0,0,.55))});
 }
 const pawn=new THREE.Group();cyl(.12,.25,.47,m.yellow,[0,.3,0],pawn);const head=mesh(new THREE.SphereGeometry(.18,18,12),m.yellow,pawn);head.position.y=.65;root.add(pawn);pawn.position.copy(nodePos(k,p.selected));pawns[k]=pawn;
 const el=document.createElement('button');el.className='map-label project-label';el.dataset.territory=k;el.setAttribute('aria-label',`Découvrir ${p.name}`);el.onclick=()=>onProject(k);labels.append(el);projectLabels.push({el,k,pos:new THREE.Vector3(...p.center).add(new THREE.Vector3(0,.2,3.2))});
 }
 function setup(){try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;scene=new THREE.Scene();scene.background=new THREE.Color(0x1a2921);camera=new THREE.OrthographicCamera();root=new THREE.Group();scene.add(root);scene.add(new THREE.HemisphereLight(0xfff5d8,0x689c84,2.3));const sun=new THREE.DirectionalLight(0xfff4d0,3);sun.position.set(-9,20,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:70});sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;scene.add(sun);const ground=mesh(new THREE.PlaneGeometry(120,120),mat(0x091811),scene);ground.rotation.x=-Math.PI/2;ground.position.y=-1.7;tile('q');tile('s');
 // Sparse stepping rocks and a mooring marker make the shared space feel larger, without adding fictional projects.
 for(const [x,z,s]of [[-10,-6,.8],[9,6,.6],[12,-7,.9],[-3,-7,.5],[.2,7,.7]]){const r=box(s,.6,s,m.teal,[x,-1.2,z]);r.rotation.y=.2;}
 resize();new ResizeObserver(resize).observe(container);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>pointers.clear());canvas.addEventListener('wheel',e=>{e.preventDefault();scale(Math.exp(-e.deltaY*.0015))},{passive:false});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('fallback').hidden=false;labels.hidden=true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate()});sync();}catch(e){document.getElementById('fallback').hidden=false;labels.hidden=true;console.error(e)}}
 function setCamera(){if(!camera)return;camera.position.copy(target).add(new THREE.Vector3(Math.sin(angle)*24,24,Math.cos(angle)*24));camera.lookAt(target);camera.zoom=zoom;camera.updateProjectionMatrix();}
 function resize(){if(!renderer)return;const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);baseSpan=Math.max(14.5,22/(w/h));camera.left=-baseSpan*w/h/2;camera.right=baseSpan*w/h/2;camera.top=baseSpan/2;camera.bottom=-baseSpan/2;camera.near=.1;camera.far=140;setCamera();invalidate()}
 function invalidate(){if(!frame)frame=requestAnimationFrame(render)}
 function render(t){frame=0;if(!renderer||document.hidden)return;let animate=false;
 if(camAnim){const u=Math.min(1,(t-camAnim.t)/500),v=1-Math.pow(1-u,3);target.lerpVectors(camAnim.from,camAnim.to,v);zoom=THREE.MathUtils.lerp(camAnim.z0,camAnim.z1,v);setCamera();animate=u<1;if(!animate)camAnim=null;}
 if(pawnAnim){const u=Math.min(1,(t-pawnAnim.t)/650),v=1-Math.pow(1-u,3);pawns[pawnAnim.k].position.lerpVectors(pawnAnim.from,pawnAnim.to,v);pawns[pawnAnim.k].position.y+=Math.sin(u*Math.PI)*.45;animate=animate||u<1;if(u===1)pawnAnim=null;}
 for(let i=effects.length-1;i>=0;i--){const e=effects[i],u=(t-e.t)/900;e.group.scale.y=Math.min(1,Math.max(.01,u));e.group.position.y=-.7*(1-Math.min(1,u));if(u>=1)effects.splice(i,1);else animate=true;}
 renderer.render(scene,camera);for(const l of [...projectLabels,...nodeLabels]){const isProject=!l.n;const visible=isProject?focus!==l.k:focus===l.k;const p=l.pos.clone().project(camera);const x=(p.x+1)*container.clientWidth/2,y=(-p.y+1)*container.clientHeight/2;l.el.hidden=!visible||x<-10||x>container.clientWidth+10||y<-15||y>container.clientHeight-30;if(!l.el.hidden){const half=l.el.offsetWidth/2;l.el.style.left=`${Math.max(half+5,Math.min(container.clientWidth-half-5,x))}px`;l.el.style.top=`${y+(l.n?.id==='intro'?12:0)}px`;}}
 onView?.({zoom,focus});if(animate)invalidate();}
 function fly(to,z){const value=Math.max(.65,Math.min(3.4,z));if(reduced()){target.copy(to);zoom=value;camAnim=null;setCamera();}else camAnim={from:target.clone(),to:to.clone(),z0:zoom,z1:value,t:performance.now()};invalidate();}
 function focusProject(k){focus=k;fly(new THREE.Vector3(...projects[k].center),container.clientWidth<450?2.15:1.65);sync();}
 function overview(){focus=null;fly(new THREE.Vector3(0,0,-.1),1);sync();}
 function scale(f){camAnim=null;zoom=Math.max(.65,Math.min(3.4,zoom*f));setCamera();invalidate()}
 let gesture=null;
 const values=()=>Array.from(pointers.values());
 function down(e){camAnim=null;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);const v=values();gesture={start:{x:e.clientX,y:e.clientY},target:target.clone(),zoom,dist:v.length===2?Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y):0,moved:v.length>1};}
 function move(e){if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const v=values();if(v.length===2){const dist=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(gesture.dist)zoom=Math.max(.65,Math.min(3.4,gesture.zoom*dist/gesture.dist));gesture.moved=true;}else{const dx=e.clientX-gesture.start.x,dy=e.clientY-gesture.start.y;if(Math.hypot(dx,dy)>5){gesture.moved=true;const unit=baseSpan/zoom/container.clientHeight;const right=new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle));const forward=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));target.copy(gesture.target).addScaledVector(right,-dx*unit).addScaledVector(forward,-dy*unit*1.45);target.x=THREE.MathUtils.clamp(target.x,-16,16);target.z=THREE.MathUtils.clamp(target.z,-13,13);}}setCamera();invalidate();}
 function up(e){const click=gesture&&!gesture.moved&&pointers.size===1;pointers.delete(e.pointerId);gesture=null;if(!click||!renderer)return;const r=canvas.getBoundingClientRect(),pt=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(pt,camera);const hit=ray.intersectObjects(meshes)[0];if(hit){const {k,id}=hit.object.userData;id?onNode(k,id):onProject(k)}}
 function visit(k,id){const n=nodeById(k,id);if(!accessible(k,n)||!pawns[k])return;const to=nodePos(k,id);if(reduced()){pawns[k].position.copy(to);pawnAnim=null;}else pawnAnim={k,from:pawns[k].position.clone(),to,t:performance.now()};invalidate();}
 function sync(){for(const [k,p]of Object.entries(projects)){for(const n of p.nodes){if(rings[k+n.id])rings[k+n.id].material=done(n)||p.selected===n.id?m.yellow:accessible(k,n)?m.teal:m.ink;const route=routes[k+n.id];if(route){const color=!accessible(k,n)?m.ink:done(n)?m.yellow:m.white;route.children.forEach(x=>x.material=color);}}}nodeLabels.forEach(l=>{l.el.innerHTML=`${l.n.short}<small>${l.n.kind==='count'?`${l.n.count}/${l.n.goal} · ${done(l.n)?'ATTEINT':'EN COURS'}`:status(l.k,l.n)}</small>`;l.el.dataset.selected=projects[l.k].selected===l.n.id});projectLabels.forEach(l=>l.el.innerHTML=`${projects[l.k].name}<small>DÉCOUVRIR LE PROJET</small>`);invalidate();}
 function unlock(k,id){const route=routes[k+id];if(route&&!reduced())effects.push({group:route,t:performance.now()});sync();}
 function reset(){camAnim=null;pawnAnim=null;effects.splice(0);Object.values(routes).forEach(g=>{g.scale.y=1;g.position.y=0});for(const k of Object.keys(pawns))pawns[k].position.copy(nodePos(k,projects[k].selected));overview();}
 setup();return{focusProject,overview,scale,visit,sync,unlock,reset,getState:()=>({zoom,focus,target:target.toArray(),renderCalls:renderer?.info.render.calls}),projectPoint:(k,id)=>{if(!camera)return null;const p=nodePos(k,id).project(camera);return{x:(p.x+1)*container.clientWidth/2,y:(-p.y+1)*container.clientHeight/2}}};
}
