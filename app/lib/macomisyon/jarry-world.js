import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/** A fictional floating world whose coast and road hierarchy follow Marvin’s aerial references. */
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

  const camera = new THREE.OrthographicCamera(-55, 55, 55, -55, 0.1, 350)
  const initialTarget = new THREE.Vector3(0, 0, -1)
  const viewOffset = new THREE.Vector3(34, 78, 105)
  camera.position.copy(initialTarget).add(viewOffset)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(initialTarget)
  controls.enableRotate = false
  controls.enableDamping = false
  controls.screenSpacePanning = true
  controls.minZoom = 0.75
  controls.maxZoom = 5.2
  controls.zoomSpeed = 0.85
  controls.panSpeed = 0.8
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
  controls.touches.ONE = THREE.TOUCH.PAN
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
  controls.update()

  scene.add(new THREE.HemisphereLight(0xfbf3d9, 0x779f99, 2.3))
  const sun = new THREE.DirectionalLight(0xfff3d6, 3.6)
  sun.position.set(-35, 65, 35)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -65
  sun.shadow.camera.right = 65
  sun.shadow.camera.top = 65
  sun.shadow.camera.bottom = -65
  sun.shadow.camera.far = 180
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
  // Reference coordinates: x runs west to east, z runs north to south.
  // The northern junction is enlarged slightly to remain readable as a game landmark.
  // The long southern shoreline and eastern port, rather than a square grid, define the world.
  const coastline = [
    [-43,-30],[-32,-34],[-19,-33],[-7,-34],[8,-32],[21,-31],[26,-26],
    [25,-20],[27,-16],[26,-12],[29,-9],[27,-5],[30,-1],[31,4],
    [36,7],[39,12],[40,19],[43,25],[39,28],[35,26],[31,27],[27,24],
    [24,20],[22,14],[19,11],[19,8],[17,7],[15,8],[14,10],[12,10],
    [10,8],[8,7],[7,5],[4,6],[2,6],[0,8],[-3,8],[-6,6],[-9,8],
    [-13,8],[-17,7],[-21,6],[-25,4],[-28,6],[-30,10],[-33,14],
    [-37,16],[-41,12],[-44,5],[-43,-5],[-45,-14],
  ]
  const seaEdge = [[-48,-35],[-27,-39],[1,-38],[24,-36],[34,-25],[35,-8],[43,4],[49,22],[45,33],[30,37],[12,34],[-9,33],[-33,27],[-48,15],[-51,-6]]
  extrude(seaEdge, -3.4, 1.5, 0x2e807b)
  extrude(seaEdge, -1.9, 1.3, palette.sea)
  extrude(coastline, -3.3, 1.0, palette.clay, 0.987)
  extrude(coastline, -2.3, 1.6, palette.sand, 0.996)
  extrude(coastline, -0.7, 0.7, palette.ground)

  // A shallow turquoise shelf makes the scalloped bays and mangrove fingers legible.
  const shallows = coastline.slice(12, 45).map(([x,z])=>[x,z+0.7])
  extrude([...shallows,[ -37,19],[-24,10],[-15,11],[-2,11],[7,10],[15,13],[18,15],[20,23],[29,29],[40,31],[46,27]],-0.62,0.035,0x7bcabc)

  const canopy = new THREE.DodecahedronGeometry(1,0)
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

  function insidePolygon(x,z,polygon) {
    let inside=false
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
      const [xi,zi]=polygon[i]
      const [xj,zj]=polygon[j]
      if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi)) inside=!inside
    }
    return inside
  }
  function seeded(index) {const v=Math.sin(index*127.1+41.7)*43758.5453;return v-Math.floor(v)}
  const vegetationClearances=[]
  function ribbon(points,width,color=palette.road,y=0.045,{smooth=true,median=false,dashes=false,clearVegetation=false}={}) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x,z,py])=>new THREE.Vector3(x,py??y,z)),false,'centripetal')
    const samples=smooth?curve.getPoints(Math.max(20,points.length*12)):points.map(([x,z,py])=>new THREE.Vector3(x,py??y,z))
    if(clearVegetation) vegetationClearances.push({samples,halfWidth:width/2})
    const positions=[],indices=[]
    for(let i=0;i<samples.length;i++) {
      const prev=samples[Math.max(0,i-1)],next=samples[Math.min(samples.length-1,i+1)]
      const tangent=next.clone().sub(prev).normalize()
      const normal=new THREE.Vector3(-tangent.z,0,tangent.x).multiplyScalar(width/2)
      positions.push(samples[i].x+normal.x,samples[i].y,samples[i].z+normal.z,samples[i].x-normal.x,samples[i].y,samples[i].z-normal.z)
      if(i<samples.length-1) {const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3)}
    }
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    const surface=mesh(geometry,color)
    surface.castShadow=false
    if(median||dashes) {
      const length=curve.getLength()
      for(let d=1;d<length;d+=median?0.7:2.8) {
        const t=d/length,p=curve.getPointAt(t),tangent=curve.getTangentAt(t)
        const rotation=Math.atan2(tangent.x,tangent.z)
        batch([median?0.23:0.07,median?0.07:0.015,median?0.71:0.8],[p.x,p.y+(median?0.04:0.013),p.z],median?palette.pavement:palette.paper,[0,rotation,0])
      }
    }
    return curve
  }
  // Continuous east-west industrial boulevard, with service loops on the southern side.
  const boulevard=[[-42,-2],[-35,-1],[-28,0.5],[-21,1],[-15,0],[-10,-2],[0,-3.8],[11,-6],[23,-6]]
  const boulevardCurve=ribbon(boulevard,2.0,palette.road,0.08,{dashes:true})
  ribbon([[-15,0],[-10,4],[-2,4.7],[9,3.8],[20,3.5],[26,8],[31,16],[37,23]],1.45,palette.road,0.085,{dashes:true})
  ribbon([[23,-26],[23,-16],[23,-6],[24,2],[26,8],[34,11],[39,17]],1.9,palette.road,0.09,{dashes:true})
  ribbon([[18,-5.5],[17,-0.5],[19,3.5]],1.1)
  ribbon([[9,-5.5],[9,-0.5],[9,3.8]],1.1)
  ribbon([[-1,-3.7],[0,0.5],[0,4.5]],1.1)
  ribbon([[-9,-2.5],[-7,0.5],[-5,4.5]],1.1)
  ribbon([[-28,0.5],[-29,5],[-34,10]],1.35)
  ribbon([[-38,-0.6],[-37,6],[-39,11]],1.2)
  ribbon([[26,8],[31,7.5],[35,8.5]],1.1)
  ribbon([[28.5,13],[34,13],[38,15]],1.1)
  ribbon([[31,16],[37,17],[39,20]],1.1)
  ribbon([[33,20],[37,19],[40,21]],1.1)

  // Freeway underpass: the north-south bridge crosses above the divided east-west road.
  ribbon([[-44,-15],[-35,-16.5],[-25,-18],[-18,-18.5],[-5,-20],[9,-21],[25,-22]],3.8,palette.road,0.075,{median:true})
  for(const offset of [-0.92,0.92]) ribbon([[-44,-15+offset],[-35,-16.5+offset],[-25,-18+offset],[-18,-18.5+offset],[-5,-20+offset],[9,-21+offset],[25,-22+offset]],0.035,palette.paper,0.09)
  // The northern roundabout sits above the industrial belt, not in its centre.
  const junction={x:-18,z:-26,radius:3.3}
  ribbon([[-18,-34],[-18,-30],[-18,-27]],1.9)
  ribbon([[-38,-25],[-28,-26],[-22,-26],[-18,-26],[ -12,-25.8],[-7,-24]],1.7)
  ribbon([[-18,-24,0.08],[-18,-22,0.65],[-18,-20.5,1.45],[-18,-16.5,1.45],[-18,-13,0.7],[-17,-8,0.08],[-16,-4,0.08],[-15,0,0.08]],2.25,palette.road,0.08,{dashes:true})
  // Bridge parapets and piers expose the grade separation from the isometric viewpoint.
  for(const x of [-19.24,-16.76]) {
    batch([0.17,0.31,5.5],[x,1.53,-18.7],palette.paper)
    for(const z of [-20.7,-16.7]) batch([0.3,1.35,0.45],[x,0.7,z],palette.pavement)
  }
  // Sweeping loop ramps east of the bridge, and the long western slip road.
  ribbon([[-16.8,-20.5,1.36],[-13.2,-19.7,0.6],[-10.5,-17.5,0.08],[-11.2,-14,0.08],[-14,-13.6,0.08],[-16.8,-16,1.2]],1.0,palette.asphalt,0.045,{clearVegetation:true})
  ribbon([[-15.5,-26,0.08],[-11.8,-24.8,0.08],[-10,-22.8,0.08],[-13,-21.7,0.08],[-18,-22,0.65]],1.05,palette.asphalt,0.045,{clearVegetation:true})
  ribbon([[-30,-17.4],[-26,-18.5],[-22,-20.6],[-20.6,-23]],1.05,palette.asphalt,0.045,{clearVegetation:true})
  ribbon([[-17,-8],[-12,-12],[-7,-17],[-3,-20]],1.05,palette.asphalt,0.045,{clearVegetation:true})
  const ring=mesh(new THREE.CylinderGeometry(junction.radius,junction.radius,0.13,64),palette.road,[junction.x,0.12,junction.z])
  ring.receiveShadow=true
  mesh(new THREE.CylinderGeometry(1.75,1.75,0.16,48),palette.pavement,[junction.x,0.22,junction.z])
  mesh(new THREE.CylinderGeometry(1.55,1.55,0.17,48),palette.sand,[junction.x,0.3,junction.z])
  for(let i=0;i<25;i++) {
    const a=i/25*Math.PI*2
    batch([0.4,0.018,0.07],[junction.x+Math.cos(a)*2.53,0.197,junction.z+Math.sin(a)*2.53],palette.paper,[0,-a,0])
  }
  // Construction walls along the 7 o'clock radius in the supplied aerial image.
  // This closes the southwest arc physically; no invented signage or traffic route through it.
  for(let i=0;i<4;i++) {
    const distance=1.68+i*0.57
    const x=junction.x-distance*0.5,z=junction.z+distance*0.866
    batch([0.36,0.57,0.6],[x,0.43,z],i%2?palette.paper:palette.coral,[0,-Math.PI/6,0])
    batch([0.49,0.1,0.68],[x,0.18,z],palette.pavement,[0,-Math.PI/6,0])
  }
  // The green cycle/footpath follows the north-south corridor beside the mangrove.
  ribbon([[-21,-13],[-21,-9],[-20,-6],[-18.5,-2]],0.62,0x79a76d,0.1,{clearVegetation:true})
  for(let i=0;i<7;i++) batch([0.12,0.025,0.38],[-20.95+i*0.35,0.13,-12+i*1.42],palette.paper)

  function palm(x,z,scale=1,lean=0) {
    batch([0.16*scale,2.8*scale,0.16*scale],[x+lean/2,1.4*scale,z],0x9c8056,[0,0,-lean/6],'cylinder')
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3+x
      batch([0.34*scale,0.12*scale,1.25*scale],[x+lean+Math.sin(a)*0.5*scale,2.8*scale-0.13,z+Math.cos(a)*0.5*scale],i%2?palette.leaf:palette.green,[0.22,a,-0.12])
    }
  }
  // Leave a verge wide enough for each canopy, so trees cannot hide a ramp.
  // Checking the curve segments retains vegetation inside the loop islands.
  function canopyOverlapsRoad(x,z,radius) {
    return vegetationClearances.some(({samples,halfWidth})=>{
      const clearance=halfWidth+radius+0.35
      for(let i=1;i<samples.length;i++) {
        const a=samples[i-1],b=samples[i]
        const dx=b.x-a.x,dz=b.z-a.z,lengthSquared=dx*dx+dz*dz
        const t=lengthSquared?THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/lengthSquared,0,1):0
        if((x-a.x-t*dx)**2+(z-a.z-t*dz)**2<clearance**2) return true
      }
      return false
    })
  }
  function forest(polygon,density,seed=0) {
    extrude(polygon,0.008,0.03,0x528369)
    const minX=Math.min(...polygon.map(p=>p[0])),maxX=Math.max(...polygon.map(p=>p[0]))
    const minZ=Math.min(...polygon.map(p=>p[1])),maxZ=Math.max(...polygon.map(p=>p[1]))
    for(let i=0;i<density;i++) {
      const x=minX+seeded(i*3+seed)*(maxX-minX),z=minZ+seeded(i*3+seed+1)*(maxZ-minZ)
      if(!insidePolygon(x,z,polygon)) continue
      const scale=0.52+seeded(i*3+seed+2)*0.52
      if(canopyOverlapsRoad(x,z,scale*1.3)) continue
      batch([scale*1.3,scale,scale*1.15],[x,scale*0.69,z],[0x427961,0x54886a,0x67956d,0x385f52][i%4],[0,i,0],'canopy')
    }
  }
  // Dense northern wetland and the small fingers that edge the south-facing bay.
  forest([[-13,-32],[5,-31],[21,-29],[22,-23],[-6,-22],[-13,-23]],310,11)
  forest([[-15,-17],[-6,-18],[11,-19],[20,-18],[21,-12],[11,-10],[7,-8],[-6,-6],[-13,-5]],460,700)
  forest([[-30,-15],[-24,-16],[-21,-14],[-20,-7],[-18,-4],[-26,-2],[-32,-3]],200,310)
  forest([[-25,3],[-21,4.5],[-16,5.4],[-12,5.7],[-8,5.4],[-7,7.3],[-13,7.6],[-20,5.8]],135,1200)
  forest([[-6,5.5],[-1,5.5],[1,7],[-2.5,7.7]],60,1450)
  forest([[3,5],[6,4.5],[8,6],[12,7.5],[13.6,9.5],[12,9.7],[9,7.8],[6,6]],80,1540)
  forest([[15,6.5],[18,5.7],[19,8.5],[18.5,10.5],[16.5,9]],48,1640)
  forest([[24,18],[25,20],[27,23],[30,24],[29,25],[25,23],[23,19]],65,1840)

  function warehouse(x,z,width,depth,height,roofColor,wallColor=palette.paper,angle=0) {
    const rotate=(dx,dz)=>[x+dx*Math.cos(angle)+dz*Math.sin(angle),z-dx*Math.sin(angle)+dz*Math.cos(angle)]
    const block=(size,dx,y,dz,color,kind='box')=>{const [px,pz]=rotate(dx,dz);batch(size,[px,y,pz],color,[0,angle,0],kind)}
    block([width+0.35,0.1,depth+0.35],0,0.09,0,palette.pavement)
    block([width,height,depth],0,height/2+0.17,0,wallColor)
    const roofH=Math.min(width*0.15,0.52)
    block([width+0.22,roofH,depth+0.25],0,height+0.18,0,roofColor,'roof')
    for(let dx=-width/2+0.24;dx<width/2;dx+=0.55) block([0.035,0.035,depth+0.28],dx,height+0.2+roofH*(1-Math.abs(dx)/(width/2+0.1)),0,roofColor===palette.yellow?0xffe48b:0xb8c7b7)
    const doorW=Math.min(width*0.5,1.7)
    block([doorW,height*0.6,0.07],0,height*0.3+0.18,depth/2+0.035,palette.ink)
    for(let y=0.45;y<height*0.7;y+=0.3) block([doorW-0.06,0.025,0.04],0,y,depth/2+0.08,palette.asphalt)
  }
  const roofColors=[0xa9b8ac,0xe2ddc3,0x71958d,0xccb69b,0xa1b4ad,0xddd8c1]
  // Aerial reading: long low sheds and offset blocks, denser east of the main junction.
  const industrialLots=[
    [-34,-5,3.7,3,1.2,0.08],[-29,-5,3.4,3,1.5,0.08],[-24,-4.4,3.6,2.5,1.35,0.08],
    [-34,-10,4.8,3,1.45,0.02],[-28,-10,4.0,2.8,1.2,0.02],
    [-11,-3.8,3,2.7,1.2,-0.24],[-7,-4.8,3,2.4,1.5,-0.2],[-3.1,-6.1,3.1,3,1.5,-0.16],
    [1.2,-7,3.2,3.2,1.35,-0.15],[5.2,-8,3.1,3.5,1.6,-0.15],
    [11.2,-9,3.2,3.3,1.4,-0.05],[16,-9,4,3,1.5,0],[20,-9,2.4,3,1.4,0],
    [3,0,3.6,3.8,1.6,-0.04],[7,0,1.9,3,1.4,0],
    [12,-0.7,3.6,4,1.4,0],[16,-0.6,2.4,3.5,1.2,0],
    [21,-1.0,2.3,4.0,1.6,0],[26,-0.5,2.8,3.1,1.45,0.2],
    [-10.7,1.9,2.3,2.2,1.05,-0.5],[-8.5,3.2,1.9,2.1,1.2,-0.3],
    [-22,2.8,3.1,1.8,1.3,0.15],[-18,3.3,2.9,1.8,1.2,0.1],
    [-24,-29.5,3.6,3,1.2,0],[-11,-28.5,3,3.3,1.45,0],[-7,-27,3,3.2,1.3,0.1],
    [25,-12,2.1,3.1,1.3,0],[20,-14,2.6,3.4,1.15,0],
    [27,4.3,3.4,2.8,1.4,-0.4],[30,5,2.3,2.5,1.1,-0.4],
    [29.5,10.5,3.0,2.7,1.4,0.35],[35,10.7,3.2,2.3,1.3,0.3],
    [34,15.1,3.5,2.3,1.35,-0.05],[37,22,3,2.7,1.55,-0.3],
  ]
  industrialLots.forEach(([x,z,w,d,h,a],i)=>warehouse(x,z,w,d,h,roofColors[i%roofColors.length],i%3?palette.paper:0xc6cdbb,a))
  // The western residential edge uses smaller roofs, yards and narrow streets.
  for(let row=0;row<5;row++) for(let col=0;col<4;col++) {
    const x=-40+col*2.6+(row%2)*0.6,z=-12+row*2.2
    if(z>-3.5) continue
    warehouse(x,z,1.6,1.3,0.8,[0xcf7c5b,0xd9b684,0x91a296][(row+col)%3],0xe3d7bc,0.09)
  }
  for(let i=0;i<9;i++) {
    const x=-39+(i%3)*2.9,z=3+Math.floor(i/3)*2.8
    warehouse(x,z,1.9,1.4,0.95,i%3?0xbf8568:palette.paper,0xdfccb0,-0.2)
  }
  // Service yards, parked cars and loading lines carry industrial scale.
  for(const [x,z] of [[-32,-7.4],[-27,-7.4],[2,2.9],[11,2.5],[19,1.7],[29,8.6]]) {
    for(let i=0;i<4;i++) {
      batch([0.62,0.3,1.25],[x+i*0.82,0.23,z],i%2?palette.paper:palette.teal)
      batch([0.45,0.18,0.55],[x+i*0.82,0.46,z-0.08],palette.ink)
      batch([0.035,0.02,1.8],[x+i*0.82-0.41,0.12,z],palette.paper)
    }
  }
  for(const [x,z] of [[-31,-23],[-28,-23],[-25,-23],[-39,0],[-33,2.3],[-21,-1.5],[-12,5],[-3,6],[6,5],[15,5],[22,6],[29,20],[37,24],[-20,-31]]) palm(x,z,0.66+seeded(x+z)*0.28,0.12)

  // The warm warehouse is a physical clue. Its parcel pictogram contains no project name.
  const depot={x:-3.9,z:0.8}
  warehouse(depot.x,depot.z,5.8,4.8,2.25,palette.yellow)
  batch([6.6,0.06,1.8],[depot.x,0.13,3.9],0xc0c3a6)
  for(let x=-6.5;x<-1;x+=1.15) batch([0.045,0.025,1.3],[x,0.18,3.8],palette.paper)
  // A little taped parcel sits on the roof like a toy-model landmark.
  batch([1.2,0.95,1.1],[depot.x,3.29,depot.z],0xd4a25f,[0,0.12,0])
  batch([0.18,0.018,1.15],[depot.x,3.78,depot.z],palette.paper,[0,0.12,0])
  batch([1.21,0.018,0.17],[depot.x,3.79,depot.z],palette.paper,[0,0.12,0])
  for(let i=0;i<8;i++) {
    const x=-6.3+(i%2)*0.5,z=3.5+Math.floor(i/4)*0.53,y=0.42+(Math.floor(i/2)%2)*0.48
    batch([0.45,0.46,0.46],[x,y,z],i%3?0xc99458:0xe2b875)
    batch([0.1,0.018,0.47],[x,y+0.24,z],0xf4dc9d)
  }
  // A seaside pavilion hints at image-making, with no name or giant brand initial.
  const studio={x:12.5,z:5.1}
  batch([5.1,0.17,3.5],[studio.x,0.14,studio.z],palette.pavement)
  batch([3.8,1.55,2.55],[studio.x,0.98,studio.z],0xf0d8bd)
  batch([4.15,0.2,2.9],[studio.x,1.88,studio.z],0xe89277)
  batch([2.65,1.18,0.08],[studio.x,0.99,studio.z+1.32],0x577473)
  batch([0.08,1.2,0.15],[studio.x,1.0,studio.z+1.37],palette.paper)
  batch([0.85,0.61,0.62],[studio.x,2.31,studio.z],palette.ink)
  const lens=mesh(new THREE.CylinderGeometry(0.29,0.29,0.4,16),0x95bfc1,[studio.x,2.32,studio.z+0.49])
  lens.rotation.x=Math.PI/2
  for(let i=0;i<3;i++) {
    batch([0.55,0.08,1.1],[15+i*0.72,0.24,5.4],palette.paper)
    batch([0.45,0.05,0.45],[15+i*0.72,0.4,5.05],palette.coral,[-0.5,0,0])
  }
  const workshop={x:-32,z:2.6}
  warehouse(workshop.x,workshop.z,3.4,2.7,1.5,palette.grey,0xa9b9ad,0.1)
  batch([3.4,0.14,0.16],[workshop.x,0.65,workshop.z+1.6],palette.ink)
  for(let i=0;i<5;i++) batch([0.24,0.28,0.2],[workshop.x-1.4+i*0.65,0.65,workshop.z+1.62],palette.yellow,[0,0,0.4])
  const disk=mesh(new THREE.CylinderGeometry(0.52,0.52,0.15,12),0xb3bdad,[workshop.x,2.52,workshop.z])
  disk.rotation.x=Math.PI/2

  // Eastern commercial port: elongated quays, tank farm, container stacks and two cranes.
  extrude([[29,7],[36,8],[39,13],[40,19],[42,24],[38.7,26.5],[35,24.5],[33,21],[30,16]],0.04,0.11,0xbfc5b0)
  function containerBox(x,y,z,color,angle=0) {
    batch([1.05,0.76,2.65],[x,y,z],color,[0,angle,0])
    batch([1.09,0.055,2.69],[x,y+0.405,z],color,[0,angle,0])
    for(let i=-1.1;i<1.3;i+=0.32) {
      const px=x+Math.sin(angle)*i,pz=z+Math.cos(angle)*i
      batch([1.08,0.68,0.035],[px,y,pz],color,[0,angle,0])
    }
  }
  for(let row=0;row<3;row++) for(let col=0;col<5;col++) {
    const x=32.1+col*1.25,z=17.8+row*2.85
    containerBox(x,0.58,z,[palette.coral,0x65a3a1,0xe8c068,0x668983][(row+col)%4],-0.08)
    if((row+col)%3===0) containerBox(x,1.4,z,0xa9bbac,-0.08)
  }
  for(const [x,z,r] of [[26,14,0.95],[28.3,15,1.05],[27.2,17,0.75],[29.5,18.5,0.75]]) {
    batch([r,1.2,r],[x,0.8,z],palette.paper,[0,0,0],'cylinder')
    batch([r*1.03,0.09,r*1.03],[x,1.44,z],palette.grey,[0,0,0],'cylinder')
  }
  for(const [x,z] of [[38.5,13],[41.2,22]]) {
    for(const dx of [-1.05,1.05]) {
      batch([0.2,4.2,0.2],[x+dx,2.25,z-1.2],palette.yellow)
      batch([0.2,4.2,0.2],[x+dx,2.25,z+1.2],palette.yellow)
      batch([0.3,0.26,3.1],[x+dx,4.37,z],palette.yellow)
    }
    batch([5.3,0.32,0.47],[x+1.35,4.59,z],palette.yellow)
  }
  const craneHook=new THREE.Group()
  craneHook.position.set(40.5,3.4,13)
  box([0.045,1.7,0.045],[0,0,0],palette.ink,craneHook)
  box([0.28,0.23,0.2],[0,-0.95,0],palette.ink,craneHook)
  scene.add(craneHook)
  const boat=new THREE.Group()
  boat.position.set(43.6,-0.43,13.6)
  box([1.8,0.66,6.9],[0,0.24,0],palette.ink,boat)
  box([1.82,0.23,6.8],[0,0.6,0],palette.paper,boat)
  box([1.5,0.12,6.3],[0,0.75,0],palette.sand,boat)
  box([1.2,0.8,1.15],[0,1.1,2.1],palette.paper,boat)
  box([1.25,0.26,0.25],[0,1.25,1.45],palette.ink,boat)
  for(let i=0;i<3;i++) box([1.32,0.6,1.1],[0,1.07,-2.2+i*1.2],i%2?palette.teal:palette.coral,boat)
  scene.add(boat)
  // Low mangrove islets in the lagoon echo the scattered southern coastline.
  for(const [x,z,s] of [[20,20,1.2],[18,26,0.85],[23,29,1.1],[15,19,0.65],[28,30,0.75]]) {
    mesh(new THREE.CylinderGeometry(s*1.4,s*1.3,0.25,7),palette.ground,[x,-0.41,z])
    batch([s,s*0.75,s*1.1],[x,0.05,z],0x54886a,[0,x,0],'canopy')
  }
  // Surface strokes stay away from the land. They suggest water rather than a map legend.
  for(let i=0;i<52;i++) {
    const x=-36+seeded(i+7000)*79,z=9+seeded(i+8000)*23
    if(insidePolygon(x,z,coastline)) continue
    batch([0.8+seeded(i+9000)*1.5,0.02,0.075],[x,-0.57,z],0x98dcd0,[0,-0.1,0])
  }
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
  delivery.position.set(-2.4,0.12,3.8)
  delivery.rotation.y=Math.PI/2
  const traffic=truck(palette.coral,0.36)
  const traffic2=truck(0x7ba8a4,0.31)
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
  beacon.position.set(-1.45,2.7,2.7)
  scene.add(beacon)
  const alarmLight=new THREE.PointLight(0xff7733,7,7,2)
  alarmLight.position.copy(beacon.position)
  scene.add(alarmLight)

  const markerData=[
    {id:'quilivreou',position:new THREE.Vector3(depot.x,4.0,depot.z)},
    {id:'shootareas',position:new THREE.Vector3(studio.x,3.3,studio.z)},
    {id:'zikak',position:new THREE.Vector3(workshop.x,3.1,workshop.z)},
  ]
  const targets={quilivreou:new THREE.Vector3(depot.x,0.6,depot.z),shootareas:new THREE.Vector3(studio.x,0.5,studio.z),zikak:new THREE.Vector3(workshop.x,0.5,workshop.z)}
  const pickables=[]
  for(const [id,size,pos] of [['quilivreou',[7,4.5,6],[depot.x,2,depot.z]],['shootareas',[5,3.5,4.5],[studio.x,1.5,studio.z]],['zikak',[4.5,3.3,4],[workshop.x,1.5,workshop.z]]]) {
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
    for(const [vehicle,t,reverse] of [[traffic,(elapsed*0.016)%1,false],[traffic2,(elapsed*0.013+0.4)%1,true]]) {
      const progress=reverse?1-t:t
      const point=boulevardCurve.getPointAt(progress),tangent=boulevardCurve.getTangentAt(progress)
      const direction=reverse?-1:1
      vehicle.position.set(point.x-tangent.z*0.43*direction,0.12,point.z+tangent.x*0.43*direction)
      vehicle.rotation.y=Math.atan2(tangent.x,tangent.z)+(reverse?Math.PI:0)
    }
    boat.position.y=-0.43+Math.sin(elapsed*1.2)*0.045
    boat.rotation.z=Math.sin(elapsed*0.9)*0.012
    craneHook.position.x=40.5+Math.sin(elapsed*0.19)*0.7
    beaconMaterial.emissiveIntensity=repaired?0.35:1.15+(Math.sin(elapsed*1.5)+1)*0.45
    alarmLight.intensity=repaired?0:5.5+(Math.sin(elapsed*1.5)+1)*2
    if(repaired) {
      const travel=(Math.sin(elapsed*0.23)+1)*0.5
      delivery.position.set(-5.7+travel*4.3,0.12,3.8)
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
    controls.target.x=THREE.MathUtils.clamp(controls.target.x,-44,45)
    controls.target.y=THREE.MathUtils.clamp(controls.target.y,-8,12)
    controls.target.z=THREE.MathUtils.clamp(controls.target.z,-33,32)
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
    const viewWidth=Math.max(104,78*aspect)
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
    focusProject(id) {return targets[id]?moveTo(targets[id],3.6):Promise.resolve()},
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
      if(!value) {delivery.position.set(-2.4,0.12,3.8);delivery.rotation.y=Math.PI/2}
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
