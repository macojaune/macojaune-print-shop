import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createVhsArchives } from './tapes.js'

function fixture() {
  const root = new THREE.Group()
  const geometries = new Map(), materials = new Map(), artwork = []
  const geometry = (key, make) => { if (!geometries.has(key)) geometries.set(key, make()); return geometries.get(key) }
  const material = color => {
    if (color?.isMaterial) return color
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .78 }))
    return materials.get(color)
  }
  const group = (parent, position = [0, 0, 0]) => {
    const object = new THREE.Group(); object.position.set(...position); parent.add(object); return object
  }
  const mesh = (parent, shape, color, position = [0, 0, 0]) => {
    const object = new THREE.Mesh(shape, material(color))
    object.position.set(...position); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object
  }
  // Match world.js, including bevel bounds; the old cube-only fixture hid floats.
  const box = (parent, size, position, color, bevel = 0) => {
    let geo
    if (bevel) {
      const [w, h, d] = size, r = Math.min(bevel, w * .2, h * .2, d * .2)
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
    const object = mesh(parent, geo, color, position)
    if (!bevel) object.scale.set(...size)
    return object
  }
  const disc = (parent, radius, depth, position, color, segments = 40) => {
    const object = mesh(parent, geometry('cylinder:' + segments + ':1', () => new THREE.CylinderGeometry(1, 1, 1, segments)), color, position)
    object.scale.set(radius, depth, radius); object.rotation.x = Math.PI / 2; return object
  }
  const painted = (draw, width, height) => {
    const commands = []
    const context = { font: '', fillStyle: '', strokeStyle: '', lineWidth: 1, textAlign: 'left', textBaseline: 'alphabetic' }
    for (const method of ['fillRect', 'strokeRect', 'beginPath', 'closePath', 'rect', 'clip', 'arc', 'moveTo', 'lineTo', 'fill', 'stroke', 'save', 'restore', 'fillText']) {
      context[method] = (...args) => commands.push({
        method, args,
        ...(['fillRect', 'fill', 'fillText'].includes(method) ? { fillStyle: context.fillStyle } : {}),
        ...(['strokeRect', 'stroke'].includes(method) ? { strokeStyle: context.strokeStyle, lineWidth: context.lineWidth } : {}),
        ...(method === 'fillText' ? { font: context.font, textAlign: context.textAlign, textBaseline: context.textBaseline } : {}),
      })
    }
    const result = new THREE.MeshStandardMaterial({ roughness: .91, side: THREE.DoubleSide })
    materials.set('art:' + artwork.length, result)
    const repaint = () => { commands.length = 0; context.font = ''; draw(context, width, height) }
    repaint()
    artwork.push({ width, height, commands, repaint, material: result })
    return result
  }
  // A world helper may already own "plane" with entirely different dimensions.
  const unrelatedPlane = geometry('plane', () => new THREE.PlaneGeometry(3, 2))
  const palette = { ink: 0x253e3b, deepInk: 0x172d2c, paper: 0xf4ead3, steelLight: 0xb5c4b9, brass: 0xb98b43 }
  const result = createVhsArchives({ root, group, box, mesh, disc, geometry, painted, palette })
  return {
    ...result, root, geometries, materials, artwork, unrelatedPlane,
    dispose: () => { geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()) },
  }
}

const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-7, message ?? (actual + ' != ' + expected))
const round = value => Math.round(value * 1e6) / 1e6
const at = (scene, index, t) => { scene.update(.46 + index * .03 + t * .35); return scene.getDebug().poses[index] }
const finalPositions = [
  [1.45, .1971, .67], [.02, .1174, -.22], [2.84, .1188, -.30],
  [1.46, .1705, -.43], [.21, .1146, .80], [2.81, .116, .88], [1.45, .1677, 1.54],
]
const finalYaws = [.32, -.65, 1.12, -.10, 1.60, 1.30, -.12]
const scales = [1.28, .82, .84, .90, .78, .80, .86]
const impacts = [.74, .72, .76, .73, .75, .72, .74]

function withScene(run) {
  const scene = fixture()
  try { run(scene) } finally { scene.dispose() }
}

test('The vault retains 35 archived VHS and exposes seven independent spill groups', () => withScene(scene => {
  const archived = [], all = []
  scene.archives.traverse(object => { if (object.name === 'vhs-cassette') archived.push(object) })
  scene.root.traverse(object => { if (object.name === 'vhs-cassette') all.push(object) })
  assert.equal(archived.length, 35)
  assert.equal(all.length, 42)
  assert.equal(scene.spillTapes.length, 7)
  assert.equal(scene.heroTape, scene.spillTapes[0])
  scene.spillTapes.forEach((tape, i) => {
    assert.equal(tape.parent, scene.root)
    assert.equal(tape.userData.spillIndex, i)
    assert.equal(tape.scale.x, scales[i])
  })
  assert.equal(scene.getDebug().archivedCount, 35)
  assert.equal(scene.getDebug().spillCount, 7)
}))

