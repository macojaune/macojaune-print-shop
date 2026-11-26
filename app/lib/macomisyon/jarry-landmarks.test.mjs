import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { geography, WORLD_BOUNDS } from './jarry-geography.js'
import { DRY_SURFACE_LIFTS, drySurfaceHeight, groundHeight } from './jarry-elevation.js'
import surfaces from './data/jarry-surfaces.json' with { type: 'json' }
import { LANDMARK_SITES, REPLACED_BUILDING_IDS } from './jarry-landmark-sites.js'
import { createJarryLandmarks } from './jarry-landmarks.js'

function inRing(x, z, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[j]
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) inside = !inside
  }
  return inside
}
const contains = (x, z, polygon) => inRing(x, z, polygon.outer) && !polygon.holes.some(ring => inRing(x, z, ring))

test('MAGGMA replaces only the chosen small U and its whole base fits inside it', () => {
  const site = LANDMARK_SITES['maggma-studio']
  assert.deepEqual(site.replaceBuildings, ['way/131121970/0'])
  for (const rejected of ['way/344294859/0', 'way/131135266/0']) assert.equal(REPLACED_BUILDING_IDS.has(rejected), false, 'The rejected A/B buildings must remain')
  const source = geography.buildings.find(building => building.id === site.replaceBuildings[0])
  const landmarks = createJarryLandmarks({ 'maggma-studio': site })
  try {
    const outline = landmarks.counts.locations['maggma-studio'].footprint.outline
    for (let i = 0; i < outline.length; i++) for (let step = 0; step <= 20; step++) {
      const a = outline[i], b = outline[(i + 1) % outline.length], t = step / 20
      const dx = a[0] + (b[0] - a[0]) * t, dz = a[1] + (b[1] - a[1]) * t
      const x = site.x + dx * Math.cos(site.angle) + dz * Math.sin(site.angle)
      const z = site.z - dx * Math.sin(site.angle) + dz * Math.cos(site.angle)
      assert.ok(contains(x, z, source), 'The volcano leaves its source footprint')
    }
  } finally { landmarks.dispose() }
})

test('new landmark footprints stay on mapped dry land and preserve neighbouring buildings and vegetation', () => {
  const landmarks = createJarryLandmarks(LANDMARK_SITES)
  try {
    for (const [id, site] of Object.entries(LANDMARK_SITES)) {
      const { footprint } = landmarks.counts.locations[id], angle = site.angle || 0
      for (let u = 0; u <= 12; u++) for (let v = 0; v <= 12; v++) {
        const dx = (u / 12 - .5) * footprint.width, dz = (v / 12 - .5) * footprint.depth
        // The volcano occupies its outline, not the whole bounding rectangle.
        if (footprint.outline && !inRing(dx, dz, footprint.outline)) continue
        const x = site.x + dx * Math.cos(angle) + dz * Math.sin(angle)
        const z = site.z - dx * Math.sin(angle) + dz * Math.cos(angle)
        assert.ok(x > WORLD_BOUNDS.minX && x < WORLD_BOUNDS.maxX && z > WORLD_BOUNDS.minZ && z < WORLD_BOUNDS.maxZ, `${id}: outside map crop`)
        assert.ok(geography.land.some(polygon => contains(x, z, polygon)), `${id}: outside land`)
        assert.ok(!geography.water.some(polygon => contains(x, z, polygon)), `${id}: in water`)
        assert.ok(!geography.vegetation.some(polygon => contains(x, z, polygon)), `${id}: in vegetation`)
        assert.ok(!geography.buildings.some(polygon => !site.replaceBuildings.includes(polygon.id) && contains(x, z, polygon)), `${id}: intersects an unrelated building`)
        for (const road of geography.roads) for (let i = 1; i < road.points.length; i++) {
          const a = road.points[i - 1], b = road.points[i], sx = b[0] - a[0], sz = b[1] - a[1]
          const t = Math.max(0, Math.min(1, ((x - a[0]) * sx + (z - a[1]) * sz) / (sx * sx + sz * sz || 1)))
          assert.ok(Math.hypot(x - a[0] - t * sx, z - a[1] - t * sz) > .26, `${id}: within five metres of a road axis`)
        }
      }
    }
    assert.equal(geography.buildings.filter(building => REPLACED_BUILDING_IDS.has(building.id)).length, REPLACED_BUILDING_IDS.size)
    assert.equal(LANDMARK_SITES.kokolo.replaceBuildings.length, 0)
    assert.equal(LANDMARK_SITES.omasla.replaceBuildings.length, 0)
  } finally { landmarks.dispose() }
})

