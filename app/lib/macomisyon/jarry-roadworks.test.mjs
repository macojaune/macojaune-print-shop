import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { geography } from './jarry-geography.js'
import { groundHeight, ROAD_SURFACE_LIFT } from './jarry-elevation.js'
import { createJarryRoadworks, ROADWORK_SITES } from './jarry-roadworks.js'

test('the two closures span their mapped roads and the rubble reaches four metres above the road', () => {
  const works = createJarryRoadworks()
  works.group.updateMatrixWorld(true)
  const ray = new THREE.Raycaster()
  try {
    assert.equal(works.counts.sites, 2)
    for (const [id, site] of Object.entries(ROADWORK_SITES)) {
      const road = geography.roads.find(road => road.id === site.roadId)
      assert.ok(road && !road.bridge)
      const halfWidth = id === 'mangrove-rubble' ? .38 / 2 : .18 / 2
      const model = works.group.getObjectByName(id)
      for (let step = -10; step <= 10; step++) {
        const across = halfWidth * step / 10
        const x = site.x + across * Math.cos(site.angle), z = site.z - across * Math.sin(site.angle)
        ray.set(new THREE.Vector3(x, 10, z), new THREE.Vector3(0, -1, 0))
        const hits = ray.intersectObject(model, true)
        assert.ok(hits.length, `${id}: uncovered road cross-section at ${across}`)
        assert.ok(hits[0].point.y > groundHeight(x, z) + ROAD_SURFACE_LIFT + .02, 'The obstruction rises above the actual road')
      }
      let highestAboveRoad = -Infinity
      model.traverse(object => {
        if (!object.isMesh) return
        const p = object.geometry.getAttribute('position')
        for (let i = 0; i < p.count; i++) highestAboveRoad = Math.max(highestAboveRoad, p.getY(i) - groundHeight(p.getX(i), p.getZ(i)) - ROAD_SURFACE_LIFT)
      })
      assert.ok(Math.abs(highestAboveRoad - (id === 'mangrove-rubble' ? .2 : .05)) < 1e-6)
    }
  } finally { works.dispose() }
})

test('all owned roadwork resources are released once, without shared resources between worlds', () => {
  const a = createJarryRoadworks(), b = createJarryRoadworks()
  const resources = new Map(), other = new Set()
  a.group.traverse(object => {
    if (!object.isMesh) return
    for (const resource of [object.geometry, ...[].concat(object.material)]) resources.set(resource, 0)
  })
  b.group.traverse(object => { if (object.isMesh) [object.geometry, ...[].concat(object.material)].forEach(resource => other.add(resource)) })
  for (const resource of resources.keys()) {
    assert.equal(other.has(resource), false)
    resource.addEventListener('dispose', () => resources.set(resource, resources.get(resource) + 1))
  }
  a.dispose()
  a.dispose()
  for (const count of resources.values()) assert.equal(count, 1)
  assert.equal(a.group.children.length, 0)
  assert.equal(b.group.children.length, 2)
  b.dispose()
})