test('Every VHS has a thin bevelled black shell, seams, top flap and a +Z printed face', () => withScene(scene => {
  scene.root.traverse(tape => {
    if (tape.name !== 'vhs-cassette') return
    const model = tape.userData.vhs
    assert.deepEqual(model.dimensions, [1, .55, .14])
    assert.equal(model.format, 'VHS')
    assert.equal(model.face, '+Z')
    assert.equal(model.windowCount, 2)
    assert.equal(model.reelColor, 'brown-black')
    assert.equal(model.hubColor, 'cream')
    assert.ok(model.hubToReelRatio < .3)
    assert.equal(model.hubTeeth, 12)
    assert.equal(model.windowFinish, 'smoked')
    const halves = tape.children.filter(child => child.name === 'vhs-shell-half')
    assert.equal(halves.length, 2)
    assert.ok(halves.every(half => half.geometry.type === 'ExtrudeGeometry' && half.material.roughness >= .78))
    const shellBounds = new THREE.Box3()
    halves.forEach(half => {
      half.updateMatrix(); half.geometry.computeBoundingBox()
      shellBounds.union(half.geometry.boundingBox.clone().applyMatrix4(half.matrix))
    })
    const size = shellBounds.getSize(new THREE.Vector3()).toArray()
    size.forEach((value, i) => near(value, model.dimensions[i]))
    assert.ok(tape.children.some(child => child.name === 'vhs-shell-seam'))
    assert.ok(tape.children.some(child => child.name === 'vhs-top-flap'))
    assert.equal(tape.children.filter(child => child.name === 'vhs-side-grip').length, 8)
    const face = tape.children.find(child => child.name === 'vhs-printed-face')
    assert.equal(face.material, scene.artwork[0].material)
    assert.equal(face.position.z, .0704)
    assert.notEqual(face.geometry, scene.unrelatedPlane)
    assert.equal(face.castShadow, false)
  })
  assert.ok(scene.geometries.has('vhs:front-plane:1x1'))
}))

test('A shared procedural face paints two rectangular smoked windows and large short labels', () => withScene(scene => {
  assert.equal(scene.artwork.length, 1)
  const artwork = scene.artwork[0]
  assert.deepEqual([artwork.width, artwork.height], [1024, 544])
  assert.equal(artwork.material.transparent, false)
  const windows = artwork.commands.filter(command => command.method === 'rect')
  assert.deepEqual(windows.map(command => command.args), [[106, 82, 304, 244], [614, 82, 304, 244]])
  const text = artwork.commands.filter(command => command.method === 'fillText')
  assert.deepEqual(text.map(command => command.args[0]), ['MÈMES', 'VHS'])
  assert.match(text[0].font, /142px "Space Grotesk"/)
  assert.match(text[1].font, /Tanker/)
  assert.ok(text[0].args[3] > artwork.width * .6)
  assert.equal(scene.getDebug().model.label, 'MÈMES')
  assert.equal(scene.getDebug().model.marking, 'VHS')
  const previous = structuredClone(artwork.commands)
  artwork.repaint() // The world calls this after document.fonts.ready.
  assert.deepEqual(artwork.commands, previous)
}))

test('Closed construction and update(0) hide all tapes and restore clean origins', () => withScene(scene => {
  const initial = scene.getDebug()
  assert.equal(scene.archives.visible, false)
  assert.equal(initial.visibleSpillCount, 0)
  for (const pose of initial.poses) {
    assert.equal(pose.visible, false)
    assert.ok(pose.position[2] < -1.6)
    assert.ok(pose.position[1] >= .75 && pose.position[1] <= 1.2)
  }
  scene.update(1); scene.update(0)
  assert.deepEqual(scene.getDebug(), initial)
  scene.update(.025)
  assert.equal(scene.archives.visible, false)
  scene.update(.026)
  assert.equal(scene.archives.visible, true)
  assert.equal(scene.getDebug().visibleSpillCount, 0)
}))

test('Seven releases stagger at .46 + .03i rather than travelling as one block', () => withScene(scene => {
  for (let i = 0; i < 7; i++) {
    const start = .46 + i * .03
    scene.update(start)
    assert.equal(scene.getDebug().visibleSpillCount, i)
    scene.update(start + .001)
    assert.equal(scene.getDebug().visibleSpillCount, i + 1)
    near(scene.getDebug().poses[i].start, start)
    assert.equal(scene.getDebug().poses[i].duration, .35)
  }
  scene.update(.65)
  const poses = scene.getDebug().poses
  assert.equal(new Set(poses.map(pose => round(pose.rotation[0]))).size, 7)
  assert.equal(new Set(poses.map(pose => round(pose.position[1]))).size, 7)
}))

