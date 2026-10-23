import * as THREE from 'three'
import { drySurfaceHeight, groundHeight, padExtrema, padPoint, terrainSegmentStops } from '../jarry-elevation.js'

/** Seat a small rigid vehicle on the local terrain plane, without changing the DEM. */
export function parkOnTerrain(group, site, footprint) {
  const angle = site.angle || 0, step = .03
  const dx = (groundHeight(site.x + step, site.z) - groundHeight(site.x - step, site.z)) / (2 * step)
  const dz = (groundHeight(site.x, site.z + step) - groundHeight(site.x, site.z - step)) / (2 * step)
  const up = new THREE.Vector3(-dx, 1, -dz).normalize()
  const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle))
  forward.addScaledVector(up, -forward.dot(up)).normalize()
  const right = new THREE.Vector3().crossVectors(up, forward).normalize()
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, forward))
  group.position.set(site.x, drySurfaceHeight(site.x, site.z), site.z)
  let lift = 0
  for (const x of [-.5, 0, .5]) for (const z of [-.5, 0, .5]) {
    const point = new THREE.Vector3(x * footprint.width, 0, z * footprint.depth).applyQuaternion(group.quaternion).add(group.position)
    lift = Math.max(lift, drySurfaceHeight(point.x, point.z) - point.y)
  }
  group.position.y += lift + .002
  return group.position.y
}

/** Short perimeter foundations bridge a landmark's rigid base to the unchanged terrain. */
export function seatOnTerrain(group, site, footprint, { round = false, color = 0xcfc6ad } = {}) {
  const pad = { ...footprint, angle: site.angle || 0 }
  const range = padExtrema(site, pad)
  const base = range.max + .006
  group.position.set(site.x, base, site.z)
  group.rotation.y = pad.angle
  const ring = footprint.outline || (round
    ? Array.from({ length: 24 }, (_, index) => [Math.cos(index * Math.PI / 12) * footprint.width / 2, Math.sin(index * Math.PI / 12) * footprint.depth / 2])
    : [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(([x, z]) => [x * footprint.width, z * footprint.depth]))
  const worldRing = ring.map(([x, z]) => padPoint(site, pad, x, z))
  const positions = [], indices = []
  for (let i = 0; i < worldRing.length; i++) {
    const a = worldRing[i], b = worldRing[(i + 1) % worldRing.length]
    const stops = terrainSegmentStops(a, b)
    for (let j = 1; j < stops.length; j++) {
      const at = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
      const p = at(stops[j - 1]), q = at(stops[j]), start = positions.length / 3
      positions.push(p[0], base, p[1], p[0], groundHeight(...p) - .006, p[1], q[0], groundHeight(...q) - .006, q[1], q[0], base, q[1])
      indices.push(start, start + 2, start + 1, start, start + 3, start + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const foundation = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }))
  foundation.name = `${group.name}-foundation`
  foundation.receiveShadow = true
  return { foundation, base, range }
}
