import * as THREE from 'three'
import { createVhsArchives } from './tapes.js'
import { getBankLoad } from './progression.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const PALETTE = {
  ink: 0x253e3b, deepInk: 0x172d2c, paper: 0xf4ead3, ivory: 0xfff3d9,
  amber: 0xffcd43, brass: 0xb98b43, brassLight: 0xe0b767, wood: 0xa56e42,
  oak: 0xd3a16a, tile: 0xd6d6bf, tileDark: 0xb4beb0, steel: 0x7f9791,
  steelLight: 0xb5c4b9, teal: 0x3d9d92, leaf: 0x698c55, skin: 0xd89a71,
}
const GOALS = { curiosity: 10, newsletter: 8, applications: 5 }
const OPEN_ANGLE = Math.PI * .63
const MIN_ZOOM = .75, MAX_ZOOM = 3.6
const MAIL_ORIGIN = [-2.1, 0, -.4]
const DESK_ORIGIN = [2.1, 0, -.65]
const VAULT_ORIGIN = [-1.35, 0, -1.72]
const clamp = THREE.MathUtils.clamp
const smooth = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t) }
const phase = (value, start, end) => smooth((value - start) / (end - start))

function normalizeState(input = {}) {
  const counts = {}
  for (const key of ['curiosity', 'newsletter', 'applications', 'qualified', 'admitted']) {
    const value = Number(input?.counts?.[key])
    counts[key] = Number.isFinite(value) ? Math.max(0, value) : 0
  }
  return {
    counts,
    completed: Array.isArray(input?.completed) ? Object.keys(GOALS).filter(id => input.completed.includes(id)) : [],
    // Received applications, qualified people and admissions never open the vault implicitly.
    betaOpen: input?.betaOpen === true,
  }
}

/**
 * Le casse du sérieux: a paper-and-brass cutaway, with a VHS archive behind
 * an absurdly serious vault. Vue owns access, forms, copy and persistence. The
 * first state is hydration, not a celebration. Navigation never changes counts.
 * panBy uses CSS pixels: positive x/y drags the miniature right/down. Vue owns
 * keyboard bindings and the three numbered markers, not this decorative canvas.
 */
