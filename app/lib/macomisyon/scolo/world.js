import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const stations = [
  { id: 'sandale', x: -2.85, y: 1.35, z: 1.15 },
  { id: 'coutelas', x: 1.15, y: 2.35, z: -1.6 },
  { id: 'digrain', x: 3.5, y: 1.45, z: 1.95 },
]
const cream = 0xffebc5, wood = 0xa47551, teak = 0x784e3e, teal = 0x44877e
const dark = 0x354c49, coral = 0xb55541, yellow = 0xebba54, white = 0xfff1db

// Each batch is an independently packed room, furniture load or piece of scenery.
// The vertex colours let an entire batch render with a single draw call.
function furnish(scene, shared) {
  const cube = new THREE.BoxGeometry(1, 1, 1)
  const round = new THREE.CylinderGeometry(.5, .5, 1, 12).toNonIndexed()
  const leaf = new THREE.SphereGeometry(.5, 9, 6).toNonIndexed()
  const block = cube.toNonIndexed()
  const transform = new THREE.Object3D()
  const batches = {}
  let parts = []
  function shape(source, size, position, color, rotation = [0, 0, 0]) {
    transform.position.set(...position)
    transform.scale.set(...size)
    transform.rotation.set(...rotation)
    transform.updateMatrix()
    const geometry = source.clone().applyMatrix4(transform.matrix)
    const count = geometry.attributes.position.count
    const tint = new THREE.Color(color)
    const colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    for (let i = 0; i < count; i++) colors.setXYZ(i, tint.r, tint.g, tint.b)
    geometry.setAttribute('color', colors)
    parts.push(geometry)
  }
  function box(size, position, color, rotation) { shape(block, size, position, color, rotation) }
  function cylinder(size, position, color, rotation) { shape(round, size, position, color, rotation) }
  function oval(size, position, color, rotation) { shape(leaf, size, position, color, rotation) }
  // `station` marks the batches a visitor can tap to open that weapon's Komisyon.
  function finish(name, station = null) {
    const mesh = new THREE.Mesh(mergeGeometries(parts), shared)
    mesh.name = name
    mesh.userData.station = station
    mesh.castShadow = mesh.receiveShadow = true
    scene.add(mesh)
    parts.forEach(part => part.dispose())
    parts = []
    batches[name] = mesh
  }
  function carton(x, base, z, width, height, depth, tint = 0xc48a51) {
    box([width, height, depth], [x, base + height / 2, z], tint)
    box([width * .18, .018, depth], [x, base + height + .009, z], cream)
    box([width * .18, height * .36, .015], [x, base + height * .82, z + depth / 2], cream)
    box([width * .25, height * .18, .018], [x - width * .23, base + height * .37, z + depth / 2], white)
  }
  function scolo(x, z, yaw, scale = 1, floor = .07) {
    const cos = Math.cos(yaw), sin = Math.sin(yaw)
    for (let i = 0; i < 7; i++) {
      const dx = (i - 3) * .115 * scale, dz = .024 * (i - 3) ** 2 * scale
      const px = x + dx * cos + dz * sin, pz = z - dx * sin + dz * cos
      const heading = yaw - Math.atan(.42 * (i - 3))
      box([.035 * scale, .035, .29 * scale], [px, floor + .01, pz], 0xb76035, [0, heading, 0])
      oval([.19 * scale, .09, .13 * scale], [px, floor + .021, pz], i === 6 ? 0xb15332 : 0x643e37, [0, heading, 0])
    }
  }
  function shutterWindow(x) {
    box([1.78, 1.36, .12], [x, 1.75, -2.81], cream)
    box([1.54, 1.14, .13], [x, 1.76, -2.73], 0x96c9bd)
    box([1.55, .36, .13], [x, 1.38, -2.71], 0x639d88)
    box([.07, 1.18, .11], [x, 1.76, -2.61], cream)
    box([1.6, .06, .11], [x, 1.78, -2.61], cream)
    for (const side of [-1, 1]) {
      const sx = x + side * 1.12
      box([.45, 1.36, .15], [sx, 1.75, -2.83], dark)
      for (let i = 0; i < 6; i++) box([.40, .12, .09], [sx, 1.24 + i * .2, -2.71], teal, [.22, 0, 0])
    }
    box([1.98, .1, .36], [x, 1.04, -2.70], white)
  }
  function plant(x, y, z, size) {
    cylinder([size * .55, size * .52, size * .55], [x, y + size * .26, z], coral)
    cylinder([size * .65, size * .12, size * .65], [x, y + size * .53, z], 0xc77958)
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3
      oval([size * .28, size * .72, size * .24],
        [x + Math.sin(angle) * size * .21, y + size * .78, z + Math.cos(angle) * size * .21],
        i % 2 ? 0x426f51 : 0x6e945e, [.55 * Math.cos(angle), 0, -.55 * Math.sin(angle)])
    }
  }

  // Low garden plinth and a sand-coloured lane in front of the open veranda.
  box([12.1, .54, 9], [.26, -.45, .46], 0xc6a67d)
  box([12.12, .1, 9.02], [.26, -.15, .46], 0xb0b68a)
  box([11.8, .04, 2.05], [.28, -.072, 3.68], 0xcdbb9d)
  box([10.12, .19, 6.13], [-.25, -.046, -.31], cream)
  box([9.95, .06, 5.96], [-.25, .02, -.32], 0xb09b85)
  for (let ix = 0; ix < 12; ix++) for (let iz = 0; iz < 7; iz++) {
    const x = -4.81 + ix * .823, z = -2.80 + iz * .817
    const gallery = iz >= 5
    const palette = gallery ? [0xca9179, 0xcb9072] : ix < 6 ? [0xffe7b9, 0xf0ce9d] : [0xc4d6c7, 0xe8e4c8]
    box([.804, .025, .798], [x, .057, z], palette[(ix + iz) % 2])
  }

  // Back wall and left gable are visible from the south-east. Only a strip of roof remains.
  box([10.06, 2.96, .19], [-.25, 1.51, -2.99], 0x87b5a8)
  box([.17, 2.28, 3.42], [-5.16, 1.18, -1.36], 0x78a797)
  for (let i = 0; i < 10; i++) box([10.05, .027, .055], [-.25, .26 + i * .27, -2.867], 0x72a394)
  box([10.05, .16, .18], [-.25, .16, -2.85], white)
  box([.18, .16, 3.39], [-5.05, .16, -1.36], white)
  shutterWindow(-2.80)
  shutterWindow(1.48)
  box([1.04, 2.48, .16], [-.62, 1.28, -2.83], cream)
  box([.85, 2.28, .12], [-.62, 1.22, -2.71], dark)
  box([.66, 1.12, .10], [-.60, 1.47, -2.61], 0x50776a)
  oval([.09, .09, .11], [-.91, 1.10, -2.54], yellow)
  box([10.4, .17, 1.25], [-.25, 3.17, -2.82], coral, [-.21, 0, 0])
  for (let i = 0; i < 30; i++) {
    const x = -5.18 + i * .34
    box([.065, .045, 1.27], [x, 3.26, -2.83], 0xda795f, [-.21, 0, 0])
    box([.17, .20, .095], [x, 3.10, -2.17], cream)
  }
  box([10.38, .15, .13], [-.25, 3.25, -2.18], white)
  for (const x of [-5.0, 4.5]) box([.14, 3.2, .14], [x, 1.65, -2.15], cream)
  // Fixed kitchen fittings. Pots and handles catch the light at phone sizes.
  box([3.25, .91, .81], [2.31, .54, -2.28], 0x5e8b7c)
  box([3.38, .12, .96], [2.31, 1.05, -2.27], cream)
  for (let i = 0; i < 4; i++) {
    const x = 1.11 + i * .80
    box([.72, .77, .05], [x, .56, -1.85], i === 3 ? dark : 0x88aa92)
    box([.24, .05, .06], [x, .80, -1.8], cream)
  }
  box([.93, .035, .63], [1.32, 1.13, -2.28], 0x9fae9c)
  box([.69, .032, .41], [1.32, 1.151, -2.28], 0x4b706a)
  cylinder([.055, .33, .055], [1.32, 1.28, -2.62], dark)
  box([.055, .055, .26], [1.32, 1.44, -2.51], dark)
  cylinder([.28, .35, .28], [3.34, 1.28, -2.26], coral)
  cylinder([.32, .055, .32], [3.34, 1.48, -2.26], dark)
  plant(-4.77, .08, 1.83, .85)
  plant(4.82, -.08, -2.6, 1.1)
  // Short gallery rail and entry steps; the front stays open to the viewer.
  box([1.14, .12, .76], [3.26, -.02, 2.92], 0xe2c3a3)
  box([1.25, .09, .38], [3.26, -.053, 3.36], 0xd0b18f)
  for (const x of [-5.07, -3.75, 4.55]) box([.14, 1.05, .14], [x, .59, 2.47], cream)
  box([1.47, .13, .15], [-4.42, 1.09, 2.47], teal)
  for (const x of [-4.83, -4.56, -4.29, -4.02]) box([.075, .68, .075], [x, .66, 2.47], cream)
  finish('shell')

  // « Trop de scolos », acte I. Each room has its furniture, a « à venir » state where
  // the scolos own it, and a « utilisée » state with the weapon kept as a trophy.
  // The scolos never die: a freed room sends them to the rooms still to come.

  // Salon: rattan seat, always present.
  for (const x of [-4.04, -2.24]) for (const z of [-1.57, -.89]) cylinder([.13, .56, .13], [x, .35, z], teak)
  box([2.32, .24, 1.04], [-3.14, .56, -1.25], wood)
  box([2.42, .84, .20], [-3.14, .98, -1.69], wood)
  box([2.20, .57, .17], [-3.14, .99, -1.56], 0xdfa75e)
  for (const x of [-3.70, -2.57]) box([1.04, .21, .78], [x, .76, -1.19], 0xf1cc7e)
  for (const x of [-4.25, -2.03]) box([.16, .15, .98], [x, .92, -1.24], teak)
  finish('sandale-room', 'sandale')
  // À venir: the scolos sleep on the cushions and cross the floor. No sandal anywhere.
  scolo(-3.62, -1.18, .4, .9, .87)
  scolo(-2.62, -1.25, -.3, .8, .87)
  scolo(-2.04, 1.62, .8)
  scolo(-3.4, 1.06, -.4, .84)
  scolo(-1.71, .25, .35)
  finish('sandale-todo', 'sandale')
  // Utilisée: the flip-flop hangs on the gable wall like a trophy, squash marks below.
  box([.04, 1.18, .74], [-5.04, 1.72, -1.05], dark)
  oval([.10, .99, .56], [-4.99, 1.72, -1.05], coral)
  for (const side of [-1, 1]) box([.10, .48, .095], [-4.93, 1.80, -1.05 + side * .10], cream, [side * .42, 0, 0])
  box([.05, .05, .05], [-5.0, 2.36, -1.05], yellow)
  for (const [x, z, r] of [[-2.3, 1.1, .5], [-3.0, .6, -.3], [-1.9, .3, .9]]) oval([.42, .012, .2], [x, .072, z], 0x6b4a3c, [0, r, 0])
  finish('sandale-done', 'sandale')

  // Cuisine: worktable, always present.
  for (const x of [.15, 1.54]) for (const z of [-.75, .00]) box([.12, .83, .12], [x, .49, z], teak)
  box([1.71, .14, .98], [.84, .94, -.38], wood)
  box([.80, .05, .54], [.85, 1.04, -.38], 0xe1b987)
  finish('coutelas-room', 'coutelas')
  // À venir: the cutlass still in its sleeve with a « bientôt » tag; scolos on the worktop.
  box([.66, .07, .2], [.84, 1.10, -.32], 0xd9b98b, [0, -.28, 0])
  box([.16, .075, .12], [.56, 1.11, -.24], yellow, [0, -.28, 0])
  scolo(2.5, -2.22, 0, .8, 1.11)
  scolo(1.11, .54, -.60)
  scolo(2.21, .65, 1.2, .80)
  finish('coutelas-todo', 'coutelas')
  // Utilisée: the cutlass is planted in the centre of a chalk target on the back wall.
  for (const [radius, color, depth] of [[.62, white, .015], [.47, 0x87b5a8, .02], [.32, white, .025], [.13, coral, .03]]) {
    cylinder([radius * 2, depth, radius * 2], [3.75, 2.05, -2.88 + depth / 2], color, [Math.PI / 2, 0, 0])
  }
  box([.05, .11, .42], [3.75, 2.05, -2.66], 0xb2bcb5, [.12, 0, 0])
  box([.08, .1, .24], [3.75, 2.08, -2.36], dark, [.12, 0, 0])
  oval([.42, .012, .2], [1.2, .072, .5], 0x6b4a3c, [0, .4, 0])
  finish('coutelas-done', 'coutelas')

  // Galerie. À venir: the Digrain can sleeps in a taped carton; scolos stroll the gallery.
  carton(3.74, .075, 1.63, 1.05, .91, .86, 0xc38f58)
  box([.2, .14, .02], [3.5, .62, 2.07], yellow)
  scolo(2.03, 2.13, -.37, .86)
  scolo(3.04, 1.99, .51, .64)
  scolo(1.2, 1.55, 1.9, .8)
  finish('digrain-todo', 'digrain')
  // Utilisée: the can stands out of its box; the cloud is drawn separately, translucent.
  carton(3.74, .075, 1.63, 1.05, .91, .86, 0xc38f58)
  cylinder([.25, .55, .25], [3.59, 1.28, 1.60], yellow)
  cylinder([.26, .12, .26], [3.59, 1.61, 1.60], coral)
  cylinder([.255, .18, .255], [3.59, 1.25, 1.60], white)
  oval([.42, .012, .2], [2.2, .072, 1.9], 0x6b4a3c, [0, -.4, 0])
  finish('digrain-done', 'digrain')

  // Scolos that fled a freed room. They only show in rooms still to come.
  scolo(-4.1, .2, 1.2, .8); scolo(-2.6, -.3, 2.4, .7)
  finish('sandale-more')
  scolo(-2.9, .9, -1.1, .75)
  finish('sandale-more2')
  scolo(.4, .9, .9, .8); scolo(1.9, -1.2, 2.2, .7)
  finish('coutelas-more')
  scolo(.9, -1.5, -.7, .75)
  finish('coutelas-more2')
  scolo(2.6, 1.4, 2.7, .8); scolo(.3, 2.0, .2, .7)
  finish('digrain-more')
  scolo(-.6, 1.6, 1.4, .75)
  finish('digrain-more2')

  // Cartons pile up with each weapon used: first the salon, then the kitchen, then the gallery.
  carton(-3.87, .075, .48, 1.02, .76, .89)
  carton(-3.86, .854, .48, .76, .55, .72, 0xd69a61)
  finish('cartons-1')
  carton(2.49, .075, -.64, .78, .72, .79, 0xbe8351)
  carton(2.56, .815, -.62, .61, .51, .60)
  carton(-2.85, .075, -.02, .68, .5, .58, 0xb67a4c)
  finish('cartons-2')
  carton(-1.2, .075, 1.75, .8, .62, .7, 0xc48a51)
  carton(-.32, .075, 1.85, .72, .7, .66, 0xd69a61)
  carton(-.78, .695, 1.8, .66, .5, .6, 0xb67a4c)
  carton(.55, .075, 1.7, .62, .55, .6)
  finish('cartons-3')

  // Ça suffit: a « À louer » post in the yard, the truck waiting, and more scolos than ever
  // laying siege to the house from the garden.
  box([.09, 1.2, .09], [-3.3, .5, 3.95], teak)
  box([1.15, .62, .06], [-3.3, 1.05, 3.99], white)
  box([1.2, .07, .07], [-3.3, 1.38, 3.99], coral)
  for (const [x, z, yaw] of [[-5.6, 2.4, .3], [-5.5, -.5, 1.7], [5.4, 1.0, -.6], [5.6, -1.8, 2.1], [-2.2, 4.4, .1], [1.8, 4.5, -.9], [3.7, 4.3, .6], [-4.6, 4.5, 2.6], [5.2, 3.6, 1.2], [-1.0, 4.6, 2.2]]) {
    scolo(x, z, yaw, .9, x < -5.1 || x > 5.1 ? -.1 : -.05)
  }
  finish('final')

  // Box truck, cab to the right, loaded and waiting.
  box([3.38, .15, 1.10], [-.62, .35, 3.76], dark)
  box([2.40, .15, 1.30], [-1.11, .51, 3.76], wood)
  for (const x of [-1.92, .56]) for (const z of [3.18, 4.33]) {
    cylinder([.64, .15, .64], [x, .25, z], 0x363c39, [Math.PI / 2, 0, 0])
    cylinder([.31, .17, .31], [x, .25, z], cream, [Math.PI / 2, 0, 0])
  }
  box([1.04, .61, 1.25], [.64, .65, 3.76], teal)
  box([.75, .58, 1.16], [.52, 1.23, 3.76], 0x558083)
  box([.83, .10, 1.25], [.51, 1.55, 3.76], cream)
  for (const z of [3.18, 4.34]) {
    box([.07, .54, .07], [.82, 1.23, z], cream)
    box([.48, .26, .05], [.52, .76, z], 0x579786)
  }
  box([.12, .40, 1.28], [1.20, .57, 3.76], teal)
  for (const z of [3.37, 4.16]) box([.05, .15, .20], [1.28, .66, z], cream)
  box([2.41, .24, .10], [-1.11, .67, 3.12], teal)
  box([2.41, .22, .10], [-1.11, .66, 4.39], teal)
  carton(-1.64, .59, 3.70, .79, .63, .74)
  carton(-.69, .59, 3.76, .75, .77, .75, 0xd69a61)
  finish('truck')
  cube.dispose()
  for (const source of [block, round, leaf]) source.dispose()
  return batches
}

