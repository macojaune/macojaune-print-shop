import * as THREE from 'three'
import elevation from './data/jarry-elevation.json' with { type: 'json' }
import { METRES_PER_UNIT } from './jarry-geography.js'
import { groundHeight } from './jarry-elevation.js'

const { minX, minZ, stepX, stepZ, columns, rows } = elevation.grid
const EPSILON = 1e-10

// Vertices carry [gridX, gridZ, centreY, centreGround, distance, clearance].
// Interpolate these attributes on shared edges, never from a nearest-centre lookup.
function splitPolygon(polygon, coordinate, boundary) {
  const distances = polygon.map(vertex => coordinate(vertex) - boundary)
  if (!distances.some(value => value < -EPSILON) || !distances.some(value => value > EPSILON)) return [polygon]
  const negative = [], positive = []
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length]
    const da = distances[i], db = distances[(i + 1) % polygon.length]
    if (da <= EPSILON) negative.push(a)
    if (da >= -EPSILON) positive.push(a)
    if ((da < -EPSILON && db > EPSILON) || (da > EPSILON && db < -EPSILON)) {
      const t = da / (da - db)
      const intersection = a.map((value, axis) => value + (b[axis] - value) * t)
      negative.push(intersection)
      positive.push(intersection)
    }
  }
  return [negative, positive]
}

function cutAt(polygons, coordinate, boundary) {
  return polygons.flatMap(polygon => splitPolygon(polygon, coordinate, boundary))
}

function terrainFragments(triangle) {
  let polygons = [triangle]
  // The finite X/Z boundaries also cover the sampler's clamped exterior. Extra
  // diagonal cuts there are harmless; no terrain break is left inside a face.
  for (const [coordinate, first, last] of [
    [vertex => vertex[0], 0, columns - 1],
    [vertex => vertex[1], 0, rows - 1],
    [vertex => vertex[0] - vertex[1], -Infinity, Infinity],
  ]) {
    const values = triangle.map(coordinate)
    const lower = Math.max(first, Math.ceil(Math.min(...values)))
    const upper = Math.min(last, Math.floor(Math.max(...values)))
    for (let boundary = lower; boundary <= upper; boundary++) polygons = cutAt(polygons, coordinate, boundary)
  }
  return polygons
}

function ribbonTriangles(a, b, bridge) {
  const [leftA, centreA, rightA] = a, [leftB, centreB, rightB] = b
  const original = [[leftA, leftB, rightA], [rightA, leftB, rightB]]
  if (!bridge) return original

  const corners = [leftA, leftB, rightB, rightA]
  const turns = corners.map((p, i) => {
    const q = corners[(i + 1) % 4], r = corners[(i + 2) % 4]
    return (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0])
  })
  if (turns.every(turn => turn <= 0) || turns.every(turn => turn >= 0)) {
    // On a convex strip, these four faces partition the original footprint.
    return [[leftA, leftB, centreA], [centreA, leftB, centreB], [centreA, centreB, rightA], [rightA, centreB, rightB]]
  }

  // A short miter can fold across the next section. Changing its diagonal then
  // removes part of the original footprint. Insert the axis inside each of the
  // original triangles instead, preserving their coverage (including overlaps).
  const dx = centreB[0] - centreA[0], dz = centreB[1] - centreA[1]
  const squared = dx * dx + dz * dz, length = Math.sqrt(squared)
  const side = vertex => ((vertex[0] - centreA[0]) * dz - (vertex[1] - centreA[1]) * dx) / length
  return original.flatMap(triangle => splitPolygon(triangle, side, 0).flatMap(polygon => {
    const vertices = polygon.map(vertex => {
      if (Math.abs(side(vertex)) > EPSILON) return vertex
      const t = THREE.MathUtils.clamp(((vertex[0] - centreA[0]) * dx + (vertex[1] - centreA[1]) * dz) / squared, 0, 1)
      // Axis intersections constrain the actual centre profile, even when the
      // original diagonal's interpolated longitudinal attributes differ.
      return vertex.map((value, axis) => axis < 2 ? value : centreA[axis] + (centreB[axis] - centreA[axis]) * t)
    })
    return vertices.slice(2).map((vertex, i) => [vertices[0], vertices[i + 1], vertex])
  }))
}