export function createBankWorld(container, { onReady = () => {}, onError = () => {}, onLabels = () => {} } = {}) {
  const scene = new THREE.Scene()
  const root = new THREE.Group()
  const scenery = new THREE.Group()
  scene.add(root)
  root.add(scenery)
  const camera = new THREE.OrthographicCamera(-8, 8, 8, -8, .1, 110)
  const viewOffset = new THREE.Vector3(12, 16, 23)
  const target = new THREE.Vector3()
  const home = new THREE.Vector3()
  const right = new THREE.Vector3(viewOffset.z, 0, -viewOffset.x).normalize()
  const up = new THREE.Vector3().crossVectors(viewOffset.clone().normalize(), right).normalize()
  // Includes the open leaf, the slab and all furniture; camera fitting uses their
  // projected corners rather than a desktop-only vertical frustum constant.
  const bounds = new THREE.Box3(new THREE.Vector3(-8.8, -.55, -5.9), new THREE.Vector3(8.8, 4.9, 5.9))
  const geometries = new Map()
  const materials = new Map()
  const textures = new Set()
  const artwork = []
  const disposers = []
  const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  let reducedMotion = motionQuery?.matches ?? false
  let renderer = null, controls = null, frameId = 0, renderCount = 0, disposed = false, contextIsLost = false
  let syncingControls = false, focusedStation = null, viewIsHome = true, labelPositions = []
  let motionPaused = false, intersecting = true, hasSize = true, renderFailed = false, needsReady = true
  let width = 1, height = 1, homeSpan = 15, zoom = 1, dirty = true, lastTime = null, lastDraw = -Infinity
  let ambientTime = 0, hasState = false, state = normalizeState(), transition = null, cameraFlight = null
  let pose = { curiosity: 0, mail: 0, stamp: 0, open: 0 }
  let sun, vaultHinge, wheel, rug, rugRoll, tapes, capsule, mailCurve, stamp, receiptSeal, clockHand
  let mailSeal, betaLamp, entryMeter, mailMeter, stampMeter, mailPapers, dossierPapers
  const employees = [], customers = []
  let mailLoad = getBankLoad(0, GOALS.newsletter), dossierLoad = getBankLoad(0, GOALS.applications)
  const scratch = new THREE.Vector3()
  const capsuleUp = new THREE.Vector3(0, 1, 0)
  const stations = {
    newsletter: [-5.47, 1.65, -.27], applications: [5.3, 1.5, 2.05], beta: [.1, 2.06, -3.63],
  }
  const labelAnchors = { newsletter: [-5.47, 3.43, -.27], applications: [5.3, 3.14, 2.05], beta: [.1, 4.8, -3.63] }

  function geometry(key, create) {
    if (!geometries.has(key)) geometries.set(key, create())
    return geometries.get(key)
  }
  function material(color, extra = {}) {
    const key = color + ':' + JSON.stringify(extra)
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .78, ...extra }))
    return materials.get(key)
  }
  function group(parent, position = [0, 0, 0], yaw = 0) {
    const result = new THREE.Group()
    result.position.set(...position)
    result.rotation.y = yaw
    parent.add(result)
    return result
  }
  function mesh(parent, geo, color, position = [0, 0, 0], extra) {
    const result = new THREE.Mesh(geo, color?.isMaterial ? color : material(color, extra))
    result.position.set(...position)
    result.castShadow = true
    result.receiveShadow = true
    parent.add(result)
    return result
  }
  function box(parent, size, position, color, bevel = 0) {
    let geo
    if (bevel) {
      const [w, h, d] = size
      const r = Math.min(bevel, w * .2, h * .2, d * .2)
      geo = geometry('bevel:' + size.join(',') + ':' + r, () => {
        const shape = new THREE.Shape()
        shape.moveTo(-w / 2 + r, -h / 2 + r)
        shape.lineTo(w / 2 - r, -h / 2 + r)
        shape.lineTo(w / 2 - r, h / 2 - r)
        shape.lineTo(-w / 2 + r, h / 2 - r)
        shape.closePath()
        const result = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 1, steps: 1, curveSegments: 1 })
        result.translate(0, 0, -(d - 2 * r) / 2)
        return result
      })
    } else geo = geometry('cube', () => new THREE.BoxGeometry(1, 1, 1))
    const result = mesh(parent, geo, color, position)
    if (!bevel) result.scale.set(...size)
    return result
  }
  function cylinder(parent, radius, length, position, color, bottom = radius, segments = 16) {
    const geo = geometry('cylinder:' + segments + ':' + bottom / radius, () => new THREE.CylinderGeometry(1, bottom / radius, 1, segments))
    const result = mesh(parent, geo, color, position)
    result.scale.set(radius, length, radius)
    return result
  }
  function disc(parent, radius, depth, position, color, segments = 40) {
    const result = cylinder(parent, radius, depth, position, color, radius, segments)
    result.rotation.x = Math.PI / 2
    return result
  }
  function torus(parent, radius, tube, position, color, segments = 40) {
    const geo = geometry('torus:' + radius + ':' + tube + ':' + segments, () => new THREE.TorusGeometry(radius, tube, 6, segments))
    return mesh(parent, geo, color, position)
  }
  function ball(parent, size, position, color) {
    const result = mesh(parent, geometry('ico', () => new THREE.IcosahedronGeometry(1, 1)), color, position)
    result.scale.set(...size)
    return result
  }
  function rod(parent, start, end, radius, color) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end)
    const result = cylinder(parent, radius, a.distanceTo(b), a.clone().add(b).multiplyScalar(.5).toArray(), color, radius, 8)
    result.quaternion.setFromUnitVectors(capsuleUp, b.sub(a).normalize())
    return result
  }
  function tube(parent, points, radius, color) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)))
    const key = 'tube:' + geometries.size
    return mesh(parent, geometry(key, () => new THREE.TubeGeometry(curve, points.length * 8, radius, 8, false)), color)
  }
  function ring(parent, outer, inner, depth, position, color) {
    const key = 'ring:' + [outer, inner, depth].join(',')
    const geo = geometry(key, () => {
      const shape = new THREE.Shape()
      shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
      const hole = new THREE.Path()
      hole.absarc(0, 0, inner, 0, Math.PI * 2, true)
      shape.holes.push(hole)
      const result = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .035, bevelThickness: .035, bevelSegments: 1, curveSegments: 24, steps: 1 })
      result.translate(0, 0, -depth / 2)
      return result
    })
    return mesh(parent, geo, color, position)
  }

  function painted(draw, w = 512, h = 192) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Le dessin des plaques du hall est indisponible.')
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() || 1, 4)
    const repaint = () => { context.clearRect(0, 0, w, h); draw(context, w, h); texture.needsUpdate = true }
    repaint()
    textures.add(texture)
    artwork.push(repaint)
    const result = new THREE.MeshStandardMaterial({ map: texture, roughness: .91, side: THREE.DoubleSide })
    materials.set('art:' + materials.size, result)
    return result
  }
  function plaque(parent, text, size, position, icon = 'mail') {
    box(parent, [size[0] + .12, size[1] + .12, .095], [position[0], position[1], position[2] - .04], PALETTE.brass, .025)
    const mat = painted((ctx, w, h) => {
      ctx.fillStyle = '#253e3b'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#e0b767'; ctx.lineWidth = 3; ctx.strokeRect(10, 10, w - 20, h - 20)
      ctx.fillStyle = '#fff0cf'; ctx.font = '900 80px Tanker, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'
      ctx.fillText(text, 105, h * .54, w - 125)
      ctx.strokeStyle = '#ffcd43'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
      // An envelope with wings, a snail-shaped paper queue, a VHS cassette.
      if (icon === 'mail') {
        ctx.strokeRect(32, 68, 49, 40)
        ctx.beginPath(); ctx.moveTo(33, 69); ctx.lineTo(56, 90); ctx.lineTo(80, 69)
        ctx.moveTo(30, 76); ctx.lineTo(20, 62); ctx.moveTo(82, 76); ctx.lineTo(93, 62); ctx.stroke()
      } else if (icon === 'files') {
        ctx.beginPath(); ctx.arc(53, 87, 21, 0, Math.PI * 2); ctx.moveTo(38, 110); ctx.lineTo(81, 110)
        ctx.lineTo(87, 88); ctx.moveTo(81, 97); ctx.lineTo(77, 84); ctx.stroke()
        ctx.beginPath(); ctx.arc(53, 87, 9, 0, Math.PI * 1.6); ctx.stroke()
      } else {
        ctx.strokeRect(25, 62, 67, 53)
        for (const x of [43, 73]) { ctx.beginPath(); ctx.arc(x, 81, 9, 0, Math.PI * 2); ctx.stroke() }
        ctx.strokeRect(35, 99, 47, 8)
      }
    })
    // The bevelled backing reaches z + .0075; the face must sit in front of it.
    const result = mesh(parent, geometry('plane', () => new THREE.PlaneGeometry(1, 1)), mat, [position[0], position[1], position[2] + .024])
    result.scale.set(size[0], size[1], 1)
    return result
  }
  const envelopeMaterial = () => painted((ctx, w, h) => {
    ctx.fillStyle = '#f7edd5'; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#b58e57'; ctx.lineWidth = 8; ctx.strokeRect(8, 8, w - 16, h - 16)
    ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(w / 2, h * .61); ctx.lineTo(w - 8, 8); ctx.stroke()
    ctx.fillStyle = '#d9ad53'; ctx.beginPath(); ctx.arc(w / 2, h * .59, 13, 0, 7); ctx.fill()
  }, 256, 160)
  let envelopePrint
  function envelope(parent, position, scale = 1, yaw = 0) {
    const result = group(parent, position, yaw)
    box(result, [.59 * scale, .035 * scale, .37 * scale], [0, 0, 0], PALETTE.paper, .008)
    const face = mesh(result, geometry('plane', () => new THREE.PlaneGeometry(1, 1)), envelopePrint)
    face.scale.set(.57 * scale, .35 * scale, 1)
    face.rotation.x = -Math.PI / 2
    face.position.y = .019 * scale
    return result
  }
  function plant(parent, position, scale = 1) {
    const result = group(parent, position)
    result.scale.setScalar(scale)
    cylinder(result, .28, .48, [0, .24, 0], PALETTE.oak, .2, 10)
    cylinder(result, .3, .09, [0, .46, 0], PALETTE.brass, .3, 10)
    cylinder(result, .25, .022, [0, .506, 0], PALETTE.deepInk, .25, 10)
    for (let i = 0; i < 7; i++) {
      const angle = i * Math.PI * 2 / 7, height = .95 + (i % 3) * .16
      const x = Math.cos(angle) * .28, z = Math.sin(angle) * .28
      rod(result, [0, .49, 0], [x, height, z], .018, PALETTE.ink)
      const leaf = ball(result, [.16, .38, .065], [x * 1.2, height, z * 1.2], i % 2 ? PALETTE.teal : PALETTE.leaf)
      leaf.rotation.set(Math.sin(angle) * .7, -angle, -Math.cos(angle) * .7)
    }
    return result
  }
  function person(parent, position, { index = 0, staff = false, guard = false, yaw = 0 } = {}) {
    const body = group(parent, position, yaw)
    body.name = staff ? (guard ? 'dossier-clerk' : 'mail-clerk') : 'waiting-customer'
    const fixed = group(body)
    const skin = [PALETTE.skin, 0x975f42, 0xb97851, 0xe2b187][index % 4]
    const coat = staff ? PALETTE.ink : [PALETTE.teal, PALETTE.oak, PALETTE.ivory, PALETTE.ink][index % 4]
    const hair = index % 3 === 0 ? 0x6c4935 : PALETTE.deepInk
    for (const x of [-.14, .14]) {
      box(fixed, [.19, .56, .22], [x, .41, 0], PALETTE.ink, .025)
      box(fixed, [.25, .15, .36], [x, .115, .055], PALETTE.deepInk, .04)
    }
    cylinder(fixed, .27, .66, [0, .98, 0], coat, .34, 6)
    box(fixed, [.15, .41, .025], [0, 1.1, .285], staff ? PALETTE.paper : PALETTE.brassLight)
    if (staff) box(fixed, [.055, .29, .035], [0, 1.05, .306], PALETTE.brass)
    else if (index % 2 === 0) {
      rod(fixed, [-.24, 1.27, .27], [.3, .73, .3], .035, PALETTE.wood)
      box(fixed, [.31, .32, .16], [.32, .69, .13], PALETTE.wood, .025)
    }
    const head = group(body, [0, 1.58, .025])
    box(head, [.46, .48, .43], [0, 0, 0], skin, .075)
    box(head, [.46, .13, .44], [0, .23, -.025], hair, .04)
    ball(head, [.07, .07, .1], [0, -.025, .235], skin)
    for (const x of [-.13, .13]) {
      ball(head, [.018, .027, .018], [x, .067, .236], PALETTE.deepInk)
      if (staff || index % 3 === 0) torus(head, .093, .016, [x, .07, .238], PALETTE.deepInk, 12)
    }
    if (staff) box(head, [.095, .018, .025], [0, .075, .244], PALETTE.deepInk)
    box(head, [.13, .019, .02], [0, -.15, .235], PALETTE.deepInk)
    if (guard) {
      for (const side of [-1, 1]) ball(head, [.115, .048, .035], [side * .087, -.1, .236], hair)
      cylinder(head, .29, .17, [0, .33, -.025], PALETTE.ink, .25, 8)
      box(head, [.45, .035, .23], [0, .262, .17], PALETTE.deepInk, .018)
      disc(fixed, .05, .018, [.17, 1.2, .25], PALETTE.amber, 6)
    } else if (index % 3 === 1) ball(head, [.19, .2, .18], [0, .24, -.2], hair)
    else if (!staff && index % 3 === 2) {
      cylinder(head, .29, .15, [0, .29, 0], PALETTE.paper, .27, 8)
      cylinder(head, .36, .04, [0, .22, 0], PALETTE.brassLight, .36, 12)
    }
    const arms = [-1, 1].map(side => {
      const arm = group(body, [side * .34, 1.27, 0])
      const elbow = staff ? [side * .03, -.25, .24] : [side * .02, -.28, .06]
      const hand = staff ? [-side * .04, -.07, .51] : [-side * .08, -.36, .27]
      rod(arm, [0, 0, 0], elbow, .092, coat)
      rod(arm, elbow, hand, .073, staff ? PALETTE.paper : coat)
      ball(arm, [.093, .09, .09], hand, skin)
      if (!staff && side === 1) {
        const ticket = box(arm, [.31, .035, .4], [-.08, -.34, .33], index % 2 ? PALETTE.oak : PALETTE.paper)
        ticket.rotation.x = .2
      }
      batchRigid(arm)
      return arm
    })
    batchRigid(fixed)
    batchRigid(head)
    const result = { body, head, arms, position: body.position.clone(), staff, index, yaw }
    head.rotation.x = staff ? .3 : .025
    if (staff) employees.push(result)
    return result
  }

  function folder(parent, position = [0, 0, 0]) {
    const result = group(parent, position)
    box(result, [.9, .09, .86], [0, 0, 0], PALETTE.oak, .012)
    box(result, [.79, .035, .75], [0, .057, 0], PALETTE.paper)
    box(result, [.27, .03, .14], [-.2, .067, -.45], PALETTE.amber)
    box(result, [.04, .023, .7], [-.28, .087, 0], PALETTE.ink)
    return result
  }

  // Fixed GPU budget: 48 representative papers plus six solid paper cores per
  // counter. The cores and spacing keep growing logarithmically after 48, so a
  // capacity limit never makes an additional received item disappear visually.
  function paperLoad(parent, kind) {
    const isMail = kind === 'mail'
    const sample = isMail ? envelope(parent, [0, 0, 0], 1.35) : folder(parent)
    sample.updateMatrixWorld(true)
    const parts = []
    sample.traverse(object => {
      if (!object.isMesh) return
      object.updateMatrix()
      const instances = new THREE.InstancedMesh(object.geometry, object.material, 48)
      instances.castShadow = true
      instances.receiveShadow = true
      instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      // Continuous height changes invalidate any cached instance bounding sphere.
      instances.frustumCulled = false
      parent.add(instances)
      parts.push({ instances, local: object.matrix.clone() })
    })
    sample.removeFromParent()
    const locations = isMail
      ? [[-2.76, 1.49, .25], [-3.13, 1.4, .5], [-1.88, .14, 1.25], [-4.28, 1.4, .37], [-2.63, .14, 1.81], [-4.55, .14, 1.15]]
      : [[3.91, 1.4, 2.47], [4.47, 1.4, 2.93], [4.92, .14, 2.35], [2.06, .14, 2.76], [4.22, .14, 3.53], [4.87, .14, 3.57]]
    const cores = locations.map((point, i) => {
      const core = box(parent, [1, 1, 1], point, i % 2 ? PALETTE.paper : PALETTE.ivory)
      core.rotation.y = (i % 3 - 1) * .17
      return core
    })
    const dummy = new THREE.Object3D(), matrix = new THREE.Matrix4()
    const heights = locations.map(() => 0)
    const pileFor = i => i < 5 ? 0 : (i - 4) % locations.length
    let visibleCount = 0, maxHeight = 0
    return {
      get count() { return visibleCount },
      get height() { return maxHeight },
      get heights() { return [...heights] },
      update(load, arrival = 0) {
        visibleCount = Math.min(48, Math.ceil(load.paperCount))
        const counts = locations.map(() => 0), levels = locations.map(() => 0)
        for (let i = 0; i < visibleCount; i++) counts[pileFor(i)]++
        maxHeight = 0
        locations.forEach((point, i) => {
          const weight = i === 0 ? 1 : i < 2 ? .64 : .4
          const height = counts[i] ? (.055 + (isMail ? .8 : 1.03) * load.progress * weight + load.bulkHeight * (i === 0 ? 2.7 : 1.7)) : 0
          const spread = 1 + load.overflow * .055
          heights[i] = height
          cores[i].visible = height > 0
          cores[i].position.y = point[1] + height / 2
          cores[i].scale.set((isMail ? .68 : .77) * spread, Math.max(.001, height), (isMail ? .4 : .65) * spread)
          maxHeight = Math.max(maxHeight, height ? point[1] + height : 0)
        })
        for (let i = 0; i < visibleCount; i++) {
          const pile = pileFor(i), point = locations[pile]
          const level = ++levels[pile] / counts[pile]
          const spread = 1 + load.overflow * .055
          const lean = Math.sin(i * 2.4) * (.065 + load.overflow * .012)
          dummy.position.set(point[0] + lean, point[1] + heights[pile] * level + (i === visibleCount - 1 ? arrival : 0), point[2] + Math.cos(i * 1.7) * .055)
          dummy.rotation.set(pile > 1 ? Math.sin(i) * .045 : 0, (i % 5 - 2) * .13 + (pile > 1 ? .24 : 0), lean * .11)
          dummy.scale.set(spread, 1, spread)
          dummy.updateMatrix()
          parts.forEach(({ instances, local }) => instances.setMatrixAt(i, matrix.multiplyMatrices(dummy.matrix, local)))
        }
        parts.forEach(({ instances }) => { instances.count = visibleCount; instances.instanceMatrix.needsUpdate = true })
      },
    }
  }

  function meter(parent, count, origin, step, color) {
    const lights = new THREE.InstancedMesh(geometry('cube', () => new THREE.BoxGeometry(1, 1, 1)), material(color), count)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const p = origin.map((v, axis) => v + step[axis] * i)
      box(parent, [.17, .07, .13], p, PALETTE.deepInk, .013)
      dummy.position.set(p[0], p[1] + .046, p[2])
      dummy.scale.set(.12, .024, .084)
      dummy.updateMatrix()
      lights.setMatrixAt(i, dummy.matrix)
    }
    lights.userData.capacity = count
    lights.instanceMatrix.needsUpdate = true
    lights.computeBoundingSphere()
    parent.add(lights)
    return lights
  }

  function buildArchitecture() {
    scene.add(new THREE.HemisphereLight(0xfff2d4, 0x84988a, 2.3))
    sun = new THREE.DirectionalLight(0xffe7b5, 3.3)
    sun.position.set(-9, 18, 12)
    sun.castShadow = true
    sun.shadow.mapSize.set(1536, 1536)
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 13, bottom: -13, near: 1, far: 55 })
    sun.shadow.normalBias = .035
    sun.shadow.bias = -.00015
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xe0f4e9, .85)
    fill.position.set(10, 9, -3)
    scene.add(fill)
    box(scenery, [17.4, .38, 11.6], [0, -.32, 0], PALETTE.ink, .1)
    box(scenery, [17.28, .11, 11.48], [0, -.085, 0], PALETTE.brass, .025)
    box(scenery, [17.1, .1, 11.3], [0, -.007, 0], PALETTE.paper, .025)
    for (let x = 0; x < 19; x++) for (let z = 0; z < 12; z++) {
      const px = -8.1 + x * .9, pz = -4.95 + z * .9
      box(scenery, [.87, .026, .87], [px, .059, pz], (x + z) % 2 ? PALETTE.tile : PALETTE.paper)
      if (x % 3 === 0 && z % 3 === 0) {
        const inlay = box(scenery, [.11, .009, .11], [px, .078, pz], PALETTE.brass)
        inlay.rotation.y = Math.PI / 4
      }
    }
    box(scenery, [17.2, 4.43, .2], [0, 2.275, -5.61], PALETTE.paper, .035)
    box(scenery, [17.2, 1.05, .055], [0, .6, -5.483], PALETTE.ink)
    box(scenery, [17.4, .18, .38], [0, 4.53, -5.59], PALETTE.ink, .03)
    box(scenery, [17.3, .045, .39], [0, 4.41, -5.56], PALETTE.brass)
    // Cut low at the sides: the busy counters stay readable from the front.
    box(scenery, [.2, 2.35, 3.35], [-8.45, 1.225, -3.95], PALETTE.paper, .025)
    box(scenery, [.24, .82, 3.35], [-8.44, .46, -3.95], PALETTE.ink, .015)
    box(scenery, [.29, .1, 3.4], [-8.44, 2.45, -3.95], PALETTE.brass, .018)
    box(scenery, [.18, 1.15, 2.4], [8.45, .625, -4.75], PALETTE.paper, .025)
    for (const x of [-8.12, -3.25, 3.2, 8.12]) {
      box(scenery, [.24, 4.1, .24], [x, 2.15, -5.4], PALETTE.oak, .025)
      box(scenery, [.34, .2, .35], [x, 4.3, -5.4], PALETTE.brass, .02)
    }
    disc(scenery, .48, .105, [-5.47, 3.53, -5.36], PALETTE.brass)
    disc(scenery, .415, .024, [-5.47, 3.53, -5.293], PALETTE.ivory)
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6
      const tick = box(scenery, [.026, .075, .016], [-5.47 + Math.sin(angle) * .34, 3.53 + Math.cos(angle) * .34, -5.27], PALETTE.ink)
      tick.rotation.z = -angle
    }
    clockHand = group(root, [-5.47, 3.53, -5.245])
    box(clockHand, [.022, .3, .018], [0, .11, 0], PALETTE.ink)
    const hour = box(scenery, [.23, .034, .018], [-5.56, 3.53, -5.244], PALETTE.ink)
    hour.rotation.z = -.12
    disc(scenery, .046, .03, [-5.47, 3.53, -5.22], PALETTE.brass)
    plant(scenery, [-7.7, .07, 4.45], 1.25)
    plant(scenery, [7.7, .07, -4.7], 1.12)
    // Two short queues leave a broad, empty route to the unobserved vault.
    for (const [x, z] of [[-6.85, 1.2], [-6.85, 4.2], [7.2, 2.7], [7.2, 4.7]]) {
      cylinder(scenery, .2, .09, [x, .12, z], PALETTE.ink)
      cylinder(scenery, .043, .8, [x, .53, z], PALETTE.brass)
      ball(scenery, [.09, .09, .09], [x, .96, z], PALETTE.brassLight)
    }
    tube(scenery, [[-6.85, .89, 1.2], [-6.85, .7, 2.2], [-6.85, .7, 3.2], [-6.85, .89, 4.2]], .036, PALETTE.ink)
    tube(scenery, [[7.2, .89, 2.7], [7.2, .72, 3.7], [7.2, .89, 4.7]], .036, PALETTE.ink)
    cylinder(scenery, .37, .09, [-2.9, .12, 3.9], PALETTE.ink)
    cylinder(scenery, .055, .9, [-2.9, .61, 3.9], PALETTE.brass)
    const lectern = group(scenery, [-2.9, 1.09, 3.9])
    lectern.rotation.x = .19
    box(lectern, [1.08, .08, .72], [0, 0, 0], PALETTE.ink, .035)
    for (let i = 0; i < 3; i++) envelope(lectern, [-.24 + i * .23, .07 + i * .01, 0], .6, -.1 + i * .09)
    entryMeter = meter(scenery, 10, [-1.08, .14, 5.15], [.24, 0, 0], PALETTE.amber)
  }

  function buildMail(sceneryParent = scenery, movingParent = root) {
    const scenery = group(sceneryParent, MAIL_ORIGIN), root = group(movingParent, MAIL_ORIGIN)
    // Pigeonholes, not a generic storage cube.
    box(scenery, [3.5, 1.5, .13], [-3.22, .88, -3.61], PALETTE.ink, .025)
    for (let row = 0; row <= 3; row++) box(scenery, [3.55, .065, .66], [-3.22, .17 + row * .46, -3.3], PALETTE.oak)
    for (let col = 0; col <= 5; col++) box(scenery, [.065, 1.44, .65], [-4.97 + col * .7, .88, -3.3], PALETTE.oak)
    for (let i = 0; i < 11; i++) envelope(scenery, [-4.62 + (i % 5) * .7, .26 + Math.floor(i / 5) * .46, -3.12], .72, i % 2 ? .1 : -.06)
    box(scenery, [3.55, 1.08, 1.06], [-3.37, .64, .13], PALETTE.oak, .065)
    box(scenery, [3.42, .74, .045], [-3.37, .64, .679], PALETTE.ink, .02)
    for (let i = 0; i < 13; i++) box(scenery, [.035, .78, .055], [-4.9 + i * .255, .64, .72], PALETTE.brass)
    box(scenery, [3.79, .17, 1.25], [-3.37, 1.27, .13], PALETTE.paper, .055)
    box(scenery, [3.78, .06, 1.26], [-3.37, 1.16, .13], PALETTE.brass, .018)
    plaque(scenery, 'COURRIER', [2.12, .48], [-3.45, .77, .77], 'mail')
    person(root, [-3.4, .2, -.87], { staff: true, index: 1, yaw: .04 })
    // The half-height teller frame leaves the impassive face readable.
    for (const x of [-4.99, -1.77]) {
      cylinder(scenery, .045, 1.27, [x, 1.97, -.23], PALETTE.brass)
      ball(scenery, [.09, .09, .09], [x, 2.65, -.23], PALETTE.brassLight)
    }
    rod(scenery, [-4.99, 2.6, -.23], [-1.77, 2.6, -.23], .043, PALETTE.brass)
    for (const x of [-4.73, -4.47, -2.3, -2.04]) rod(scenery, [x, 1.38, -.23], [x, 2.56, -.23], .018, PALETTE.brass)
    box(scenery, [1.03, .07, .64], [-2.73, 1.4, .22], PALETTE.brass, .025)
    box(scenery, [.93, .025, .57], [-2.73, 1.448, .22], PALETTE.ink)
    mailPapers = paperLoad(root, 'mail')
    mailSeal = disc(root, .095, .025, [-1.9, 1.65, .44], material(PALETTE.teal, { emissive: PALETTE.teal, emissiveIntensity: .18 }))
    mailSeal.rotation.x = Math.PI / 2
    mailMeter = meter(scenery, 8, [-4.7, 1.379, .66], [.18, 0, 0], PALETTE.teal)
    mailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.67, 1.48, .12), new THREE.Vector3(-4.67, 2.45, .12),
      new THREE.Vector3(-4.67, 3.14, -.5), new THREE.Vector3(-4.67, 3.14, -2.48),
      new THREE.Vector3(-3.87, 3.14, -2.84), new THREE.Vector3(-2.25, 3.14, -2.84),
      new THREE.Vector3(-1.89, 2.75, -2.26), new THREE.Vector3(-1.89, 1.67, .08),
    ], false, 'centripetal')
    const glass = material(0x83bbac, { transparent: true, opacity: .26, roughness: .32, depthWrite: false })
    const pipe = mesh(scenery, geometry('pneumatic', () => new THREE.TubeGeometry(mailCurve, 76, .145, 10, false)), glass)
    pipe.castShadow = false
    for (let i = 0; i <= 13; i++) {
      const t = i / 13, p = mailCurve.getPointAt(t), tangent = mailCurve.getTangentAt(t)
      const collar = cylinder(scenery, .17, .07, p.toArray(), PALETTE.brass, .17, 12)
      collar.quaternion.setFromUnitVectors(capsuleUp, tangent)
    }
    for (const x of [-4.67, -1.89]) {
      cylinder(scenery, .22, .18, [x, 1.43, .12], PALETTE.ink)
      cylinder(scenery, .185, .075, [x, 1.54, .12], PALETTE.brassLight)
    }
    capsule = group(root)
    cylinder(capsule, .099, .32, [0, 0, 0], PALETTE.paper)
    for (const y of [-.17, .17]) cylinder(capsule, .105, .055, [0, y, 0], PALETTE.teal)
    box(capsule, [.14, .12, .012], [0, 0, .102], PALETTE.brass)
    // A green banker lamp and a closed ledger, small but fully furnished.
    cylinder(scenery, .18, .05, [-3.88, 1.4, .09], PALETTE.brass)
    rod(scenery, [-3.88, 1.42, .09], [-3.88, 1.87, -.02], .025, PALETTE.brass)
    box(scenery, [.57, .16, .29], [-3.88, 1.9, -.02], PALETTE.teal, .065)
    box(scenery, [.46, .018, .23], [-3.88, 1.806, -.02], material(PALETTE.ivory, { emissive: 0xffc35a, emissiveIntensity: .4 }))
    const ledger = box(scenery, [.51, .1, .6], [-3.38, 1.425, .21], PALETTE.ink, .018)
    ledger.rotation.y = -.14
  }

  function buildDesk(sceneryParent = scenery, movingParent = root) {
    const scenery = group(sceneryParent, DESK_ORIGIN), root = group(movingParent, DESK_ORIGIN)
    const desk = group(scenery, [3.2, 0, 2.7], -.08)
    box(desk, [3.15, .18, 1.53], [0, 1.2, 0], PALETTE.oak, .07)
    box(desk, [3.07, .027, 1.45], [0, 1.306, 0], PALETTE.paper, .016)
    box(desk, [.92, .96, 1.13], [.94, .62, -.04], PALETTE.ink, .04)
    for (let i = 0; i < 3; i++) {
      box(desk, [.8, .24, .04], [.94, .34 + i * .28, .545], PALETTE.oak, .018)
      rod(desk, [.79, .35 + i * .28, .59], [1.09, .35 + i * .28, .59], .023, PALETTE.brass)
    }
    for (const z of [-.5, .5]) {
      rod(desk, [-1.18, 1.11, z], [-1.34, .15, z], .066, PALETTE.brass)
      cylinder(desk, .105, .075, [-1.34, .12, z], PALETTE.ink)
    }
    box(desk, [2.9, .31, .075], [0, 1.015, .57], PALETTE.ink, .02)
    plaque(desk, 'DOSSIERS', [1.84, .42], [-.04, 1.015, .646], 'files')
    // Big rubber stamp: sculpted wooden handle, brass spindle and inky foot.
    stamp = group(root, [2.66, 1.52, 2.73], -.08)
    box(stamp, [.88, .13, .7], [0, 0, 0], PALETTE.deepInk, .045)
    box(stamp, [.78, .105, .62], [0, .12, 0], PALETTE.brass, .035)
    cylinder(stamp, .11, .38, [0, .34, 0], PALETTE.brassLight, .16, 12)
    box(stamp, [.74, .24, .4], [0, .61, 0], PALETTE.wood, .085)
    box(stamp, [.39, .025, .24], [0, .744, 0], PALETTE.brass, .012)
    for (let i = 0; i < 4; i++) {
      const paper = box(desk, [.82, .025, .86], [-.46, 1.34 + i * .027, .07], PALETTE.ivory)
      paper.rotation.y = (i - 2) * .065
    }
    receiptSeal = mesh(root, geometry('receipt-seal', () => new THREE.RingGeometry(.093, .123, 24)), material(PALETTE.teal, { side: THREE.DoubleSide }), [2.67, 1.458, 2.78])
    receiptSeal.rotation.x = -Math.PI / 2
    box(desk, [.64, .07, .46], [-1.08, 1.366, -.18], PALETTE.ink, .02)
    box(desk, [.53, .015, .35], [-1.08, 1.408, -.18], PALETTE.teal)
    const lid = box(desk, [.64, .04, .46], [-1.08, 1.57, -.45], PALETTE.ink, .018)
    lid.rotation.x = -.9
    dossierPapers = paperLoad(root, 'dossiers')
    stampMeter = meter(scenery, 5, [2.64, 1.363, 3.26], [.21, 0, -.017], PALETTE.teal)
    // Pen pot, oversized fountain pen, visitor chair and tiny coffee cup.
    cylinder(desk, .12, .22, [1.2, 1.435, -.39], PALETTE.ink, .1, 8)
    for (let i = 0; i < 3; i++) rod(desk, [1.15 + i * .045, 1.47, -.39], [1.1 + i * .09, 1.86, -.37], .018, i === 1 ? PALETTE.amber : PALETTE.brass)
    const chair = group(scenery, [3.22, .09, 3.77], Math.PI)
    for (const x of [-.29, .29]) for (const z of [-.25, .25]) rod(chair, [x, 0, z], [x * .8, .5, z * .8], .035, PALETTE.brass)
    box(chair, [.7, .13, .63], [0, .55, 0], PALETTE.ink, .07)
    box(chair, [.7, .54, .13], [0, .87, -.29], PALETTE.teal, .06)
    // Both employees face their own paperwork, with their backs to the archive.
    person(root, [3.16, .16, 1.58], { staff: true, guard: true, index: 2, yaw: -.08 })
    for (let i = 0; i < 3; i++) {
      const fileBox = group(scenery, [4.28 + (i % 2) * .68, .31 + Math.floor(i / 2) * .47, 1.47])
      box(fileBox, [.61, .43, .75], [0, 0, 0], PALETTE.ink, .025)
      box(fileBox, [.64, .055, .79], [0, .24, 0], PALETTE.oak, .012)
      box(fileBox, [.32, .13, .02], [0, .03, .388], PALETTE.paper)
      rod(fileBox, [-.08, -.06, .41], [.08, -.06, .41], .017, PALETTE.brass)
    }
  }

  function buildCustomers() {
    const queues = {
      newsletter: [[-5.5, .09, 1.35], [-5.13, .09, 2.5], [-5.8, .09, 3.57], [-4.84, .09, 4.43]],
      applications: [[5.36, .09, 3.57], [6.4, .09, 4.34], [4.39, .09, 4.63], [3.38, .09, 4.7]],
    }
    for (const [station, positions] of Object.entries(queues)) positions.forEach((position, i) => {
      const index = i + (station === 'applications' ? 3 : 0)
      const actor = person(root, position, { index, yaw: Math.PI + (i % 3 - 1) * .18 })
      actor.body.scale.setScalar(.92 + (index % 3) * .06)
      actor.station = station
      actor.queueIndex = i
      customers.push(actor)
    })
  }

  function buildVault(sceneryParent = scenery, movingParent = root) {
    const scenery = group(sceneryParent, VAULT_ORIGIN), root = group(movingParent, VAULT_ORIGIN)
    const metal = material(PALETTE.steel, { metalness: .55, roughness: .39 })
    const edge = material(PALETTE.brassLight, { metalness: .65, roughness: .34 })
    const darkMetal = material(PALETTE.ink, { metalness: .45, roughness: .45 })
    const center = [1.45, 2.06, -1.91]
    // An actual circular opening, deep tunnel, stepped jamb, rivets, hinges and
    // radial locking bolts. The door is never approximated by a square block.
    ring(scenery, 2.08, 1.65, .46, center, darkMetal)
    ring(scenery, 2.015, 1.73, .15, [1.45, 2.06, -1.6], metal)
    torus(scenery, 1.94, .055, [1.45, 2.06, -1.488], edge)
    torus(scenery, 1.71, .067, [1.45, 2.06, -1.51], edge)
    const tunnelGeo = geometry('vault-tunnel', () => new THREE.CylinderGeometry(1.65, 1.65, 1.58, 40, 1, true))
    const tunnel = mesh(scenery, tunnelGeo, material(PALETTE.steel, { side: THREE.DoubleSide, metalness: .3 }), [1.45, 2.06, -2.78])
    tunnel.rotation.x = Math.PI / 2
    disc(scenery, 1.64, .08, [1.45, 2.06, -3.61], PALETTE.ink)
    for (let i = 0; i < 20; i++) {
      const angle = i * Math.PI / 10
      disc(scenery, .044, .04, [1.45 + Math.sin(angle) * 1.84, 2.06 + Math.cos(angle) * 1.84, -1.46], edge, 6)
    }
    for (const x of [-.1, 3]) {
      box(scenery, [.68, .36, 1.05], [x, .24, -1.89], PALETTE.ink, .055)
      box(scenery, [.73, .065, 1.1], [x, .105, -1.89], PALETTE.brass, .02)
    }
    box(scenery, [1.55, .17, .49], [1.45, .19, -1.46], PALETTE.brass, .025)
    box(scenery, [1.3, .15, .32], [1.45, .35, -1.72], PALETTE.brassLight, .018)
    plaque(scenery, 'ARCHIVES', [2.24, .43], [1.45, 4.29, -1.91], 'tape')
    for (const x of [-.84, 3.75]) {
      box(scenery, [.12, .51, .13], [x, 2.9, -2.01], PALETTE.ink, .014)
      cylinder(scenery, .14, .34, [x, 2.92, -1.88], material(PALETTE.ivory, { emissive: 0xffc258, emissiveIntensity: .45 }), .14, 8)
      for (const y of [2.71, 3.13]) cylinder(scenery, .18, .07, [x, y, -1.88], PALETTE.brass, .18, 8)
    }
    vaultHinge = group(root, [3.17, 2.06, -1.38])
    const leaf = group(vaultHinge, [-1.72, 0, 0])
    const leafFixed = group(leaf)
    disc(leafFixed, 1.645, .29, [0, 0, 0], metal)
    disc(leafFixed, 1.52, .06, [0, 0, .182], darkMetal)
    ring(leafFixed, 1.59, 1.37, .07, [0, 0, .228], edge)
    disc(leafFixed, 1.315, .1, [0, 0, .228], metal)
    torus(leafFixed, 1.265, .032, [0, 0, .29], edge)
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8
      disc(leafFixed, .039, .03, [Math.sin(angle) * 1.47, Math.cos(angle) * 1.47, .287], darkMetal, 6)
    }
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3
      rod(leafFixed, [Math.sin(a) * .72, Math.cos(a) * .72, .345], [Math.sin(a) * 1.29, Math.cos(a) * 1.29, .345], .07, edge)
      const keeper = box(leafFixed, [.22, .16, .14], [Math.sin(a) * 1.21, Math.cos(a) * 1.21, .346], darkMetal, .025)
      keeper.rotation.z = -a
    }
    wheel = group(leaf, [0, 0, .51])
    torus(wheel, .47, .065, [0, 0, 0], edge, 24)
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5
      rod(wheel, [0, 0, 0], [Math.sin(a) * .47, Math.cos(a) * .47, 0], .043, edge)
    }
    disc(wheel, .145, .16, [0, 0, .025], darkMetal, 12)
    disc(wheel, .087, .03, [0, 0, .13], edge, 12)
    disc(leafFixed, .18, .09, [-.71, .55, .34], darkMetal, 24)
    disc(leafFixed, .125, .03, [-.71, .55, .4], edge, 24)
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5
      const tick = box(leafFixed, [.015, .035, .015], [-.71 + Math.sin(a) * .09, .55 + Math.cos(a) * .09, .424], PALETTE.ink)
      tick.rotation.z = -a
    }
    // The open leaf has its own reinforced inner face, not an empty back.
    disc(leafFixed, 1.46, .07, [0, 0, -.197], darkMetal)
    torus(leafFixed, 1.34, .055, [0, 0, -.251], edge)
    for (const a of [-.68, .68]) {
      const brace = box(leafFixed, [.16, 2.24, .08], [0, 0, -.265], metal, .025)
      brace.rotation.z = a
    }
    disc(leafFixed, .3, .1, [0, 0, -.32], edge)
    for (const y of [-1, 0, 1]) {
      cylinder(scenery, .135, .5, [3.17, 2.06 + y, -1.38], edge, .135, 12)
      box(scenery, [.41, .25, .15], [3.28, 2.06 + y, -1.54], darkMetal, .025)
      box(vaultHinge, [.31, .2, .16], [-.16, y, -.01], edge, .02)
    }
    batchRigid(leafFixed)
    batchRigid(wheel)
    tapes = createVhsArchives({ root, group, box, mesh, disc, geometry, painted, palette: PALETTE })
    batchRigid(tapes.archives)
    tapes.spillTapes.forEach(batchRigid)
    betaLamp = new THREE.PointLight(0xffdb87, 0, 5, 2)
    betaLamp.position.set(1.45, 2, -2.2)
    root.add(betaLamp)
    // Runner grows from the threshold; its leading roll moves with the unfolding.
    rug = group(root, [1.45, .09, -1.34])
    box(rug, [1.86, .035, 3.17], [0, 0, 1.585], PALETTE.amber, .008)
    for (const x of [-.81, .81]) box(rug, [.025, .009, 3.03], [x, .024, 1.585], PALETTE.brass)
    for (let i = 0; i < 9; i++) box(rug, [.055, .02, .14], [-.72 + i * .18, -.003, 3.2], PALETTE.paper)
    rugRoll = cylinder(root, .15, 1.86, [1.45, .26, -1.34], PALETTE.amber, .15, 16)
    rugRoll.rotation.z = Math.PI / 2
  }

  // Local batching retains the hinge/wheel/archive transforms. Only truly rigid
  // descendants enter each batch; no global material cache survives an unmount.
  function batchRigid(parent) {
    parent.updateWorldMatrix(true, true)
    const inverse = parent.matrixWorld.clone().invert(), batches = new Map()
    parent.traverse(object => {
      if (!object.isMesh || object.isInstancedMesh || Array.isArray(object.material)) return
      // Transparent glass keeps its independent depth sorting.
      if (object.material.transparent) return
      const key = object.geometry.uuid + ':' + object.material.uuid + ':' + object.castShadow
      if (!batches.has(key)) batches.set(key, [])
      batches.get(key).push(object)
    })
    for (const objects of batches.values()) {
      if (objects.length < 2) continue
      const first = objects[0]
      const batch = new THREE.InstancedMesh(first.geometry, first.material, objects.length)
      batch.castShadow = first.castShadow
      batch.receiveShadow = true
      objects.forEach((object, i) => {
        batch.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld))
        object.removeFromParent()
      })
      batch.instanceMatrix.needsUpdate = true
      batch.computeBoundingSphere()
      parent.add(batch)
    }
    // Bevelled one-offs have different geometry but often share a finish. Merge
    // those remaining rigid solids by finish; repeated tiles stay instanced.
    const finishes = new Map()
    parent.traverse(object => {
      if (!object.isMesh || object.isInstancedMesh || Array.isArray(object.material) || object.material.transparent) return
      const key = object.material.uuid + ':' + object.castShadow
      if (!finishes.has(key)) finishes.set(key, [])
      finishes.get(key).push(object)
    })
    for (const objects of finishes.values()) {
      if (objects.length < 2) continue
      const parts = objects.map(object => {
        const part = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()
        part.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld))
        return part
      })
      const merged = mergeGeometries(parts, false)
      parts.forEach(part => part.dispose())
      if (!merged) continue
      geometries.set('merged:' + geometries.size, merged)
      const result = mesh(parent, merged, objects[0].material)
      result.castShadow = objects[0].castShadow
      objects.forEach(object => object.removeFromParent())
    }
  }

  function statePose() {
    return {
      curiosity: clamp(state.counts.curiosity / GOALS.curiosity, 0, 1),
      // Only completion lamps use clamped progress. Ratios drive the miniature.
      mail: getBankLoad(state.counts.newsletter, GOALS.newsletter).ratio,
      stamp: getBankLoad(state.counts.applications, GOALS.applications).ratio,
      open: state.betaOpen ? 1 : 0,
    }
  }
  function applyPose(next, arrivals = {}) {
    pose = { ...next }
    mailLoad = getBankLoad(pose.mail * GOALS.newsletter, GOALS.newsletter)
    dossierLoad = getBankLoad(pose.stamp * GOALS.applications, GOALS.applications)
    mailPapers.update(mailLoad, arrivals.mail ?? 0)
    dossierPapers.update(dossierLoad, arrivals.dossiers ?? 0)
    for (const [items, level] of [[entryMeter, pose.curiosity], [mailMeter, mailLoad.progress], [stampMeter, dossierLoad.progress]]) {
      items.count = clamp(Math.ceil(level * items.userData.capacity - .01), 0, items.userData.capacity)
    }
    customers.forEach(actor => {
      const load = actor.station === 'newsletter' ? mailLoad : dossierLoad
      actor.body.visible = actor.queueIndex < Math.min(4, load.waitingCount)
    })
    mailSeal.visible = state.completed.includes('newsletter')
    receiptSeal.visible = pose.stamp > 0 || state.completed.includes('applications')
    vaultHinge.rotation.y = OPEN_ANGLE * smooth(pose.open)
    wheel.rotation.z = pose.open * Math.PI * .52
    tapes.update(pose.open)
    betaLamp.intensity = pose.open * 2.2
    const rollout = phase(pose.open, .35, 1)
    rug.visible = rollout > .001
    rug.scale.z = Math.max(.001, rollout)
    rugRoll.visible = pose.open > .01 && rollout < .998
    rugRoll.position.z = -1.34 + rollout * 3.17
    rugRoll.rotation.x = -rollout * 12
    stamp.position.y = 1.52 - dossierLoad.progress * .025
  }
  function placeCapsule(t) {
    capsule.position.copy(mailCurve.getPointAt(clamp(t, 0, 1)))
    capsule.quaternion.setFromUnitVectors(capsuleUp, mailCurve.getTangentAt(clamp(t, 0, 1)))
  }
  function posePeople(time) {
    employees.forEach((actor, i) => {
      const load = i === 0 ? mailLoad : dossierLoad
      const pressure = load.progress + Math.log1p(load.overflow) * .22
      actor.head.rotation.x = .3 + load.progress * .085 + Math.sin(time * 1.3 + i) * .025
      actor.head.rotation.y = Math.sin(time * .7 + i) * .075
      actor.arms.forEach((arm, side) => {
        arm.rotation.x = Math.sin(time * (1.65 + i * .3) + side * 2.1) * (.025 + pressure * .045)
        arm.rotation.z = Math.cos(time * 1.2 + side + i) * .035
      })
    })
    customers.forEach(actor => {
      if (!actor.body.visible) return
      const t = time + actor.index * 1.7
      // Weight shift, checking the paper in hand, then waiting again. No patrol
      // looks toward the open vault and nobody leaves their actual queue.
      actor.body.position.y = actor.position.y + Math.max(0, Math.sin(t * 1.15)) * .013
      actor.body.rotation.z = Math.sin(t * .67) * .014
      actor.head.rotation.x = .08 + (1 + Math.sin(t * .58)) * .06
      actor.head.rotation.y = Math.sin(t * .43) * .1
      actor.arms[1].rotation.x = -.11 + Math.sin(t * .76) * .055
    })
  }
  function quietEffects() {
    capsule.visible = true
    placeCapsule((.105 + mailLoad.progress * .59 + mailLoad.overflow * .07) % 1)
    stamp.rotation.z = 0
    stamp.position.y = 1.52 - dossierLoad.progress * .025
    mailSeal.scale.set(.095, .025, .095)
    receiptSeal.scale.setScalar(1)
    posePeople(0)
  }
  function settleTransition() {
    transition = null
    applyPose(statePose())
    quietEffects()
  }
  function animateWorld(delta) {
    ambientTime += delta
    clockHand.rotation.z = -.42 - ambientTime * .035
    posePeople(ambientTime)
    if (!transition) {
      capsule.visible = true
      placeCapsule((.105 + mailLoad.progress * .59 + ambientTime * (.033 + Math.log1p(mailLoad.overflow) * .012)) % 1)
      return
    }
    transition.elapsed += delta
    const progress = clamp(transition.elapsed / transition.duration, 0, 1)
    const next = {}
    for (const key of Object.keys(pose)) {
      const amount = key === 'open' && transition.beta ? phase(progress, .12, .82) : smooth(progress)
      next[key] = THREE.MathUtils.lerp(transition.from[key], transition.to[key], amount)
    }
    const landing = Math.sin(phase(progress, .42, 1) * Math.PI) * .24
    applyPose(next, { mail: transition.mailArrival ? landing : 0, dossiers: transition.dossierArrival ? landing * 1.15 : 0 })
    if (transition.mailArrival) {
      capsule.visible = true
      placeCapsule(phase(progress, .02, .87))
    }
    if (transition.mail) {
      const flash = 1 + Math.sin(progress * Math.PI) * .85
      mailSeal.scale.set(.095 * flash, .025, .095 * flash)
    }
    if (transition.stamp) {
      // Completion alone earns the big stamp. Later arrivals only move paper.
      const lift = phase(progress, 0, .24) * .37
      const impact = phase(progress, .24, .43) * .58
      const recover = phase(progress, .51, .84) * .21
      stamp.position.y += lift - impact + recover
      stamp.rotation.z = Math.sin(progress * Math.PI * 2) * .055 * (1 - progress)
      receiptSeal.scale.setScalar(1 + Math.sin(progress * Math.PI) * .7)
    }
    if (transition.beta) {
      wheel.rotation.z += Math.sin(phase(progress, 0, .27) * Math.PI) * .68
      // The archive itself spills out: no unrelated confetti over the VHS.
    }
    if (progress >= 1) settleTransition()
  }

  function active() { return !disposed && !contextIsLost && !renderFailed && !document.hidden && intersecting && hasSize }
  function moving() { return !motionPaused && !reducedMotion }
  function stopFrame() {
    if (frameId) window.cancelAnimationFrame(frameId)
    frameId = 0
    lastTime = null
  }
  function requestRender() {
    dirty = true
    if (active() && !frameId) frameId = window.requestAnimationFrame(render)
  }
  function scheduleNext() {
    if (active() && (moving() || cameraFlight) && !frameId) frameId = window.requestAnimationFrame(render)
  }
  function publishLabels() {
    labelPositions = Object.entries(labelAnchors).map(([id, point]) => {
      scratch.set(...point).project(camera)
      const x = (scratch.x + 1) * width / 2, y = (1 - scratch.y) * height / 2
      return { id, x, y, visible: active() && Number.isFinite(x + y) && scratch.z >= -1 && scratch.z <= 1 && x >= 18 && x <= width - 18 && y >= 18 && y <= height - 18 }
    })
    onLabels(labelPositions.map(label => ({ ...label })))
  }
  function updateCamera() {
    camera.position.copy(target).add(viewOffset)
    camera.lookAt(target)
    camera.zoom = zoom
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    if (controls) {
      syncingControls = true
      try { controls.target.copy(target); controls.update() }
      finally { syncingControls = false }
    }
    publishLabels()
  }
  function fitCamera() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      scratch.set(x, y, z)
      const px = scratch.dot(right), py = scratch.dot(up)
      minX = Math.min(minX, px); maxX = Math.max(maxX, px)
      minY = Math.min(minY, py); maxY = Math.max(maxY, py)
    }
    home.copy(right).multiplyScalar((minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2)
    const aspect = width / height
    homeSpan = Math.max(maxY - minY, (maxX - minX) / aspect) * 1.085
    camera.left = -homeSpan * aspect / 2
    camera.right = homeSpan * aspect / 2
    camera.top = homeSpan / 2
    camera.bottom = -homeSpan / 2
  }
  function inspectionBounds(id) {
    // Work surface, growing piles and nearby people; not the whole room's walls.
    // The vault envelope includes the VHS at the end of its carpet.
    const limits = id === 'newsletter'
      ? [[-7.5, .06, -1.85], [-3.1, Math.max(3.2, mailPapers.height + .2), 2.9]]
      : id === 'applications'
        ? [[3.2, .06, .28], [7.8, Math.max(3.15, dossierPapers.height + .2), 4.9]]
        : [[-2.05, .06, -5.5], [2.9, 4.5, .20]]
    return new THREE.Box3(new THREE.Vector3(...limits[0]), new THREE.Vector3(...limits[1]))
  }
  function inspectionView(id) {
    if (width >= 1120) {
      const target = new THREE.Vector3(...stations[id])
      // Keep the new foreground spill above the dock, not just the vault in view.
      if (id === 'beta') target.y -= .45
      return { target, zoom: Math.max(zoom, 2.35), rect: null }
    }
    // Keep these mobile drawer dimensions in sync with MemeBank.client.vue.
    // Controls occupy the top 64px, the sheet at most 46% of the actual canvas.
    const rect = window.innerWidth < 700
      ? { x: 12, y: 66, width: width - 24, height: Math.max(70, height - Math.min(300, height * .46) - 90) }
      : { x: 12, y: 66, width: Math.max(150, width - 438), height: height - 84 }
    const box = inspectionBounds(id)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      scratch.set(x, y, z)
      const px = scratch.dot(right), py = scratch.dot(up)
      minX = Math.min(minX, px); maxX = Math.max(maxX, px)
      minY = Math.min(minY, py); maxY = Math.max(maxY, py)
    }
    const fittedZoom = clamp(Math.min(3.1, .94 * rect.width * homeSpan / (height * (maxX - minX)), .94 * rect.height * homeSpan / (height * (maxY - minY))), MIN_ZOOM, MAX_ZOOM)
    const pixels = height / homeSpan * fittedZoom
    const destination = box.getCenter(new THREE.Vector3())
      .addScaledVector(right, (width / 2 - rect.x - rect.width / 2) / pixels)
      .addScaledVector(up, (rect.y + rect.height / 2 - height / 2) / pixels)
    return { target: destination, zoom: fittedZoom, rect }
  }
  function resize() {
    if (disposed || !renderer) return
    cancelCamera({ finish: true })
    const rect = container.getBoundingClientRect()
    hasSize = rect.width > 0 && rect.height > 0
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 500 ? 1.5 : 1.75))
    renderer.setSize(width, height, false)
    fitCamera()
    if (viewIsHome) { target.copy(home); zoom = 1 }
    else if (focusedStation) { const view = inspectionView(focusedStation); target.copy(view.target); zoom = view.zoom }
    updateCamera()
    lastTime = null
    if (controls) controls.enabled = active()
    if (!active()) stopFrame()
    else requestRender()
  }
  function cancelCamera({ finish = false } = {}) {
    if (!cameraFlight) return
    const flight = cameraFlight
    cameraFlight = null
    if (finish) { target.copy(flight.to); zoom = flight.zoom; updateCamera() }
    flight.resolve({ id: flight.id, cancelled: !finish })
  }
  function moveCamera(to, nextZoom, id = null) {
    cancelCamera()
    if (disposed) return Promise.resolve({ id, cancelled: true })
    if (!moving() || !active()) {
      target.copy(to); zoom = nextZoom; updateCamera(); requestRender()
      return Promise.resolve({ id, cancelled: false })
    }
    lastTime = null
    return new Promise(resolve => {
      cameraFlight = { id, from: target.clone(), to: to.clone(), fromZoom: zoom, zoom: nextZoom, elapsed: 0, resolve }
      requestRender()
    })
  }
  function clampTarget() {
    target.x = clamp(target.x, -12, 12)
    target.y = clamp(target.y, -5, 9)
    target.z = clamp(target.z, -10, 10)
  }
  function setupControls(canvas) {
    controls = new OrbitControls(camera, canvas)
    controls.enableRotate = false
    controls.enableDamping = false // demand-only rendering still works while paused
    controls.screenSpacePanning = true
    controls.minZoom = MIN_ZOOM
    controls.maxZoom = MAX_ZOOM
    controls.zoomSpeed = .85
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
    controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }
    const start = () => {
      cancelCamera()
      focusedStation = null
      viewIsHome = false
      canvas.style.cursor = 'grabbing'
    }
    const change = () => {
      if (disposed || syncingControls) return
      target.copy(controls.target)
      zoom = clamp(camera.zoom, MIN_ZOOM, MAX_ZOOM)
      clampTarget()
      updateCamera()
      requestRender()
    }
    const end = () => { canvas.style.cursor = 'grab' }
    controls.addEventListener('start', start)
    controls.addEventListener('change', change)
    controls.addEventListener('end', end)
    disposers.push(() => {
      controls.removeEventListener('start', start)
      controls.removeEventListener('change', change)
      controls.removeEventListener('end', end)
      // Three r180 installs this temporary listener when Control is held, but
      // disconnect only removes keydown. Unmount before keyup must clean it too.
      canvas.getRootNode().removeEventListener('keyup', controls._interceptControlUp, { capture: true })
      controls.dispose()
    })
    canvas.style.cursor = 'grab'
    updateCamera()
  }
  function render(time) {
    frameId = 0
    if (!active() || !renderer) return
    syncReducedMotion()
    const fast = dirty || transition || cameraFlight
    if (!fast && time - lastDraw < 1000 / 30 - .5) { scheduleNext(); return }
    const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .075)
    lastTime = time
    lastDraw = time
    dirty = false
    if (moving()) animateWorld(delta)
    if (cameraFlight) {
      cameraFlight.elapsed += delta
      const t = 1 - Math.pow(1 - clamp(cameraFlight.elapsed / .65, 0, 1), 3)
      target.lerpVectors(cameraFlight.from, cameraFlight.to, t)
      zoom = THREE.MathUtils.lerp(cameraFlight.fromZoom, cameraFlight.zoom, t)
      updateCamera()
      if (t >= 1) cancelCamera({ finish: true })
    }
    try { renderer.render(scene, camera); renderCount++ }
    catch (error) { renderFailed = true; stopFrame(); cancelCamera(); publishLabels(); onError(error); return }
    publishLabels()
    scheduleNext()
    if (needsReady) { needsReady = false; onReady() }
  }
  function syncReducedMotion() {
    const next = motionQuery?.matches ?? false
    if (next === reducedMotion) return
    reducedMotion = next
    lastTime = null
    if (reducedMotion) { settleTransition(); cancelCamera({ finish: true }); stopFrame() }
    dirty = true
  }
  function visibilityChanged() {
    stopFrame()
    if (controls) controls.enabled = active()
    if (!active()) cancelCamera({ finish: true })
    publishLabels()
    if (active()) requestRender()
  }
  function listen(targetObject, event, handler) {
    targetObject.addEventListener(event, handler)
    disposers.push(() => targetObject.removeEventListener(event, handler))
  }
  function contextLost(event) {
    event.preventDefault()
    if (disposed) return
    contextIsLost = true
    if (controls) controls.enabled = false
    stopFrame()
    cancelCamera()
    publishLabels()
    onError(new Error('Le contexte WebGL du hall a été interrompu.'))
  }
  function contextRestored() {
    if (disposed) return
    contextIsLost = false
    renderFailed = false
    needsReady = true
    textures.forEach(texture => { texture.needsUpdate = true })
    // A restore is a projection of saved state, never a second fanfare.
    settleTransition()
    cancelCamera({ finish: true })
    resize()
  }
  function setState(input, { animate = true } = {}) {
    if (disposed) return
    syncReducedMotion()
    const previous = state
    const next = normalizeState(input)
    const unchanged = JSON.stringify(previous) === JSON.stringify(next)
    state = next
    const mayAnimate = hasState && animate && moving() && active()
    hasState = true
    if (unchanged && mayAnimate) return
    const mail = !previous.completed.includes('newsletter') && state.completed.includes('newsletter')
    const stamped = !previous.completed.includes('applications') && state.completed.includes('applications')
    const beta = !previous.betaOpen && state.betaOpen
    const mailArrival = state.counts.newsletter > previous.counts.newsletter
    const dossierArrival = state.counts.applications > previous.counts.applications
    mailSeal.scale.set(.095, .025, .095)
    receiptSeal.scale.setScalar(1)
    if (mayAnimate) {
      transition = { from: { ...pose }, to: statePose(), mail, stamp: stamped, beta, mailArrival, dossierArrival, elapsed: 0, duration: beta ? 2.65 : mail ? 1.8 : stamped ? 1.45 : .72 }
    } else settleTransition()
    requestRender()
  }
  function setPaused(value) {
    if (disposed) return
    motionPaused = Boolean(value)
    stopFrame()
    if (motionPaused) { settleTransition(); cancelCamera({ finish: true }) }
    requestRender()
  }
  function focusStation(id) {
    const alias = { vault: 'beta', qualified: 'beta', admitted: 'beta', courrier: 'newsletter', dossiers: 'applications' }
    const station = alias[id] || id
    if (disposed || typeof station !== 'string' || !Object.hasOwn(stations, station)) return Promise.resolve({ id, cancelled: true })
    focusedStation = station
    viewIsHome = false
    const view = inspectionView(station)
    return moveCamera(view.target, clamp(view.zoom, MIN_ZOOM, MAX_ZOOM), station)
  }
  function resetView() {
    focusedStation = null
    viewIsHome = true
    return moveCamera(home, 1)
  }
  function zoomBy(factor) {
    if (disposed || !Number.isFinite(factor) || factor <= 0) return
    cancelCamera()
    focusedStation = null
    viewIsHome = false
    zoom = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM)
    updateCamera()
    requestRender()
  }
  // CSS pixel deltas, like pointer dragging; positive dx/dy moves scenery right/down.
  function panBy(dx, dy) {
    if (disposed || !Number.isFinite(dx) || !Number.isFinite(dy)) return
    cancelCamera()
    focusedStation = null
    viewIsHome = false
    const units = homeSpan / zoom / height
    target.addScaledVector(right, -dx * units).addScaledVector(up, dy * units)
    clampTarget()
    updateCamera()
    requestRender()
  }
  function getDebug() {
    const currentMail = getBankLoad(state.counts.newsletter, GOALS.newsletter)
    const currentDossiers = getBankLoad(state.counts.applications, GOALS.applications)
    const waitingByStation = { newsletter: 0, applications: 0 }
    customers.forEach(actor => { if (actor.body.visible) waitingByStation[actor.station]++ })
    return {
      renderCount, motionPaused, reducedMotion, frameScheduled: Boolean(frameId), contextIsLost,
      transitionProgress: transition ? clamp(transition.elapsed / transition.duration, 0, 1) : 1,
      mailLevel: pose.mail, stampLevel: pose.stamp, vaultAngle: vaultHinge?.rotation.y ?? 0,
      mailCount: state.counts.newsletter, applicationCount: state.counts.applications,
      mailOverflow: currentMail.overflow, dossierOverflow: currentDossiers.overflow,
      paperHeights: { mail: mailPapers?.height ?? 0, dossiers: dossierPapers?.height ?? 0 },
      pileHeights: { mail: mailPapers?.heights ?? [], dossiers: dossierPapers?.heights ?? [] },
      paperCounts: { mail: mailPapers?.count ?? 0, dossiers: dossierPapers?.count ?? 0 },
      waitingCount: waitingByStation.newsletter + waitingByStation.applications, waitingByStation,
      celebrations: { newsletter: Boolean(transition?.mail), applications: Boolean(transition?.stamp), beta: Boolean(transition?.beta) },
      arrivals: { newsletter: Boolean(transition?.mailArrival), applications: Boolean(transition?.dossierArrival) },
      employees: employees.map(actor => ({ id: actor.body.name, position: actor.body.getWorldPosition(new THREE.Vector3()).toArray(), yaw: actor.body.rotation.y, headPitch: actor.head.rotation.x })),
      betaOpen: state.betaOpen, vaultContents: 'VHS', vhs: tapes?.getDebug(),
      disposed, visible: active(), ambientTime, cameraFlying: Boolean(cameraFlight), focusedStation,
      controlsEnabled: controls?.enabled ?? false, rotationEnabled: controls?.enableRotate ?? false,
      labels: labelPositions.map(label => ({ ...label })),
      inspection: focusedStation && width < 1120 ? {
        rect: inspectionView(focusedStation).rect,
        corners: (() => {
          const box = inspectionBounds(focusedStation), points = []
          for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
            const point = new THREE.Vector3(x, y, z).project(camera)
            points.push({ x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2 })
          }
          return points
        })(),
      } : null,
      stations: Object.fromEntries(Object.entries(stations).map(([id, point]) => {
        const projected = new THREE.Vector3(...point).project(camera)
        return [id, { world: [...point], x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 }]
      })),
      view: { target: target.toArray(), zoom, width, height, span: homeSpan },
      worldBounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
      drawCalls: renderer?.info.render.calls ?? 0, triangles: renderer?.info.render.triangles ?? 0,
    }
  }
  function dispose() {
    if (disposed) return
    disposed = true
    stopFrame()
    transition = null
    cancelCamera()
    if (controls) controls.enabled = false
    publishLabels()
    disposers.splice(0).forEach(disposer => disposer())
    scene.traverse(object => { if (object.isInstancedMesh) object.dispose() })
    sun?.shadow.dispose()
    geometries.forEach(value => value.dispose())
    materials.forEach(value => value.dispose())
    textures.forEach(value => value.dispose())
    geometries.clear(); materials.clear(); textures.clear(); artwork.length = 0
    renderer?.dispose()
    renderer?.forceContextLoss()
    renderer?.domElement.remove()
    scene.clear()
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    const canvas = renderer.domElement
    canvas.setAttribute('data-bank-canvas', '')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)
    envelopePrint = envelopeMaterial()
    buildArchitecture()
    buildMail()
    buildDesk()
    buildCustomers()
    buildVault()
    batchRigid(scenery)
    applyPose(pose)
    quietEffects()
    updateCamera()
    setupControls(canvas)
    listen(canvas, 'webglcontextlost', contextLost)
    listen(canvas, 'webglcontextrestored', contextRestored)
    listen(document, 'visibilitychange', visibilityChanged)
    const motionChanged = () => { syncReducedMotion(); requestRender() }
    if (motionQuery?.addEventListener) listen(motionQuery, 'change', motionChanged)
    else if (motionQuery?.addListener) {
      motionQuery.addListener(motionChanged)
      disposers.push(() => motionQuery.removeListener(motionChanged))
    }
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resize)
      observer.observe(container)
      disposers.push(() => observer.disconnect())
    } else listen(window, 'resize', resize)
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(entries => {
        intersecting = entries[0]?.isIntersecting ?? true
        visibilityChanged()
      }, { threshold: .01 })
      observer.observe(container)
      disposers.push(() => observer.disconnect())
    }
    document.fonts?.ready.then(() => {
      if (disposed) return
      artwork.forEach(repaint => repaint())
      requestRender()
    })
    resize()
    target.copy(home)
    updateCamera()
  } catch (error) {
    dispose()
    onError(error)
    throw error
  }
  return { setState, setPaused, focusStation, resetView, zoomBy, panBy, getDebug, dispose }
}