export function createScoloWorld(canvas, { onMarkers, onSelect, onAvailability }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe9dfc8)
  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, .1, 100)
  const home = new THREE.Vector3(.15, .42, .45)
  const offset = new THREE.Vector3(6.2, 10.7, 17.6)
  camera.position.copy(home).add(offset)
  const controls = new OrbitControls(camera, canvas)
  controls.target.copy(home)
  controls.enableRotate = false
  controls.enableDamping = false
  controls.minZoom = .85
  controls.maxZoom = 2.7
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  controls.touches.ONE = THREE.TOUCH.PAN
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
  controls.update()
  const sky = new THREE.HemisphereLight(0xfff6e1, 0xb0a68b, 2.16)
  scene.add(sky)
  const sun = new THREE.DirectionalLight(0xffe6bd, 2.45)
  sun.position.set(-7, 15, 7)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, far: 45 })
  sun.shadow.normalBias = .025
  scene.add(sun)
  const shared = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 })
  const batches = furnish(scene, shared)
  const targets = Object.values(batches).filter(mesh => mesh.userData.station)
  // Digrain leaves a translucent cloud over the gallery once it has been used.
  const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xdfe8c8, roughness: 1, transparent: true, opacity: .42, depthWrite: false })
  const cloudGeometry = new THREE.SphereGeometry(1, 12, 8)
  const cloud = new THREE.Group()
  for (const [x, y, z, r] of [[3.2, 1.2, 1.5, .55], [2.6, 1.0, 1.9, .45], [3.7, 1.5, 1.2, .4], [2.9, 1.6, 1.3, .35], [2.2, 1.3, 1.6, .3]]) {
    const puff = new THREE.Mesh(cloudGeometry, cloudMaterial)
    puff.position.set(x, y, z)
    puff.scale.setScalar(r)
    cloud.add(puff)
  }
  scene.add(cloud)
  // The yard sign of the act I finale, lettered on a canvas texture.
  const signCanvas = document.createElement('canvas')
  signCanvas.width = 256; signCanvas.height = 128
  const ink = signCanvas.getContext('2d')
  if (ink) {
    ink.fillStyle = '#fff1db'; ink.fillRect(0, 0, 256, 128)
    ink.fillStyle = '#b55541'; ink.font = '700 54px system-ui, sans-serif'; ink.textAlign = 'center'; ink.textBaseline = 'middle'
    ink.fillText('À LOUER', 128, 68)
  }
  const signTexture = new THREE.CanvasTexture(signCanvas)
  signTexture.colorSpace = THREE.SRGBColorSpace
  const signMaterial = new THREE.MeshStandardMaterial({ map: signTexture, roughness: .9 })
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .55), signMaterial)
  sign.position.set(-3.3, 1.05, 4.025)
  scene.add(sign)
  // Afternoon light for the « Ça suffit » finale.
  const daylight = { background: 0xe9dfc8, sky: 0xfff6e1, sun: 0xffe6bd, sunIntensity: 2.45, sunPosition: [-7, 15, 7] }
  const golden = { background: 0xf0d3a2, sky: 0xffe2b5, sun: 0xffb46b, sunIntensity: 2.9, sunPosition: [-11, 9, 5] }
  function light(mood) {
    scene.background.setHex(mood.background)
    sky.color.setHex(mood.sky)
    sun.color.setHex(mood.sun)
    sun.intensity = mood.sunIntensity
    sun.position.set(...mood.sunPosition)
  }
  const pick = new THREE.Raycaster()
  const projection = new THREE.Vector3()
  let width = 1, height = 1, frame = 0, paused = false, lost = false, disposed = false, visible = true
  let contact = null, selected = null, lastLabels = ''
  let complete = new Set()
  let previousView = null

  function render() {
    frame = 0
    if (disposed || lost || !visible || document.hidden) return
    camera.updateMatrixWorld()
    renderer.render(scene, camera)
    const labels = stations.map(station => {
      projection.set(station.x, station.y, station.z).project(camera)
      const x = Math.round((projection.x + 1) * width / 2)
      const y = Math.round((1 - projection.y) * height / 2)
      return { id: station.id, x, y, visible: x > 15 && x < width - 15 && y > 15 && y < height - 15 }
    })
    const signature = JSON.stringify(labels)
    if (signature !== lastLabels) { lastLabels = signature; onMarkers(labels) }
  }
  // The diorama draws on demand. Pausing keeps the view and progression controls usable.
  function invalidate() {
    if (!frame && !lost && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render)
  }
  function resize() {
    width = Math.max(1, canvas.clientWidth)
    height = Math.max(1, canvas.clientHeight)
    const aspect = width / height
    const span = Math.max(14.4, aspect * 9.35)
    Object.assign(camera, { left: -span / 2, right: span / 2, top: span / (2 * aspect), bottom: -span / (2 * aspect) })
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    invalidate()
  }
  function changed() {
    const old = controls.target.clone()
    controls.target.x = THREE.MathUtils.clamp(old.x, -4.5, 4.5)
    controls.target.y = THREE.MathUtils.clamp(old.y, -1.2, 2.5)
    controls.target.z = THREE.MathUtils.clamp(old.z, -3, 3.5)
    camera.position.add(controls.target.clone().sub(old))
    invalidate()
  }
  function down(event) {
    if (!event.isPrimary || event.button !== 0) { contact = null; return }
    contact = [event.clientX, event.clientY]
  }
  function cancel() { contact = null }
  function up(event) {
    if (!contact || !event.isPrimary || Math.hypot(event.clientX - contact[0], event.clientY - contact[1]) > 7) { cancel(); return }
    cancel()
    const rect = canvas.getBoundingClientRect()
    pick.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera)
    const hit = pick.intersectObjects(targets.filter(mesh => mesh.visible), false)[0]
    if (hit) onSelect(hit.object.userData.station)
  }
  function contextLost(event) {
    event.preventDefault()
    lost = true
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    onAvailability(false)
  }
  function restored() { lost = false; onAvailability(true); invalidate() }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; invalidate() })
  intersection.observe(canvas)
  controls.addEventListener('change', changed)
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointercancel', cancel)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('webglcontextlost', contextLost)
  canvas.addEventListener('webglcontextrestored', restored)
  document.addEventListener('visibilitychange', invalidate)
  resize()

  return {
    setState(ids, id) {
      complete = new Set(ids)
      selected = id
      const count = stations.filter(station => complete.has(station.id)).length
      const ready = count === stations.length
      for (const station of stations) {
        const used = complete.has(station.id)
        batches[station.id + '-todo'].visible = !used
        batches[station.id + '-done'].visible = used
        batches[station.id + '-more'].visible = !used && count >= 1
        batches[station.id + '-more2'].visible = !used && count >= 2
      }
      cloud.visible = complete.has('digrain')
      for (const level of [1, 2, 3]) batches['cartons-' + level].visible = count >= level
      batches.truck.visible = batches.final.visible = sign.visible = ready
      light(ready ? golden : daylight)
      invalidate()
    },
    focusStation(id, panel) {
      const station = stations.find(item => item.id === id)
      if (station && panel) {
        if (!previousView) previousView = { zoom: camera.zoom, target: controls.target.clone() }
        // With the mission open, frame its belongings in the part of the viewport
        // that the sheet leaves visible, also after a device rotation.
        const bounds = canvas.getBoundingClientRect()
        const bottomSheet = panel.width > bounds.width * .72
        const freeWidth = bottomSheet ? width : Math.max(40, panel.left - bounds.left)
        const freeHeight = bottomSheet ? Math.max(40, panel.top - bounds.top) : height
        const roomWidth = 4.7, roomHeight = 3.6
        const scale = Math.min(freeWidth / roomWidth, freeHeight / roomHeight)
        camera.zoom = THREE.MathUtils.clamp(scale * (camera.right - camera.left) / width, .78, 2.7)
        const centre = new THREE.Vector3(station.x, station.y * .48, station.z)
        controls.target.copy(centre)
        camera.position.copy(centre).add(offset)
        camera.setViewOffset(width, height, (width - freeWidth) / 2, (height - freeHeight) / 2, width, height)
        controls.enabled = false
      } else if (previousView) {
        controls.enabled = true
        camera.clearViewOffset()
        camera.zoom = previousView.zoom
        controls.target.copy(previousView.target)
        camera.position.copy(previousView.target).add(offset)
        previousView = null
      } else return
      camera.updateProjectionMatrix()
      controls.update()
      invalidate()
    },
    setPaused(value) { paused = value },
    zoomBy(factor) {
      if (!Number.isFinite(factor) || factor <= 0) return
      camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom)
      camera.updateProjectionMatrix()
      invalidate()
    },
    resetView() {
      camera.zoom = 1
      camera.position.copy(home).add(offset)
      controls.target.copy(home)
      camera.updateProjectionMatrix()
      controls.update()
      invalidate()
    },
    getDebug() {
      const visible = Object.values(batches).filter(mesh => mesh.visible).map(mesh => mesh.name)
      return { completed: [...complete], selected, paused, ready: sign.visible, truck: batches.truck.visible, cloud: cloud.visible, visible, zoom: camera.zoom, drawCalls: renderer.info.render.calls }
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', invalidate)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointercancel', cancel)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('webglcontextlost', contextLost)
      canvas.removeEventListener('webglcontextrestored', restored)
      controls.removeEventListener('change', changed)
      controls.dispose()
      Object.values(batches).forEach(mesh => mesh.geometry.dispose())
      shared.dispose()
      cloudGeometry.dispose(); cloudMaterial.dispose()
      sign.geometry.dispose(); signMaterial.dispose(); signTexture.dispose()
      sun.shadow.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      scene.clear()
    },
  }
}