/**
 * A road footprint with the existing horizontal miters, cut along every DEM
 * triangle boundary. Input centres must already be sampled by roadPoints /
 * terrainSegmentStops; their Y values and the existing bridge arch are retained.
 * Returns an empty BufferGeometry for fewer than two distinct centres.
 */
export function roadRibbonGeometry(points, width, { bridge = false } = {}) {
  const geometry = new THREE.BufferGeometry()
  const positions = [], indices = []
  const centres = points.filter((point, i) => !i || point.x !== points[i - 1].x || point.z !== points[i - 1].z)
  const distances = [0]
  for (let i = 1; i < centres.length; i++) {
    distances.push(distances[i - 1] + Math.hypot(centres[i].x - centres[i - 1].x, centres[i].z - centres[i - 1].z))
  }
  const length = distances.at(-1)
  // Both approaches get a transition, including on bridges shorter than 20 m.
  const transition = Math.min(length / 3, Math.max(width * 2, 1))
  const grounds = centres.map(point => groundHeight(point.x, point.z))
  const clearance = centres.length ? Math.min(centres[0].y - grounds[0], centres.at(-1).y - grounds.at(-1)) : 0

  const sections = centres.map((point, i) => {
    const before = centres[Math.max(0, i - 1)], after = centres[Math.min(centres.length - 1, i + 1)]
    const incoming = new THREE.Vector2(point.x - before.x, point.z - before.z)
    const outgoing = new THREE.Vector2(after.x - point.x, after.z - point.z)
    if (!incoming.lengthSq()) incoming.copy(outgoing)
    if (!outgoing.lengthSq()) outgoing.copy(incoming)
    incoming.normalize()
    outgoing.normalize()
    const normal = new THREE.Vector2(-incoming.y - outgoing.y, incoming.x + outgoing.x)
    if (!normal.lengthSq()) normal.set(-outgoing.y, outgoing.x)
    normal.normalize()
    const denominator = Math.abs(normal.dot(new THREE.Vector2(-outgoing.y, outgoing.x)))
    const offset = Math.min(width * 0.5 / Math.max(denominator, 0.25), width)
    return [1, 0, -1].map(side => [
      ((point.x + normal.x * offset * side) * METRES_PER_UNIT - minX) / stepX,
      ((point.z + normal.y * offset * side) * METRES_PER_UNIT - minZ) / stepZ,
      point.y, grounds[i], distances[i], point.y - grounds[i],
    ])
  })

  function position(vertex) {
    const [gx, gz, centreY, centreGround, distance, offset] = vertex
    const x = (minX + gx * stepX) / METRES_PER_UNIT, z = (minZ + gz * stepZ) / METRES_PER_UNIT
    const ground = groundHeight(x, z)
    let y = ground + offset
    if (bridge) {
      const t = THREE.MathUtils.clamp(Math.min(distance, length - distance) / transition, 0, 1)
      const drape = 1 - t * t * (3 - 2 * t)
      // At an abutment this is exactly ground + clearance across the entire
      // width. Inside, flatten where possible, but never sink an uphill edge.
      y = Math.max(centreY + (ground - centreGround) * drape, ground + clearance)
    }
    return [Math.fround(x), Math.fround(y), Math.fround(z)]
  }

  function emit(polygon) {
    const vertices = polygon.map(position)
    const start = positions.length / 3
    const faces = []
    for (let i = 1; i < vertices.length - 1; i++) {
      const [a, b, c] = [vertices[0], vertices[i], vertices[i + 1]]
      const area = (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0])
      // Grid corners can collapse after Float32 conversion. Do not emit them,
      // and keep the visible face upward even at a folded, very short miter.
      if (Math.abs(area) <= 1e-14) continue
      faces.push(...(area < 0 ? [start, start + i, start + i + 1] : [start, start + i + 1, start + i]))
    }
    if (!faces.length) return
    for (const vertex of vertices) positions.push(...vertex)
    indices.push(...faces)
  }

  for (let i = 1; width > 0 && i < sections.length; i++) {
    // The centreline is a real mesh edge on bridges, so draping either side
    // cannot accidentally change the supplied longitudinal deck profile.
    for (const triangle of ribbonTriangles(sections[i - 1], sections[i], bridge)) {
      let polygons = terrainFragments(triangle)
      if (bridge) {
        for (const distance of [transition / 2, transition, length - transition, length - transition / 2]) {
          polygons = cutAt(polygons, vertex => vertex[4], distance)
        }
      }
      for (const polygon of polygons) emit(polygon)
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