test('the parked car follows its terrain and hidden markers cannot reserve overview label space', () => {
  const landmarks = createJarryLandmarks(LANDMARK_SITES)
  try {
    const car = landmarks.group.getObjectByName('kokolo-landmark')
    car.updateWorldMatrix(true, true)
    for (const wheel of car.children.filter(child => child.name.startsWith('tyre-'))) {
      const contact = car.localToWorld(new THREE.Vector3(wheel.position.x, 0, wheel.position.z))
      const clearance = contact.y - drySurfaceHeight(contact.x, contact.z)
      assert.ok(clearance >= -1e-6 && clearance < .004, `Tyre visible-surface clearance ${clearance}`)
    }
    const marker = landmarks.markers.find(marker => marker.id === 'kokolo')
    assert.equal(marker.selectedOnly, true)
    assert.ok(marker.labelOffset >= 24, 'The marker stem must leave the small car visible')
    for (const [id, target] of Object.entries(landmarks.targets)) {
      assert.ok(target.toArray().every(Number.isFinite), `${id}: invalid camera target`)
      assert.ok(Math.abs(target.y - landmarks.counts.locations[id].y) < 1e-8)
    }
  } finally { landmarks.dispose() }
})

test('the four tyres clear the actual exported industrial mesh, not just the DEM', () => {
  const landmarks = createJarryLandmarks(LANDMARK_SITES)
  const meshes = surfaces.layers.industrial.map(surface => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(surface.positions.map((value, index) => value / 20 + (index % 3 === 1 ? DRY_SURFACE_LIFTS.industrial : 0)), 3))
    geometry.setIndex(surface.indices)
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
    mesh.updateMatrixWorld()
    return mesh
  })
  try {
    const car = landmarks.group.getObjectByName('kokolo-landmark')
    car.updateWorldMatrix(true, true)
    for (const wheel of car.children.filter(child => child.name.startsWith('tyre-'))) {
      const contact = car.localToWorld(new THREE.Vector3(wheel.position.x, 0, wheel.position.z))
      const ray = new THREE.Raycaster(new THREE.Vector3(contact.x, 10, contact.z), new THREE.Vector3(0, -1, 0))
      const hit = ray.intersectObjects(meshes, false)[0]
      assert.ok(hit, 'The car actually sits on the industrial overlay')
      assert.ok(contact.y >= hit.point.y && contact.y - hit.point.y < .004, 'A tyre intersects or floats above the rendered ground')
    }
  } finally {
    landmarks.dispose()
    meshes.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose() })
  }
})

test('all foundations join the terrain and every new GPU resource is disposed exactly once', () => {
  const landmarks = createJarryLandmarks(LANDMARK_SITES)
  const resources = new Set()
  let foundations = 0
  landmarks.group.traverse(object => {
    if (!object.isMesh) return
    resources.add(object.geometry)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) resources.add(material)
    if (!object.name.endsWith('-foundation')) return
    foundations++
    const points = object.geometry.attributes.position
    for (let start = 0; start < points.count; start += 4) {
      for (const index of [start + 1, start + 2]) {
        const height = groundHeight(points.getX(index), points.getZ(index))
        assert.ok(Math.abs(points.getY(index) - (height - .006)) < .0001)
        assert.ok(points.getY(start) >= height - .0001)
      }
    }
  })
  assert.equal(foundations, Object.keys(LANDMARK_SITES).length - 1)
  const disposed = new Map([...resources].map(resource => [resource, 0]))
  resources.forEach(resource => resource.addEventListener('dispose', () => disposed.set(resource, disposed.get(resource) + 1)))
  landmarks.dispose()
  landmarks.dispose()
  assert.ok([...disposed.values()].every(count => count === 1))
  assert.equal(landmarks.group.children.length, 0)
})
