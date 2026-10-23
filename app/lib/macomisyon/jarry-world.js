import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { PROJECT_SITES, WORLD_BOUNDS } from './jarry-geography.js'
import { createJarryTerrain } from './jarry-terrain.js'
import { createJarryLandmarks } from './jarry-landmarks.js'
import { createJarryRoadworks } from './jarry-roadworks.js'
import { LANDMARK_SITES } from './jarry-landmark-sites.js'
import { groundHeight, padPoint, siteFoundations, siteHeights } from './jarry-elevation.js'
import { projectStreetLabels } from './jarry-streets.js'
import { BANK_POSITION, BANK_SCALE, createBankExterior } from './bank/exterior.js'

/** A playable miniature on the real Jarry footprint; project buildings remain fictional. */
export function createJarryWorld(container, { onSelect = () => {}, onLabels = () => {}, onStreetLabels = () => {}, onError = () => {}, onReady = () => {} } = {}) {
  const palette = {
    ink: 0x283e45, road: 0x606966, asphalt: 0x7a817b, paper: 0xf6edd6,
    yellow: 0xffd23f, yellowDark: 0xdba527, sand: 0xd8ae78, clay: 0xab7152,
    ground: 0xa9c39c, pavement: 0xcecfb0, teal: 0x329c9b, sea: 0x75afa9,
    coral: 0xef8056, green: 0x4b8763, leaf: 0x71aa66, grey: 0x839690,
  }
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.06
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.setAttribute('data-jarry-canvas', '')
  container.appendChild(renderer.domElement)

  const camera = new THREE.OrthographicCamera(-55, 55, 55, -55, 0.1, 1000)
  const initialTarget = new THREE.Vector3(0, 0, 0)
  const viewOffset = new THREE.Vector3(90, 215, 280)
  camera.position.copy(initialTarget).add(viewOffset)
  const gestureSurface = container.parentElement
  const controls = new OrbitControls(camera, gestureSurface)
  controls.target.copy(initialTarget)
  controls.enableRotate = false
  controls.enableDamping = false
  controls.screenSpacePanning = false
  controls.minZoom = 0.6
  controls.maxZoom = 48
  controls.zoomSpeed = 0.85
  controls.panSpeed = 0.8
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
  controls.touches.ONE = THREE.TOUCH.PAN
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
  controls.update()

  scene.add(new THREE.HemisphereLight(0xfbf3d9, 0x779f99, 1.8))
  const sun = new THREE.DirectionalLight(0xfff3d6, 2.8)
  sun.position.set(-100, 240, 100)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -210
  sun.shadow.camera.right = 210
  sun.shadow.camera.top = 210
  sun.shadow.camera.bottom = -210
  sun.shadow.camera.far = 700
  sun.shadow.normalBias = 0.06
  sun.shadow.bias = -0.0001
  scene.add(sun)

  const materials = new Map()
  const geometries = new Set()
  const textures = new Set()
  const batches = new Map()
  const cube = new THREE.BoxGeometry(1, 1, 1)
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 5)
  geometries.add(cube)
  geometries.add(cylinder)
  function material(color, extra = {}) {
    const key = `${color}:${JSON.stringify(extra)}`
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.84, ...extra }))
    return materials.get(key)
  }
  function mesh(geometry, color, pos, parent = scene, extra) {
    geometries.add(geometry)
    const object = new THREE.Mesh(geometry, material(color, extra))
    if (pos) object.position.set(...pos)
    object.castShadow = true
    object.receiveShadow = true
    parent.add(object)
    return object
  }
  function box(size, pos, color, parent = scene) {
    const object = mesh(cube, color, pos, parent)
    object.scale.set(...size)
    return object
  }
  const dummy = new THREE.Object3D()
  function batch(size, pos, color, rotation = [0, 0, 0], kind = 'box') {
    const key = `${kind}:${color}`
    if (!batches.has(key)) batches.set(key, { color, kind, matrices: [] })
    dummy.position.set(...pos)
    dummy.rotation.set(...rotation)
    dummy.scale.set(...size)
    dummy.updateMatrix()
    batches.get(key).matrices.push(dummy.matrix.clone())
  }
  const siteBatch = id => (size, [x, y, z], ...rest) => batch(size, [x, y + siteHeights[id], z], ...rest)
  const canopy = new THREE.IcosahedronGeometry(1,0)
  geometries.add(canopy)
  const roofProfile = new THREE.Shape()
  roofProfile.moveTo(-0.5,0)
  roofProfile.lineTo(0,1)
  roofProfile.lineTo(0.5,0)
  roofProfile.closePath()
  const roofGeometry = new THREE.ExtrudeGeometry(roofProfile,{depth:1,bevelEnabled:false})
  roofGeometry.translate(0,0,-0.5)
  geometries.add(roofGeometry)
  const batchGeometries={box:cube,cylinder,canopy,roof:roofGeometry}

  function warehouse(x,z,width,depth,height,roofColor,wallColor=palette.paper,angle=0,groundY=groundHeight(x,z)) {
    const rotate=(dx,dz)=>[x+dx*Math.cos(angle)+dz*Math.sin(angle),z-dx*Math.sin(angle)+dz*Math.cos(angle)]
    const block=(size,dx,y,dz,color,kind='box')=>{const [px,pz]=rotate(dx,dz);batch(size,[px,y+groundY,pz],color,[0,angle,0],kind)}
    block([width+0.35,0.1,depth+0.35],0,0.09,0,palette.pavement)
    block([width,height,depth],0,height/2+0.17,0,wallColor)
    const roofH=Math.min(width*0.15,0.52)
    block([width+0.22,roofH,depth+0.25],0,height+0.18,0,roofColor,'roof')
    for(let dx=-width/2+0.24;dx<width/2;dx+=0.55) block([0.035,0.035,depth+0.28],dx,height+0.2+roofH*(1-Math.abs(dx)/(width/2+0.1)),0,roofColor===palette.yellow?0xffe48b:0xb8c7b7)
    const doorW=Math.min(width*0.5,1.7)
    block([doorW,height*0.6,0.07],0,height*0.3+0.18,depth/2+0.035,palette.ink)
    for(let y=0.45;y<height*0.7;y+=0.3) block([doorW-0.06,0.025,0.04],0,y,depth/2+0.08,palette.asphalt)
  }
  const terrain = createJarryTerrain({ scene, mesh, batch, palette })
  const boulevardCurve = terrain.trafficCurve
  const landmarks = createJarryLandmarks(LANDMARK_SITES)
  scene.add(landmarks.group)
  const roadworks = createJarryRoadworks()
  scene.add(roadworks.group)

  for (const [id, pads] of Object.entries(siteFoundations)) for (const pad of pads) {
    const [x, z] = padPoint(PROJECT_SITES[id], pad, 0, 0)
    const bottom = pad.min - .025, top = siteHeights[id] + pad.bottom + .005
    batch([pad.width, top - bottom, pad.depth], [x, (top + bottom) / 2, z], palette.pavement, [0, pad.angle || 0, 0])
  }

  const bank = createBankExterior({ scene, box, mesh, palette, groundY: siteHeights.memebank })

  // The warm warehouse is a physical clue. Its parcel pictogram contains no project name.
  const depot=PROJECT_SITES.quilivreou
  const depotBatch=siteBatch('quilivreou')
  warehouse(depot.x,depot.z,5.8,4.8,2.25,palette.yellow,palette.paper,0,siteHeights.quilivreou)
  depotBatch([6.6,0.06,1.8],[depot.x,0.13,depot.z+3.1],0xc0c3a6)
  for(let x=depot.x-2.6;x<depot.x+2.9;x+=1.15) depotBatch([0.045,0.025,1.3],[x,0.18,depot.z+3],palette.paper)
  // A little taped parcel sits on the roof like a toy-model landmark.
  depotBatch([1.2,0.95,1.1],[depot.x,3.29,depot.z],0xd4a25f,[0,0.12,0])
  depotBatch([0.18,0.018,1.15],[depot.x,3.78,depot.z],palette.paper,[0,0.12,0])
  depotBatch([1.21,0.018,0.17],[depot.x,3.79,depot.z],palette.paper,[0,0.12,0])
  for(let i=0;i<8;i++) {
    const x=depot.x-2.4+(i%2)*0.5,z=depot.z+2.7+Math.floor(i/4)*0.53,y=0.42+(Math.floor(i/2)%2)*0.48
    depotBatch([0.45,0.46,0.46],[x,y,z],i%3?0xc99458:0xe2b875)
    depotBatch([0.1,0.018,0.47],[x,y+0.24,z],0xf4dc9d)
  }
  // A seaside pavilion hints at image-making, with no name or giant brand initial.
  const studio=PROJECT_SITES.shootareas
  const studioBatch=siteBatch('shootareas')
  studioBatch([5.1,0.17,3.5],[studio.x,0.14,studio.z],palette.pavement)
  studioBatch([3.8,1.55,2.55],[studio.x,0.98,studio.z],0xf0d8bd)
  studioBatch([4.15,0.2,2.9],[studio.x,1.88,studio.z],0xe89277)
  studioBatch([2.65,1.18,0.08],[studio.x,0.99,studio.z+1.32],0x577473)
  studioBatch([0.08,1.2,0.15],[studio.x,1.0,studio.z+1.37],palette.paper)
  studioBatch([0.85,0.61,0.62],[studio.x,2.31,studio.z],palette.ink)
  const lens=mesh(new THREE.CylinderGeometry(0.29,0.29,0.4,16),0x95bfc1,[studio.x,siteHeights.shootareas+2.32,studio.z+0.49])
  lens.rotation.x=Math.PI/2
  for(let i=0;i<3;i++) {
    const x=studio.x+2.5+i*0.72, y=groundHeight(x,studio.z+.3)
    batch([0.55,0.08,1.1],[x,y+0.24,studio.z+0.3],palette.paper)
    batch([0.45,0.05,0.45],[x,y+0.4,studio.z-0.05],palette.coral,[-0.5,0,0])
    for(const dz of [-.1,.7]) batch([.4,.2,.08],[x,y+.1,studio.z+dz],palette.paper)
  }
  const workshop=PROJECT_SITES.zikak
  const workshopBatch=siteBatch('zikak')
  warehouse(workshop.x,workshop.z,3.4,2.7,1.5,palette.grey,0xa9b9ad,0.1,siteHeights.zikak)
  workshopBatch([3.4,0.14,0.16],[workshop.x,0.65,workshop.z+1.6],palette.ink)
  for(let i=0;i<5;i++) workshopBatch([0.24,0.28,0.2],[workshop.x-1.4+i*0.65,0.65,workshop.z+1.62],palette.yellow,[0,0,0.4])
  const disk=mesh(new THREE.CylinderGeometry(0.52,0.52,0.15,12),0xb3bdad,[workshop.x,siteHeights.zikak+2.52,workshop.z])
  disk.rotation.x=Math.PI/2

  // Two stylised cranes stand inland of actual quay vertices. They add relief without
  // moving the shore or claiming an exact inventory of port equipment.
  const quayAngle=-0.72
  const quayPoint=(x,z,dx,dz)=>[x+dx*Math.cos(quayAngle)+dz*Math.sin(quayAngle),z-dx*Math.sin(quayAngle)+dz*Math.cos(quayAngle)]
  for(const [x,z] of [[106.9,57.0],[94.7,70.9]]) {
    const block=(size,dx,y,dz,color)=>{const [px,pz]=quayPoint(x,z,dx,dz);batch(size,[px,y+groundHeight(x,z),pz],color,[0,quayAngle,0])}
    for(const dx of [-0.8,0.8]) {
      for(const dz of [-1.1,1.1]) block([0.16,3.5,0.16],dx,1.9,dz,palette.yellow)
      block([0.22,0.24,2.6],dx,3.7,0,palette.yellow)
    }
    block([4.7,0.26,0.36],1.1,3.9,0,palette.yellow)
  }
  const hookOrigin=quayPoint(106.9,57.0,2.4,0)
  const craneHook=new THREE.Group()
  craneHook.position.set(hookOrigin[0],2.8+groundHeight(106.9,57),hookOrigin[1])
  box([0.04,1.6,0.04],[0,0,0],palette.ink,craneHook)
  box([0.25,0.18,0.16],[0,-0.85,0],palette.ink,craneHook)
  scene.add(craneHook)
  const boat=new THREE.Group()
  const boatPosition=quayPoint(108.67,58.24,3.4,0)
  boat.position.set(boatPosition[0],-0.11,boatPosition[1])
  boat.rotation.y=quayAngle
  box([1.8,0.66,6.9],[0,0.24,0],palette.ink,boat)
  box([1.82,0.23,6.8],[0,0.6,0],palette.paper,boat)
  box([1.5,0.12,6.3],[0,0.75,0],palette.sand,boat)
  box([1.2,0.8,1.15],[0,1.1,2.1],palette.paper,boat)
  box([1.25,0.26,0.25],[0,1.25,1.45],palette.ink,boat)
  for(let i=0;i<3;i++) box([1.32,0.6,1.1],[0,1.07,-2.2+i*1.2],i%2?palette.teal:palette.coral,boat)
  scene.add(boat)
  function truck(color,size=1) {
    const group=new THREE.Group()
    box([1.25,0.72,1.08],[0,0.71,1.03],color,group)
    box([1.1,0.45,0.85],[0,1.25,0.97],color,group)
    box([1.12,0.28,0.045],[0,1.3,1.42],0x49676a,group)
    box([1.42,1.2,2.25],[0,1.02,-0.7],palette.paper,group)
    box([1.47,0.17,3.7],[0,0.44,-0.16],palette.ink,group)
    for(const z of [-1.38,0.93]) for(const x of [-0.69,0.69]) {
      const wheel=mesh(new THREE.CylinderGeometry(0.3,0.3,0.16,10),palette.ink,[x,0.37,z],group)
      wheel.rotation.z=Math.PI/2
    }
    group.scale.setScalar(size)
    scene.add(group)
    return group
  }
  const delivery=truck(palette.yellow,0.42)
  delivery.position.set(depot.x+1.5,siteHeights.quilivreou+0.12,depot.z+3)
  delivery.rotation.y=Math.PI/2
  const traffic=truck(palette.coral,0.095)
  const traffic2=truck(0x7ba8a4,0.09)
  for(const {color,kind,matrices} of batches.values()) {
    const instanced=new THREE.InstancedMesh(batchGeometries[kind],material(color),matrices.length)
    matrices.forEach((matrix,index)=>instanced.setMatrixAt(index,matrix))
    instanced.castShadow=true
    instanced.receiveShadow=true
    scene.add(instanced)
  }

  const beaconMaterial=new THREE.MeshStandardMaterial({color:0xff8d3b,emissive:0xff6425,emissiveIntensity:1.5,roughness:0.3})
  materials.set('beacon',beaconMaterial)
  const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.22,0.29,12),beaconMaterial)
  geometries.add(beacon.geometry)
  beacon.position.set(depot.x+2.45,siteHeights.quilivreou+2.7,depot.z+1.9)
  scene.add(beacon)
  const alarmLight=new THREE.PointLight(0xff7733,7,7,2)
  alarmLight.position.copy(beacon.position)
  scene.add(alarmLight)

  const markerData=[
    {id:'memebank',position:new THREE.Vector3(BANK_POSITION.x,5.1*BANK_SCALE,BANK_POSITION.z)},
    {id:'quilivreou',position:new THREE.Vector3(depot.x,4.0,depot.z)},
    {id:'shootareas',position:new THREE.Vector3(studio.x,3.3,studio.z)},
    {id:'zikak',position:new THREE.Vector3(workshop.x,3.1,workshop.z)},
  ]
  for(const marker of markerData) marker.position.y+=siteHeights[marker.id]
  markerData.push(...landmarks.markers)
  const targets={...Object.fromEntries(Object.entries(PROJECT_SITES).map(([id,site])=>[id,new THREE.Vector3(site.x,siteHeights[id],site.z)])),...landmarks.targets}
  const pickables=[...landmarks.pickables]
  for(const [id,size,pos] of [['memebank',[7*BANK_SCALE,5*BANK_SCALE,6*BANK_SCALE],[BANK_POSITION.x,2.5*BANK_SCALE,BANK_POSITION.z]],['quilivreou',[7,4.5,6],[depot.x,2,depot.z]],['shootareas',[5,3.5,4.5],[studio.x,1.5,studio.z]],['zikak',[4.5,3.3,4],[workshop.x,1.5,workshop.z]]]) {
    const hit=mesh(cube,palette.paper,pos,scene,{transparent:true,opacity:0,depthWrite:false})
    hit.position.y+=siteHeights[id]
    hit.scale.set(...size)
    hit.castShadow=false
    hit.receiveShadow=false
    hit.userData.projectId=id
    pickables.push(hit)
  }

  let disposed=false
  let paused=false
  let requestedActive=true
  let active=true
  let contextIsLost=false
  let repaired=false
  let pageVisible=!document.hidden
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion=motionQuery.matches
  let elapsed=0
  let lastTime=0
  let frameId=0
  let renderCount=0
  let width=1
  let height=1
  let tween=null
  let down=null
  let selectedProject=null
  let gestureHadMultiplePointers=false
  const pointers=new Set()
  const projection=new THREE.Vector3()
  const raycaster=new THREE.Raycaster()
  const pointer=new THREE.Vector2()
  let previousLabels=[]
  let streetView=''

  function publishLabels() {
    const labels=markerData.map(({id,position,selectedOnly,labelOffset=0})=>{
      projection.copy(position).project(camera)
      return {id,x:(projection.x+1)*width/2,y:(1-projection.y)*height/2-labelOffset,visible:(!selectedOnly||id===selectedProject)&&Math.abs(projection.x)<1.08&&Math.abs(projection.y)<1.08&&projection.z<1}
    })
    // Keep touch targets at their readable size. At overview scale only display
    // non-overlapping landmarks; every place remains in the ordinary place list.
    const occupied=[]
    const priority=id=>id===selectedProject?0:id==='quilivreou'?1:id==='memebank'?2:3
    for(const label of [...labels].sort((a,b)=>priority(a.id)-priority(b.id))) {
      label.visible=label.visible&&label.x>26&&label.x<width-26&&label.y>54&&label.y<height-20
      if(label.visible&&occupied.some(other=>Math.abs(label.x-other.x)<56&&Math.abs(label.y-other.y)<60)) label.visible=false
      if(label.visible) occupied.push(label)
    }
    if(labels.some((label,index)=>!previousLabels[index]||Math.abs(label.x-previousLabels[index].x)>0.2||Math.abs(label.y-previousLabels[index].y)>0.2||label.visible!==previousLabels[index].visible)) {
      previousLabels=labels
      onLabels(labels)
    }
    const nextStreetView=[width,height,camera.zoom,controls.target.x,controls.target.z,selectedProject,bottomInset].join(':')
    if(nextStreetView!==streetView) {
      streetView=nextStreetView
      onStreetLabels(projectStreetLabels(camera,width,height,labels))
    }
  }
  function render() {
    if(disposed||!active||!pageVisible) return
    camera.updateMatrixWorld()
    renderer.render(scene,camera)
    renderCount++
    publishLabels()
  }
  function updateAnimation(dt) {
    elapsed+=dt
    bank.update(dt)
    for(const [vehicle,t,reverse] of [[traffic,(elapsed*0.016)%1,false],[traffic2,(elapsed*0.013+0.4)%1,true]]) {
      const progress=reverse?1-t:t
      const point=boulevardCurve.getPointAt(progress),tangent=boulevardCurve.getTangentAt(progress)
      const direction=reverse?-1:1
      vehicle.position.set(point.x-tangent.z*0.09*direction,point.y,point.z+tangent.x*0.09*direction)
      vehicle.rotation.y=Math.atan2(tangent.x,tangent.z)+(reverse?Math.PI:0)
    }
    boat.position.y=-0.11+Math.sin(elapsed*1.2)*0.045
    boat.rotation.z=Math.sin(elapsed*0.9)*0.012
    craneHook.position.x=hookOrigin[0]+Math.sin(elapsed*0.19)*0.3
    beaconMaterial.emissiveIntensity=repaired?0.35:1.15+(Math.sin(elapsed*1.5)+1)*0.45
    alarmLight.intensity=repaired?0:5.5+(Math.sin(elapsed*1.5)+1)*2
    if(repaired) {
      const travel=(Math.sin(elapsed*0.23)+1)*0.5
      delivery.position.set(depot.x-1.8+travel*4.3,siteHeights.quilivreou+0.12,depot.z+3)
      delivery.rotation.y=Math.cos(elapsed*0.23)>0?Math.PI/2:-Math.PI/2
    }
  }
  function animate(time) {
    frameId=0
    if(disposed||!active||!pageVisible) return
    const dt=Math.min(lastTime?(time-lastTime)/1000:0,0.06)
    lastTime=time
    if(!paused&&!reducedMotion) updateAnimation(dt)
    if(tween) {
      const progress=Math.min((time-tween.start)/tween.duration,1)
      const eased=1-Math.pow(1-progress,3)
      controls.target.lerpVectors(tween.from,tween.to,eased)
      camera.position.copy(controls.target).add(viewOffset)
      camera.zoom=THREE.MathUtils.lerp(tween.fromZoom,tween.toZoom,eased)
      camera.updateProjectionMatrix()
      controls.update()
      if(progress===1) {
        const complete=tween.resolve
        tween=null
        complete()
      }
    }
    render()
    if((!paused&&!reducedMotion)||tween) frameId=requestAnimationFrame(animate)
  }
  function requestRender() {
    if(!frameId&&!disposed&&active&&pageVisible) frameId=requestAnimationFrame(animate)
  }
  function settleTween() {
    if(!tween) return
    const complete=tween.resolve
    tween=null
    complete()
  }
  function finishTween() {
    if(!tween) return
    const current=tween
    tween=null
    controls.target.copy(current.to)
    camera.position.copy(current.to).add(viewOffset)
    camera.zoom=current.toZoom
    camera.updateProjectionMatrix()
    controls.update()
    current.resolve()
  }
  function moveTo(target,zoom) {
    settleTween()
    if(reducedMotion||paused||!active||!pageVisible) {
      controls.target.copy(target)
      camera.position.copy(target).add(viewOffset)
      camera.zoom=zoom
      camera.updateProjectionMatrix()
      controls.update()
      requestRender()
      return Promise.resolve()
    }
    return new Promise(resolve=>{
      tween={from:controls.target.clone(),to:target.clone(),fromZoom:camera.zoom,toZoom:zoom,start:performance.now(),duration:680,resolve}
      requestRender()
    })
  }
  function constrainPan() {
    const old=controls.target.clone()
    controls.target.x=THREE.MathUtils.clamp(controls.target.x,WORLD_BOUNDS.minX,WORLD_BOUNDS.maxX)
    // Keep the terrain height of the selected place while panning in X/Z.
    controls.target.z=THREE.MathUtils.clamp(controls.target.z,WORLD_BOUNDS.minZ,WORLD_BOUNDS.maxZ)
    camera.position.add(controls.target.clone().sub(old))
    requestRender()
  }
  controls.addEventListener('change',constrainPan)
  controls.addEventListener('start',settleTween)
  let bottomInset=0
  function frameViewport() {
    camera.setViewOffset(width,height,0,Math.min(bottomInset,height*.75)/2,width,height)
    camera.updateProjectionMatrix()
    requestRender()
  }
  function resize() {
    const rect=container.getBoundingClientRect()
    width=Math.max(rect.width,1)
    height=Math.max(rect.height,1)
    const aspect=width/height
    // Fit the projected geographic extent, including the north and port tips.
    camera.updateMatrixWorld()
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0)
    const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1)
    const projectedWidth=Math.abs(right.x)*WORLD_BOUNDS.width+Math.abs(right.z)*WORLD_BOUNDS.depth
    const projectedHeight=Math.abs(up.x)*WORLD_BOUNDS.width+Math.abs(up.z)*WORLD_BOUNDS.depth
    const viewWidth=Math.max(projectedWidth,projectedHeight*aspect)*1.14
    camera.left=-viewWidth/2
    camera.right=viewWidth/2
    camera.top=viewWidth/aspect/2
    camera.bottom=-viewWidth/aspect/2
    frameViewport()
    renderer.setSize(width,height)
    requestRender()
  }
  const observer=new ResizeObserver(resize)
  observer.observe(container)
  function onPointerDown(event) {
    if(!active) return
    pointers.add(event.pointerId)
    if(pointers.size===1) {down={x:event.clientX,y:event.clientY,moved:false,project:event.target.closest?.('[data-project]')?.dataset.project};gestureHadMultiplePointers=false}
    else gestureHadMultiplePointers=true
  }
  function onPointerMove(event) {
    if(down&&Math.hypot(event.clientX-down.x,event.clientY-down.y)>7) down.moved=true
  }
  function onPointerUp(event) {
    pointers.delete(event.pointerId)
    if(!active) {down=null;return}
    if(!down||down.moved||gestureHadMultiplePointers||Math.hypot(event.clientX-down.x,event.clientY-down.y)>7) {if(!pointers.size)down=null;return}
    const project=down.project
    down=null
    if(project) {onSelect(project);return}
    const rect=renderer.domElement.getBoundingClientRect()
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1)
    raycaster.setFromCamera(pointer,camera)
    const hit=raycaster.intersectObjects(pickables,false)[0]
    if(hit) onSelect(hit.object.userData.projectId)
  }
  function onPointerCancel(event) {pointers.delete(event.pointerId);down=null}
  function onKeyDown(event) {
    if(!active) return
    if(event.target!==container&&event.target!==renderer.domElement) return
    const key=event.key
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','Home'].includes(key)) return
    event.preventDefault()
    settleTween()
    if(key==='Home') {void moveTo(initialTarget,1);return}
    if(['+','=','-','_'].includes(key)) {
      zoomBy(key==='+'||key==='='?1.2:1/1.2)
      return
    }
    const distance=(camera.right-camera.left)*0.055/camera.zoom
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0)
    const up=new THREE.Vector3().crossVectors(camera.up,right).normalize()
    const offset=key==='ArrowLeft'?right.multiplyScalar(-distance):key==='ArrowRight'?right.multiplyScalar(distance):key==='ArrowUp'?up.multiplyScalar(distance):up.multiplyScalar(-distance)
    camera.position.add(offset)
    controls.target.add(offset)
    controls.update()
    requestRender()
  }
  function visibilityChange() {
    pageVisible=!document.hidden
    lastTime=0
    if(!pageVisible) {cancelAnimationFrame(frameId);frameId=0;settleTween()}
    else requestRender()
  }
  function motionChange(event) {
    reducedMotion=event.matches
    lastTime=0
    if(reducedMotion) {finishTween();bank.settle()}
    requestRender()
  }
  function contextLost(event) {
    event.preventDefault()
    contextIsLost=true
    syncActive()
    onError(new Error('Le contexte WebGL a été interrompu.'))
  }
  function contextRestored() {
    if(disposed) return
    contextIsLost=false
    syncActive()
    onReady()
  }
  gestureSurface.addEventListener('pointerdown',onPointerDown)
  gestureSurface.addEventListener('pointermove',onPointerMove)
  gestureSurface.addEventListener('pointerup',onPointerUp)
  gestureSurface.addEventListener('pointercancel',onPointerCancel)
  renderer.domElement.addEventListener('webglcontextlost',contextLost)
  renderer.domElement.addEventListener('webglcontextrestored',contextRestored)
  container.addEventListener('keydown',onKeyDown)
  document.addEventListener('visibilitychange',visibilityChange)
  motionQuery.addEventListener('change',motionChange)

  function zoomBy(factor) {
    settleTween()
    camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,controls.minZoom,controls.maxZoom)
    camera.updateProjectionMatrix()
    controls.update()
    requestRender()
  }
  function syncActive() {
    active=requestedActive&&!contextIsLost
    controls.enabled=active
    lastTime=0
    if(!active) {cancelAnimationFrame(frameId);frameId=0;settleTween()}
    else requestRender()
  }
  function setActive(value) {
    requestedActive=Boolean(value)
    syncActive()
  }
  updateAnimation(0)
  resize()
  return {
    focusProject(id) {selectedProject=id;const frameWidth=landmarks.focusWidths[id];const zoom=THREE.MathUtils.clamp((camera.right-camera.left)/(frameWidth?Math.max(frameWidth,frameWidth*width/height):Math.max(22,25*width/height))*(id==='memebank'?1.4:1),controls.minZoom,controls.maxZoom);return targets[id]?moveTo(targets[id],zoom):Promise.resolve()},
    setSelected(id) {selectedProject=id;requestRender()},
    setBottomInset(pixels) {bottomInset=Math.max(0,Number.isFinite(pixels)?pixels:0);frameViewport()},
    resetView() {selectedProject=null;return moveTo(initialTarget,1)},
    zoomBy,
    getView() {return {target:controls.target.toArray(),zoom:camera.zoom}},
    getDebug() {return {cameraFlying:!!tween,selectedProject,terrain:terrain.counts,landmarks:landmarks.counts,roadworks:roadworks.counts,bounds:WORLD_BOUNDS,bank:bank.getDebug(),active,requestedActive,contextIsLost,paused,reducedMotion,repaired,disposed,renderCount,view:{target:controls.target.toArray(),zoom:camera.zoom},frameScheduled:!!frameId,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}},
    setView(view) {if(view?.target?.length===3) return moveTo(new THREE.Vector3(...view.target),THREE.MathUtils.clamp(view.zoom||1,controls.minZoom,controls.maxZoom));return Promise.resolve()},
    setPaused(value) {paused=value;lastTime=0;if(value) bank.settle();requestRender()},
    setBankState(state) {bank.setState(state,{animate:active&&!paused&&!reducedMotion});requestRender()},
    setActive,
    setRepaired(value) {
      repaired=value
      beaconMaterial.color.set(value?0xb9da72:0xff8d3b)
      beaconMaterial.emissive.set(value?0x6d9c38:0xff6425)
      beaconMaterial.emissiveIntensity=value?0.35:1.5
      alarmLight.intensity=value?0:7
      if(!value) {delivery.position.set(depot.x+1.5,siteHeights.quilivreou+0.12,depot.z+3);delivery.rotation.y=Math.PI/2}
      requestRender()
    },
    dispose() {
      if(disposed) return
      disposed=true
      cancelAnimationFrame(frameId)
      settleTween()
      observer.disconnect()
      controls.removeEventListener('change',constrainPan)
      controls.removeEventListener('start',settleTween)
      controls.dispose()
      gestureSurface.removeEventListener('pointerdown',onPointerDown)
      gestureSurface.removeEventListener('pointermove',onPointerMove)
      gestureSurface.removeEventListener('pointerup',onPointerUp)
      gestureSurface.removeEventListener('pointercancel',onPointerCancel)
      renderer.domElement.removeEventListener('webglcontextlost',contextLost)
      renderer.domElement.removeEventListener('webglcontextrestored',contextRestored)
      container.removeEventListener('keydown',onKeyDown)
      document.removeEventListener('visibilitychange',visibilityChange)
      motionQuery.removeEventListener('change',motionChange)
      scene.traverse(object=>{if(object.isInstancedMesh) object.dispose()})
      landmarks.dispose()
      roadworks.dispose()
      sun.shadow.dispose()
      geometries.forEach(geometry=>geometry.dispose())
      materials.forEach(value=>value.dispose())
      textures.forEach(texture=>texture.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      scene.clear()
    },
  }
}