test('Each VHS drops parabolically, tips, rebounds once and brakes its short final slide', () => withScene(scene => {
  for (let i = 0; i < 7; i++) {
    const initial = at(scene, i, 0)
    const early = at(scene, i, impacts[i] * .25)
    const middle = at(scene, i, impacts[i] * .5)
    const late = at(scene, i, impacts[i] * .75)
    assert.ok(initial.position[1] > early.position[1] && early.position[1] > middle.position[1] && middle.position[1] > late.position[1])
    near(initial.position[1] - middle.position[1], 4 * (initial.position[1] - early.position[1]))
    assert.ok(early.position[2] < middle.position[2] && middle.position[2] < late.position[2])
    assert.ok(Math.abs(early.rotation[0] - late.rotation[0]) > .3)
    const contact = at(scene, i, impacts[i])
    const rebound = at(scene, i, impacts[i] + .09)
    const settled = at(scene, i, impacts[i] + .181)
    near(contact.position[1], finalPositions[i][1])
    assert.ok(rebound.position[1] > contact.position[1] + .04)
    near(settled.position[1], contact.position[1])
    const slideA = at(scene, i, .96), slideB = at(scene, i, .98), final = at(scene, i, 1)
    assert.ok(slideB.position[2] > slideA.position[2])
    assert.ok(final.position[2] - slideB.position[2] < slideB.position[2] - slideA.position[2])
    near(final.position[1], finalPositions[i][1])
    near(final.rotation[0], -Math.PI / 2)
  }
}))

test('All seven final poses are fixed, separated and supported by real rug or tile surfaces', () => withScene(scene => {
  scene.update(1)
  const debug = scene.getDebug()
  assert.equal(debug.visibleSpillCount, 7)
  assert.equal(scene.archives.visible, true)
  assert.deepEqual(debug.poses.map(pose => pose.position.map(round)), finalPositions)
  debug.poses.forEach((pose, i) => {
    assert.deepEqual(pose.rotation, [-Math.PI / 2, 0, finalYaws[i]])
    assert.equal(pose.visible, true)
  })
  const boxes = scene.spillTapes.map(tape => new THREE.Box3().setFromObject(tape))
  boxes.forEach((box, i) => {
    near(box.min.y, debug.poses[i].supportY)
    assert.ok(box.min.x >= -.5 && box.max.x <= 3.3)
    assert.ok(box.min.z >= -.9 && box.max.z <= 2.05)
    if (debug.poses[i].supportY === .06) assert.ok(box.max.x < .52 || box.min.x > 2.38)
    else {
      assert.ok(box.min.x > .6525 && box.max.x < 2.2475, 'clear the raised rug borders')
      assert.ok(box.min.z > -1.34 && box.max.z < 1.83, 'fully supported by the runner')
    }
    for (let j = i + 1; j < boxes.length; j++) assert.equal(box.intersectsBox(boxes[j]), false, 'no floating/intersecting stack ' + i + '/' + j)
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(scene.spillTapes[i].quaternion)
    near(normal.y, 1)
  })
}))

test('Saved, reduced-motion, paused and rewound projections all restore the same final state', () => withScene(scene => {
  scene.update(1)
  const final = scene.getDebug()
  for (const open of [.9, .47, .76, 0, .65, .51, .99, .3, 1]) scene.update(open)
  assert.deepEqual(scene.getDebug(), final)
  scene.update(0); scene.update(1)
  assert.deepEqual(scene.getDebug(), final)
  for (let i = 0; i <= 100; i++) scene.update(i / 100)
  assert.deepEqual(scene.getDebug(), final)
  const fresh = fixture()
  try { fresh.update(1); assert.deepEqual(fresh.getDebug(), final) } finally { fresh.dispose() }
  final.poses[0].position[0] = 900
  final.model.dimensions[0] = 900
  assert.equal(scene.getDebug().poses[0].position[0], 1.45)
  assert.equal(scene.getDebug().model.dimensions[0], 1)
}))

test('Non-finite and invalid inputs cannot leak NaN into visibility or transform matrices', () => withScene(scene => {
  for (const invalid of [NaN, Infinity, -Infinity, undefined, null, '1', {}, [], true, 1n, Symbol('open')]) {
    scene.update(1)
    assert.doesNotThrow(() => scene.update(invalid))
    assert.equal(scene.getDebug().open, 0)
    assert.equal(scene.getDebug().visibleSpillCount, 0)
    scene.root.updateMatrixWorld(true)
    scene.root.traverse(object => assert.ok(object.matrixWorld.elements.every(Number.isFinite)))
  }
  scene.update(-10); assert.equal(scene.getDebug().open, 0)
  scene.update(10); assert.equal(scene.getDebug().open, 1)
  assert.equal(scene.getDebug().visibleSpillCount, 7)
}))

test('Spill updates allocate no geometry, material or texture resources', () => withScene(scene => {
  const before = [scene.geometries.size, scene.materials.size, scene.artwork.length]
  let meshes = 0, triangles = 0
  scene.heroTape.traverse(object => {
    if (!object.isMesh) return
    meshes++
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3
  })
  assert.equal(meshes, 13)
  assert.ok(triangles < 250)
  for (let i = 0; i <= 100; i++) scene.update(i / 100)
  assert.deepEqual([scene.geometries.size, scene.materials.size, scene.artwork.length], before)
  assert.equal(scene.artwork.length, 1)
  assert.ok(scene.materials.size <= 5)
}))
