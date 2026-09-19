import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/** A deliberately simplified Jarry diorama, not a geographic navigation map. */
export function createJarryWorld(container, { onSelect = () => {}, onLabels = () => {}, onError = () => {}, onReady = () => {} } = {}) {
  const palette = {
    ink: 0x283e45, road: 0x384f52, asphalt: 0x516a68, paper: 0xf6edd6,
    yellow: 0xffd23f, yellowDark: 0xdba527, sand: 0xd8ae78, clay: 0xab7152,
    ground: 0xa9c39c, pavement: 0xcecfb0, teal: 0x329c9b, sea: 0x63c5ba,
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
  renderer.toneMappingExposure = 1.23
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.setAttribute('data-jarry-canvas', '')
  container.appendChild(renderer.domElement)

  const camera = new THREE.OrthographicCamera(-25, 25, 25, -25, 0.1, 250)
  const initialTarget = new THREE.Vector3(0, 0, 1)
  const viewOffset = new THREE.Vector3(29, 43, 52)
  camera.position.copy(initialTarget).add(viewOffset)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(initialTarget)
  controls.enableRotate = false
  controls.enableDamping = false
  controls.screenSpacePanning = true
  controls.minZoom = 0.75
  controls.maxZoom = 3.2
  controls.zoomSpeed = 0.85
  controls.panSpeed = 0.8
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
  controls.touches.ONE = THREE.TOUCH.PAN
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
  controls.update()

  scene.add(new THREE.HemisphereLight(0xfbf3d9, 0x779f99, 2.3))
  const sun = new THREE.DirectionalLight(0xfff3d6, 3.6)
  sun.position.set(-25, 40, 20)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -34
  sun.shadow.camera.right = 34
  sun.shadow.camera.top = 34
  sun.shadow.camera.bottom = -34
  sun.shadow.camera.far = 110
  sun.shadow.normalBias = 0.06
  sun.shadow.bias = -0.0001
  scene.add(sun)

  const materials = new Map()
  const geometries = new Set()
  const textures = new Set()
  const batches = new Map()
  const cube = new THREE.BoxGeometry(1, 1, 1)
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8)
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
  function extrude(points, y, depth, color, scale = 1) {
    const shape = new THREE.Shape()
    points.forEach(([x, z], index) => index ? shape.lineTo(x * scale, -z * scale) : shape.moveTo(x * scale, -z * scale))
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    geometry.rotateX(-Math.PI / 2)
    return mesh(geometry, color, [0, y, 0])
  }
  const coastline = [[-10,-21],[-3,-22],[7,-20],[10,-15],[10,-7],[8,-3],[10,4],[8,9],[11,15],[7,20],[-1,22],[-10,18],[-13,9],[-13,-3],[-12,-15]]
  const seaEdge = [[-12,-23],[0,-24],[10,-22],[15,-14],[16,0],[17,13],[12,22],[1,25],[-11,22],[-16,12],[-16,-6]]
  extrude(seaEdge, -2.1, 1.2, 0x338f89)
  extrude(seaEdge, -0.9, 0.65, palette.sea)
  extrude(coastline, -2.8, 1.15, palette.clay, 0.94)
  extrude(coastline, -1.75, 1.1, palette.sand, 0.985)
  extrude(coastline, -0.75, 0.75, palette.ground)

  // Visible strata are interrupted by protruding rocks, as on a little cut-out world.
  const stone = new THREE.DodecahedronGeometry(1, 0)
  for (let i = 0; i < 13; i++) {
    const angle = i * 2.4
    const rock = mesh(stone, i % 2 ? 0xd7b581 : 0xbd9568, [Math.cos(angle) * 12, -1.15, Math.sin(angle) * 18])
    rock.scale.set(0.8 + i % 3 * 0.16, 0.6, 0.8)
    rock.rotation.set(i, i * 0.5, 0)
  }

  // Roads: La Jaille, an industrial boulevard and its small service roads.
  const roadY = 0.07
  const road = (size, pos, color = palette.road) => batch(size, pos, color)
  road([4.4,0.11,29],[-2.1,roadY,4.2])
  road([4.8,0.12,8.4],[-2.1,roadY,-16.5])
  road([14.1,0.12,3.5],[-3.1,roadY,-12.8])
  road([20.5,0.12,3.1],[-0.4,roadY,8.5])
  road([14,0.12,2.7],[-3.6,roadY,-0.7])
  const roundabout = mesh(new THREE.CylinderGeometry(4.2,4.2,0.13,64), palette.road, [-2.1,0.11,-12.8])
  roundabout.receiveShadow = true
  mesh(new THREE.CylinderGeometry(2.65,2.65,0.18,48), palette.paper, [-2.1,0.22,-12.8])
  mesh(new THREE.CylinderGeometry(2.42,2.42,0.24,48), palette.green, [-2.1,0.31,-12.8])
  mesh(new THREE.CylinderGeometry(1.2,1.2,0.3,16), palette.pavement, [-2.1,0.58,-12.8])
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2
    batch([0.55,0.022,0.09],[-2.1 + Math.cos(a)*3.44,0.19,-12.8+Math.sin(a)*3.44],palette.paper,[0,-a,0])
  }
  for (let z = -7.6; z < 18; z += 2.5) road([0.09,0.025,1],[-2.1,0.15,z],palette.paper)
  for (let x = -8.5; x < 9; x += 2.4) road([1.05,0.025,0.09],[x,0.15,8.5],palette.paper)
  for (const z of [-6.5,6.0]) {
    for (let x = -3.8; x < -0.25; x += 0.58) road([0.32,0.028,1.15],[x,0.16,z],palette.paper)
  }
  // Green cycle strip on the Voie Verte side.
  road([0.7,0.13,14.8],[-4.8,0.075,0.8],0x729e71)
  for (let z = -5.5; z < 8; z += 3) road([0.2,0.03,0.55],[-4.8,0.16,z],palette.paper)

  function palm(x, z, scale = 1, lean = 0) {
    batch([0.19 * scale,3.3 * scale,0.19 * scale],[x+lean/2,1.65*scale,z],0x9c8056,[0,0,-lean/6],'cylinder')
    const head = [x+lean,3.3*scale,z]
    for (let i = 0; i < 6; i++) {
      const a = i*Math.PI/3 + x
      batch([0.45*scale,0.13*scale,1.45*scale],[head[0]+Math.sin(a)*0.6*scale,head[1]-0.18,head[2]+Math.cos(a)*0.6*scale],i%2?palette.leaf:palette.green,[0.22,a,-0.12])
    }
  }
  palm(-2.1,-12.8,1.28,0.32)
  const palms = [[-9,-17],[-8,-9],[-11,-3],[-11,3],[-10,12],[-6,18],[2,19],[10,15],[9,11],[9,-10],[7,-18],[0,-20],[-7,5],[2,12],[4,16]]
  palms.forEach(([x,z],i) => palm(x,z,0.74+(i%3)*0.16,(i%2?-1:1)*0.28))

  // Warehouse helper keeps the industrial roofs ribbed and easily recognizable.
  function warehouse(x,z,width,depth,height,roofColor,wallColor=palette.paper) {
    batch([width+0.7,0.15,depth+0.7],[x,0.15,z],palette.pavement)
    batch([width,height,depth],[x,height/2+0.22,z],wallColor)
    const roofHeight = 0.74
    const profile = new THREE.Shape()
    profile.moveTo(-width/2-0.18,0)
    profile.lineTo(0,roofHeight)
    profile.lineTo(width/2+0.18,0)
    profile.closePath()
    const geometry = new THREE.ExtrudeGeometry(profile,{depth:depth+0.35,bevelEnabled:false})
    mesh(geometry,roofColor,[x,height+0.19,z-depth/2-0.18])
    for (let i=-width/2+0.25;i<width/2;i+=0.62) {
      const y = height+0.23+roofHeight*(1-Math.abs(i)/(width/2))
      batch([0.045,0.04,depth+0.45],[x+i,y,z],roofColor===palette.yellow?0xffe784:0xaec8bc)
    }
    batch([width+0.3,0.13,0.13],[x,height+0.24,z+depth/2+0.19],palette.ink)
    const doorW = Math.min(width*0.5,2.25)
    batch([doorW,height*0.62,0.1],[x,height*0.31+0.2,z+depth/2+0.025],palette.ink)
    for (let y=0.55;y<height*0.7;y+=0.3) batch([doorW-0.08,0.045,0.04],[x,y,z+depth/2+0.09],palette.asphalt)
    batch([0.16,height*0.73,0.19],[x-doorW/2-0.1,height*0.37+0.18,z+depth/2+0.1],roofColor)
    batch([0.16,height*0.73,0.19],[x+doorW/2+0.1,height*0.37+0.18,z+depth/2+0.1],roofColor)
  }

  warehouse(4.3,-4.0,7.0,7.5,3.1,palette.yellow)
  warehouse(-8.1,-4.1,4.2,5.1,2.0,0x77a59e,0xd5ddcc)
  warehouse(4.3,-16.0,4.6,3.1,1.55,0xafbcad,0xc6ccbb)
  warehouse(-8.1,13.2,4.4,4.6,1.85,palette.coral)
  warehouse(-8.6,-18.4,3.0,3.0,1.6,0x84a69c)

  function sign(text,x,y,z,width,color=palette.ink,bg=palette.paper,rotateY=0) {
    const canvas = document.createElement('canvas')
    const square = text.length === 1
    canvas.width = square ? 160 : 512
    canvas.height = 160
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = `#${bg.toString(16).padStart(6,'0')}`
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = `#${color.toString(16).padStart(6,'0')}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${square ? 126 : 92}px sans-serif`
    ctx.fillText(text,canvas.width / 2,88,canvas.width - 28)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    textures.add(texture)
    const face = mesh(new THREE.PlaneGeometry(width,width*160/canvas.width),palette.paper,[x,y,z],scene,{map:texture,roughness:0.95})
    face.rotation.y=rotateY
    return face
  }
  sign('DÉPÔT Q',4.3,2.9,-0.18,3.9,palette.ink,palette.yellow)
  const roofBadge = sign('Q',4.3,4.06,-3.9,2.5,palette.ink,palette.yellow)
  roofBadge.rotation.x = -Math.PI/2
  roofBadge.rotation.z = 0
  // Yard: dispatch lanes, pallets, packages and a delivery truck.
  batch([7.0,0.11,5.3],[4.3,0.15,3.7],0xc0c3a6)
  for(let x=1.3;x<8;x+=1.35) batch([0.07,0.028,2.5],[x,0.22,3.2],palette.paper)
  for(let i=0;i<14;i++) {
    const x=6.7+(i%2)*0.67
    const z=1.4+Math.floor(i/4)*0.74
    const y=0.54+(Math.floor(i/2)%2)*0.58
    batch([0.61,0.59,0.62],[x,y,z],i%3?0xc99458:0xe2b875)
    batch([0.12,0.02,0.62],[x,y+0.304,z],0xf4dc9d)
  }
  batch([1.65,0.2,1.9],[7,0.27,2.1],0x957149)

  // Studio at the seafront: pink cyclorama and a giant camera on the roof.
  batch([7.2,0.18,6.0],[3.2,0.15,14.5],palette.pavement)
  batch([4.8,2.15,3.8],[3.7,1.32,14.2],0xf0d8bd)
  batch([5.25,0.24,4.2],[3.7,2.49,14.2],0xe89277)
  batch([2.7,1.5,0.1],[3.7,1.2,16.16],0x577473)
  batch([0.09,1.55,0.16],[3.7,1.2,16.2],palette.paper)
  batch([2.3,0.2,0.85],[3.7,2.56,16.4],palette.paper)
  batch([1.75,1.1,0.95],[3.7,3.27,14.3],palette.ink)
  batch([0.55,0.23,0.6],[3.1,3.9,14.3],palette.ink)
  const lens = mesh(new THREE.CylinderGeometry(0.5,0.5,0.7,24),0x95bfc1,[3.7,3.28,15.05])
  lens.rotation.x=Math.PI/2
  const glass = mesh(new THREE.CylinderGeometry(0.33,0.33,0.03,24),0x314d64,[3.7,3.28,15.42])
  glass.rotation.x=Math.PI/2
  sign('STUDIO',3.7,2.14,16.23,2.5,palette.ink,0xe89277)
  for(let i=0;i<3;i++) {
    batch([0.72,0.1,1.8],[7.8,0.3,12.5+i*2],palette.paper)
    batch([0.55,0.07,0.7],[7.8,0.5,12+i*2],palette.coral,[-0.5,0,0])
  }

  // Zikak remains a little closed workshop, waiting to be revealed.
  warehouse(-8.1,3.2,4.1,3.1,1.7,palette.grey,0xa9b9ad)
  batch([4.6,0.15,0.24],[-8.1,0.7,5.35],palette.ink)
  for(let i=0;i<6;i++) batch([0.27,0.32,0.26],[-10.1+i*0.72,0.7,5.36],palette.yellow,[0,0,0.4])
  const coin = mesh(new THREE.CylinderGeometry(0.6,0.6,0.19,12),0xc0cabb,[-8.1,2.95,3.2])
  coin.rotation.x=Math.PI/2

  // Port: colorful container stacks, a working gantry and a small cargo vessel.
  batch([5.5,0.38,9.5],[10.5,0.04,2.7],palette.pavement)
  function containerBox(x,y,z,color,angle=0) {
    batch([1.75,1.2,3.7],[x,y,z],color,[0,angle,0])
    for(let i=-1.5;i<1.65;i+=0.45) batch([1.8,0.92,0.055],[x,y,z+i],color,[0,angle,0])
    batch([1.79,0.1,3.75],[x,y+0.63,z],color,[0,angle,0])
  }
  containerBox(10.2,0.9,0.2,palette.coral)
  containerBox(10.2,2.2,0.2,0x65a3a1)
  containerBox(12.3,0.9,0.2,0xe8c068)
  containerBox(10.2,0.9,5.1,0x55837e)
  for(const x of [9.1,13.0]) {
    batch([0.28,5.1,0.28],[x,2.7,-2.6],palette.yellow)
    batch([0.28,5.1,0.28],[x,2.7,2.7],palette.yellow)
    batch([0.4,0.35,6.0],[x,5.15,0],palette.yellow)
  }
  batch([7.6,0.5,0.65],[12.1,5.45,0.6],palette.yellow)
  const craneHook = new THREE.Group()
  craneHook.position.set(14.2,4.3,0.6)
  box([0.055,1.8,0.055],[0,0,0],palette.ink,craneHook)
  box([0.36,0.3,0.25],[0,-1,0],palette.ink,craneHook)
  scene.add(craneHook)

  const boat = new THREE.Group()
  boat.position.set(13.7,-0.04,10)
  box([1.5,0.6,4.4],[0,0.26,0],palette.paper,boat)
  box([1.34,0.08,3.9],[0,0.59,0],palette.sand,boat)
  box([1,0.7,1],[0,0.95,1.1],palette.paper,boat)
  box([1.05,0.28,0.3],[0,1.13,0.6],palette.ink,boat)
  box([0.8,0.6,1.6],[0,0.91,-1],palette.coral,boat)
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
  const delivery=truck(palette.yellow,0.75)
  delivery.position.set(3.2,0.17,4.0)
  delivery.rotation.y=Math.PI
  const traffic=truck(palette.coral,0.55)
  const traffic2=truck(0x7ba8a4,0.48)

  // Lamps and small street details bring scale without competing with project markers.
  for(let z=-6;z<18;z+=6) {
    batch([0.085,2.65,0.085],[0.45,1.45,z],palette.ink)
    batch([0.72,0.12,0.25],[0.14,2.77,z],palette.paper)
  }
  for(const [x,z] of [[-6.2,-8.5],[7.5,-9.2],[-11,8],[6.2,19]]) {
    batch([1.6,0.42,0.75],[x,0.32,z],0xc3bb98)
    batch([1.4,0.36,0.6],[x,0.65,z],palette.green)
  }
  for(let i=0;i<14;i++) {
    const x=12.5+Math.sin(i*7.3)*1.7
    const z=-16+i*2.75
    batch([0.9+(i%3)*0.5,0.025,0.085],[x,-0.23,z],0x99ded0,[0,-0.3,0])
  }
  // Map edges include soil tufts and abstract mangrove canopies.
  for(let i=0;i<19;i++) {
    const z=-18+i*2.0
    const x=-11.4+Math.sin(i*1.9)*0.7
    batch([0.5,0.26,0.7],[x,0.16,z],i%2?0x769f73:0x91b37f,[0,i,0])
  }

  for(const {color,kind,matrices} of batches.values()) {
    const instanced=new THREE.InstancedMesh(kind==='cylinder'?cylinder:cube,material(color),matrices.length)
    matrices.forEach((matrix,index)=>instanced.setMatrixAt(index,matrix))
    instanced.castShadow=true
    instanced.receiveShadow=true
    scene.add(instanced)
  }

  // A steady amber beacon at rest; slow breathing and rotation when motion is enabled.
  const beaconMaterial = new THREE.MeshStandardMaterial({color:0xff8d3b,emissive:0xff6425,emissiveIntensity:1.5,roughness:0.3})
  materials.set('beacon',beaconMaterial)
  const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.25,0.36,12),beaconMaterial)
  geometries.add(beacon.geometry)
  beacon.position.set(7.35,3.6,-0.6)
  scene.add(beacon)
  const alarmLight=new THREE.PointLight(0xff7733,7,8,2)
  alarmLight.position.copy(beacon.position)
  scene.add(alarmLight)

  const markerData=[
    {id:'quilivreou',position:new THREE.Vector3(4.3,5.15,-3.2)},
    {id:'shootareas',position:new THREE.Vector3(3.7,4.8,14.2)},
    {id:'zikak',position:new THREE.Vector3(-8.1,3.9,3.2)},
    {id:'la-jaille',position:new THREE.Vector3(-2.1,5.6,-12.8)},
  ]
  const targets={quilivreou:new THREE.Vector3(3.5,1,-2),shootareas:new THREE.Vector3(3.7,0.5,14.2),zikak:new THREE.Vector3(-8.1,0.5,3.2),'la-jaille':new THREE.Vector3(-2.1,0.5,-12.8)}
  const pickables=[]
  for(const [id,size,pos] of [['quilivreou',[8,5,9],[4.3,2.5,-4]],['shootareas',[6,4,5],[3.7,2,14.2]],['zikak',[5,3.4,4],[-8.1,1.7,3.2]]]) {
    const hit=mesh(cube,palette.paper,pos,scene,{transparent:true,opacity:0,depthWrite:false})
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
  let gestureHadMultiplePointers=false
  const pointers=new Set()
  const projection=new THREE.Vector3()
  const raycaster=new THREE.Raycaster()
  const pointer=new THREE.Vector2()
  let previousLabels=[]

  function publishLabels() {
    const labels=markerData.map(({id,position})=>{
      projection.copy(position).project(camera)
      return {id,x:(projection.x+1)*width/2,y:(1-projection.y)*height/2,visible:Math.abs(projection.x)<1.08&&Math.abs(projection.y)<1.08&&projection.z<1}
    })
    if(labels.some((label,index)=>!previousLabels[index]||Math.abs(label.x-previousLabels[index].x)>0.2||Math.abs(label.y-previousLabels[index].y)>0.2||label.visible!==previousLabels[index].visible)) {
      previousLabels=labels
      onLabels(labels)
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
    const progress=(elapsed*0.038)%1
    traffic.position.set(-3.05,0.15,-7.1+progress*24.0)
    traffic.rotation.y=0
    traffic2.position.set(-1.14,0.15,17.2-((elapsed*0.027+0.39)%1)*24.3)
    traffic2.rotation.y=Math.PI
    boat.position.y=-0.04+Math.sin(elapsed*1.2)*0.07
    boat.rotation.z=Math.sin(elapsed*0.9)*0.016
    craneHook.position.x=13.0+Math.sin(elapsed*0.19)*1.25
    beaconMaterial.emissiveIntensity=repaired?0.35:1.15+(Math.sin(elapsed*1.5)+1)*0.45
    alarmLight.intensity=repaired?0:5.5+(Math.sin(elapsed*1.5)+1)*2
    if(repaired) {
      const travel=(Math.sin(elapsed*0.23)+1)*0.5
      delivery.position.set(2.6,0.17,1.3+travel*5)
      delivery.rotation.y=Math.cos(elapsed*0.23)>0?0:Math.PI
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
    controls.target.x=THREE.MathUtils.clamp(controls.target.x,-15,15)
    controls.target.y=THREE.MathUtils.clamp(controls.target.y,-8,12)
    controls.target.z=THREE.MathUtils.clamp(controls.target.z,-20,23)
    camera.position.add(controls.target.clone().sub(old))
    requestRender()
  }
  controls.addEventListener('change',constrainPan)
  controls.addEventListener('start',settleTween)
  function resize() {
    const rect=container.getBoundingClientRect()
    width=Math.max(rect.width,1)
    height=Math.max(rect.height,1)
    const aspect=width/height
    const viewWidth=Math.max(35,42*aspect)
    camera.left=-viewWidth/2
    camera.right=viewWidth/2
    camera.top=viewWidth/aspect/2
    camera.bottom=-viewWidth/aspect/2
    camera.updateProjectionMatrix()
    renderer.setSize(width,height)
    requestRender()
  }
  const observer=new ResizeObserver(resize)
  observer.observe(container)
  function onPointerDown(event) {
    if(!active) return
    pointers.add(event.pointerId)
    if(pointers.size===1) {down={x:event.clientX,y:event.clientY};gestureHadMultiplePointers=false}
    else gestureHadMultiplePointers=true
  }
  function onPointerUp(event) {
    pointers.delete(event.pointerId)
    if(!active) {down=null;return}
    if(!down||gestureHadMultiplePointers||Math.hypot(event.clientX-down.x,event.clientY-down.y)>7) {if(!pointers.size)down=null;return}
    down=null
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
    const distance=2.5/camera.zoom
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0)
    const up=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1)
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
    if(reducedMotion) finishTween()
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
  renderer.domElement.addEventListener('pointerdown',onPointerDown)
  renderer.domElement.addEventListener('pointerup',onPointerUp)
  renderer.domElement.addEventListener('pointercancel',onPointerCancel)
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
    focusProject(id) {return targets[id]?moveTo(targets[id],2.0):Promise.resolve()},
    resetView() {return moveTo(initialTarget,1)},
    zoomBy,
    getView() {return {target:controls.target.toArray(),zoom:camera.zoom}},
    getDebug() {return {active,requestedActive,contextIsLost,paused,reducedMotion,repaired,disposed,renderCount,view:{target:controls.target.toArray(),zoom:camera.zoom},frameScheduled:!!frameId,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}},
    setView(view) {if(view?.target?.length===3) return moveTo(new THREE.Vector3(...view.target),THREE.MathUtils.clamp(view.zoom||1,controls.minZoom,controls.maxZoom));return Promise.resolve()},
    setPaused(value) {paused=value;lastTime=0;requestRender()},
    setActive,
    setRepaired(value) {
      repaired=value
      beaconMaterial.color.set(value?0xb9da72:0xff8d3b)
      beaconMaterial.emissive.set(value?0x6d9c38:0xff6425)
      beaconMaterial.emissiveIntensity=value?0.35:1.5
      alarmLight.intensity=value?0:7
      if(!value) {delivery.position.set(3.2,0.17,4.0);delivery.rotation.y=Math.PI}
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
      renderer.domElement.removeEventListener('pointerdown',onPointerDown)
      renderer.domElement.removeEventListener('pointerup',onPointerUp)
      renderer.domElement.removeEventListener('pointercancel',onPointerCancel)
      renderer.domElement.removeEventListener('webglcontextlost',contextLost)
      renderer.domElement.removeEventListener('webglcontextrestored',contextRestored)
      container.removeEventListener('keydown',onKeyDown)
      document.removeEventListener('visibilitychange',visibilityChange)
      motionQuery.removeEventListener('change',motionChange)
      scene.traverse(object=>{if(object.isInstancedMesh) object.dispose()})
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
