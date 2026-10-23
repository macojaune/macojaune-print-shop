import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import elevation from './data/jarry-elevation.json' with { type: 'json' }
import { geography, METRES_PER_UNIT } from './jarry-geography.js'
import { groundHeight, terrainSegmentStops } from './jarry-elevation.js'
import { roadRibbonGeometry } from './jarry-roads.js'

const ROAD_Y = 0.025
const HEIGHT_TOLERANCE = 0.001 / METRES_PER_UNIT // 1 mm, including Float32 conversion.
const GRID_TOLERANCE = 1e-5
const WIDTHS = { trunk: 0.46, trunk_link: 0.30, primary: 0.38, primary_link: 0.28, secondary: 0.32, secondary_link: 0.25, tertiary: 0.30, tertiary_link: 0.23, residential: 0.26, unclassified: 0.26, living_street: 0.22, service: 0.18, construction: 0.18 }

// Supply the current roadPoints contract: exact DEM breakpoints, 50 cm above
// ground, with the existing longitudinal bridge arch. This test owns no terrain.
function centreline(road) {
  const points = road.points.filter((p, i, all) => !i || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1])
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]))
  const length = lengths.reduce((sum, value) => sum + value, 0)
  const start = groundHeight(...points[0]), end = groundHeight(...points.at(-1))
  let distance = 0
  const result = []
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    for (const t of terrainSegmentStops(a, b).slice(0, -1)) {
      const progress = (distance + lengths[i - 1] * t) / length
      const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t
      const ground = groundHeight(x, z)
      const y = road.bridge ? Math.max(ground, start + (end - start) * progress + Math.sin(progress * Math.PI) * 0.12) : ground
      result.push(new THREE.Vector3(x, y + ROAD_Y, z))
    }
    distance += lengths[i - 1]
  }
  result.push(new THREE.Vector3(points.at(-1)[0], end + ROAD_Y, points.at(-1)[1]))
  return result
}

function triangles(geometry, visit) {
  const position = geometry.getAttribute('position'), index = geometry.getIndex()
  for (let i = 0; i < index.count; i += 3) {
    const vertices = [0, 1, 2].map(offset => {
      const n = index.getX(i + offset)
      return [position.getX(n), position.getY(n), position.getZ(n)]
    })
    visit(vertices, i / 3)
  }
}

const probes = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.5, 0.5, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [1 / 3, 1 / 3, 1 / 3]]

function checkSurface(geometry, label, bridge = false) {
  const { minX, minZ, stepX, stepZ, columns, rows } = elevation.grid
  let checked = 0, minimum = Infinity, maximum = -Infinity
  triangles(geometry, (vertices, face) => {
    const [a, b, c] = vertices
    const area = (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0])
    assert.ok(area < -1e-14, `${label} face ${face} is degenerate or downward after Float32 conversion`)
    const grid = vertices.map(([x, , z]) => [(x * METRES_PER_UNIT - minX) / stepX, (z * METRES_PER_UNIT - minZ) / stepZ])
    for (const [values, first, last] of [
      [grid.map(p => p[0]), 0, columns - 1],
      [grid.map(p => p[1]), 0, rows - 1],
      [grid.map(p => p[0] - p[1]), -Infinity, Infinity],
    ]) {
      const lower = Math.max(first, Math.ceil(Math.min(...values) + GRID_TOLERANCE))
      const upper = Math.min(last, Math.max(...values) - GRID_TOLERANCE)
      assert.ok(lower >= upper, `${label} face ${face} crosses a DEM plane boundary`)
    }
    // With the above topology check, the terrain is affine over each face:
    // nonnegative vertex clearance guarantees nonnegative clearance everywhere.
    for (const weights of probes) {
      const [x, y, z] = [0, 1, 2].map(axis => vertices.reduce((sum, v, i) => sum + v[axis] * weights[i], 0))
      const clearance = y - groundHeight(x, z)
      assert.ok(clearance >= ROAD_Y - HEIGHT_TOLERANCE, `${label} face ${face} clearance ${clearance * METRES_PER_UNIT} m`)
      if (!bridge) assert.ok(Math.abs(clearance - ROAD_Y) < HEIGHT_TOLERANCE, `${label} does not follow the DEM plane`)
      minimum = Math.min(minimum, clearance)
      maximum = Math.max(maximum, clearance)
      checked++
    }
  })
  assert.ok([...geometry.getAttribute('normal').array].every(Number.isFinite), `${label} has invalid normals`)
  return { checked, minimum, maximum }
}

function heightsAt(geometry, x, z) {
  const heights = []
  triangles(geometry, ([a, b, c]) => {
    const det = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2])
    const wa = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / det
    const wb = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / det
    const wc = 1 - wa - wb
    if (Math.min(wa, wb, wc) >= -1e-4 && Math.max(wa, wb, wc) <= 1 + 1e-4) heights.push(wa * a[1] + wb * b[1] + wc * c[1])
  })
  return heights
}

test('all real road faces follow one DEM plane and stay above it, including bridge interiors', t => {
  const started = performance.now()
  let faces = 0, originalFaces = 0, samples = 0, bytes = 0, bridges = 0, minimum = Infinity, generationMs = 0
  for (const road of geography.roads) {
    const points = centreline(road)
    const generationStart = performance.now()
    const geometry = roadRibbonGeometry(points, WIDTHS[road.class] || 0.26, { bridge: road.bridge })
    generationMs += performance.now() - generationStart
    const checked = checkSurface(geometry, road.id, road.bridge)
    minimum = Math.min(minimum, checked.minimum)
    samples += checked.checked
    originalFaces += (points.length - 1) * 2
    faces += geometry.index.count / 3
    bytes += geometry.attributes.position.array.byteLength + geometry.attributes.normal.array.byteLength + geometry.index.array.byteLength
    bridges += Number(road.bridge)
    geometry.dispose()
  }
  assert.ok(samples > 100000)
  t.diagnostic(JSON.stringify({ roads: geography.roads.length, bridges, originalFaces, faces, samples, indexedBytes: bytes, mergedNonIndexedBytes: faces * 3 * 6 * 4, minimumClearanceMetres: minimum * METRES_PER_UNIT, generationMs: Math.round(generationMs), validationMs: Math.round(performance.now() - started) }))
})

test('André Gunot regression: the reported buried barycentre now has the full 50 cm clearance', () => {
  const road = geography.roads.find(road => road.id === 'way/1043273409/0')
  assert.ok(road)
  const geometry = roadRibbonGeometry(centreline(road), WIDTHS[road.class])
  const [x, z] = [-33.80095, -77.56804]
  const heights = heightsAt(geometry, x, z)
  assert.ok(heights.length, 'The fix must preserve the road footprint at the regression point')
  for (const y of heights) assert.ok(Math.abs(y - groundHeight(x, z) - ROAD_Y) < HEIGHT_TOLERANCE)
  geometry.dispose()
})

test('all bridge centres retain the supplied profile and complete end sections match the draped approaches', t => {
  let centres = 0, intermediateCentres = 0, endVertices = 0
  for (const road of geography.roads.filter(road => road.bridge)) {
    const points = centreline(road)
    const geometry = roadRibbonGeometry(points, WIDTHS[road.class] || 0.26, { bridge: true })
    const position = geometry.getAttribute('position')
    for (const point of points) {
      let found = false
      for (let i = 0; i < position.count; i++) {
        if (Math.hypot(position.getX(i) - point.x, position.getZ(i) - point.z) < 1e-5 && Math.abs(position.getY(i) - point.y) < HEIGHT_TOLERANCE) found = true
      }
      assert.ok(found, `${road.id} lost a centreline constraint`)
      centres++
    }
    for (let i = 1; i < points.length; i++) {
      const midpoint = points[i - 1].clone().lerp(points[i], 0.5)
      const heights = heightsAt(geometry, midpoint.x, midpoint.z)
      assert.ok(heights.length, `${road.id} is missing part of its centreline`)
      for (const y of heights) assert.ok(Math.abs(y - midpoint.y) < HEIGHT_TOLERANCE, `${road.id} changed the profile between input centres`)
      intermediateCentres++
    }
    for (const [end, neighbour] of [[points[0], points[1]], [points.at(-1), points.at(-2)]]) {
      const direction = new THREE.Vector2(neighbour.x - end.x, neighbour.z - end.z).normalize()
      let found = 0
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
        if (Math.abs((x - end.x) * direction.x + (z - end.z) * direction.y) > 1e-5) continue
        assert.ok(Math.abs(y - groundHeight(x, z) - ROAD_Y) < HEIGHT_TOLERANCE, `${road.id} has an abutment step`)
        found++
      }
      assert.ok(found >= 3, `${road.id} must drape its entire end section`)
      endVertices += found
    }
    geometry.dispose()
  }
  t.diagnostic(`${centres} constrained bridge centres; ${intermediateCentres} intermediate centres; ${endVertices} terminal vertices, including DEM intersections`)
})

test('the reported bridge and approach both reach the same DEM profile at their common endpoint', () => {
  const bridge = geography.roads.find(road => road.id === 'way/27334969/0')
  const approach = geography.roads.find(road => road.id === 'way/27266571/0')
  assert.deepEqual(bridge.points.at(-1), approach.points[0])
  // Directions differ slightly at the shared OSM node. Each terminal boundary
  // must match the same terrain surface, including its high and low sides.
  for (const road of [bridge, approach]) {
    const points = centreline(road), end = road.bridge ? points.at(-1) : points[0]
    const geometry = roadRibbonGeometry(points, WIDTHS[road.class], { bridge: road.bridge })
    const neighbour = road.bridge ? points.at(-2) : points[1]
    const dx = neighbour.x - end.x, dz = neighbour.z - end.z, length = Math.hypot(dx, dz)
    for (const lateral of [-0.99, -0.5, 0, 0.5, 0.99]) {
      const x = end.x - dz / length * WIDTHS[road.class] / 2 * lateral
      const z = end.z + dx / length * WIDTHS[road.class] / 2 * lateral
      const heights = heightsAt(geometry, x, z)
      assert.ok(heights.length, `${road.id} is missing an end section`)
      for (const y of heights) assert.ok(Math.abs(y - groundHeight(x, z) - ROAD_Y) < HEIGHT_TOLERANCE)
    }
    geometry.dispose()
  }
})

test('grid-aligned edges, diagonal crossings, clamped grid exterior and miters retain their horizontal footprint', () => {
  const { minX, minZ, stepX, stepZ } = elevation.grid
  const x = (minX + 80 * stepX) / METRES_PER_UNIT, z = (minZ + 40 * stepZ) / METRES_PER_UNIT
  const cases = [
    { points: [[x, z], [x + 3, z]], area: 3 * 0.4 },
    { points: [[x, z], [x, z + 3]], area: 3 * 0.4 },
    { points: [[x, z], [x + 2, z + 2]], area: Math.sqrt(8) * 0.4 },
    { points: [[x, z], [x + 3, z], [x + 3, z + 3]], area: 6 * 0.4 },
    { points: [[minX / METRES_PER_UNIT - 1, minZ / METRES_PER_UNIT - 1], [minX / METRES_PER_UNIT + 1, minZ / METRES_PER_UNIT + 1]], area: Math.sqrt(8) * 0.4 },
  ]
  for (const road of cases) {
    const geometry = roadRibbonGeometry(centreline(road), 0.4)
    checkSurface(geometry, JSON.stringify(road.points))
    let area = 0
    triangles(geometry, ([a, b, c]) => { area += Math.abs((b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0])) / 2 })
    assert.ok(Math.abs(area - road.area) < 1e-4, `Width/miter footprint changed: ${area} vs ${road.area}`)
    const copy = centreline(road), before = copy.map(point => point.toArray())
    roadRibbonGeometry(copy, 0.4).dispose()
    assert.deepEqual(copy.map(point => point.toArray()), before, 'The helper must not mutate the supplied profile')
    geometry.dispose()
  }
})

test('empty, single, repeated centres and zero width produce valid empty geometries', () => {
  const p = new THREE.Vector3(0, groundHeight(0, 0) + ROAD_Y, 0)
  for (const [points, width] of [[[], 0.4], [[p], 0.4], [[p, p.clone()], 0.4], [[p, p.clone().add(new THREE.Vector3(1, 0, 0))], 0]]) {
    const geometry = roadRibbonGeometry(points, width, { bridge: true })
    assert.ok(geometry instanceof THREE.BufferGeometry)
    assert.equal(geometry.index.count, 0)
    assert.equal(geometry.attributes.position.count, 0)
    geometry.dispose()
  }
})

test('a bridge with a folded miter retains the entire original triangle footprint', () => {
  const points = centreline({ points: [[0, 0], [0.1, 0], [0.1, 2]], bridge: true })
  const width = 0.4, positions = [], indices = []
  // Reference the original two-triangle ribbon, independently of the helper's
  // centreline insertion. At this short corner the sections cross each other.
  for (let i = 0; i < points.length; i++) {
    const point = points[i], before = points[Math.max(0, i - 1)], after = points[Math.min(points.length - 1, i + 1)]
    const incoming = new THREE.Vector2(point.x - before.x, point.z - before.z)
    const outgoing = new THREE.Vector2(after.x - point.x, after.z - point.z)
    if (!incoming.lengthSq()) incoming.copy(outgoing)
    if (!outgoing.lengthSq()) outgoing.copy(incoming)
    incoming.normalize()
    outgoing.normalize()
    const normal = new THREE.Vector2(-incoming.y - outgoing.y, incoming.x + outgoing.x).normalize()
    const offset = Math.min(width * 0.5 / Math.max(Math.abs(normal.dot(new THREE.Vector2(-outgoing.y, outgoing.x))), 0.25), width)
    for (const side of [1, -1]) positions.push(point.x + normal.x * offset * side, 0, point.z + normal.y * offset * side)
    if (i < points.length - 1) indices.push(2 * i, 2 * i + 2, 2 * i + 1, 2 * i + 1, 2 * i + 2, 2 * i + 3)
  }
  const reference = new THREE.BufferGeometry()
  reference.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  reference.setIndex(indices)
  const geometry = roadRibbonGeometry(points, width, { bridge: true })
  assert.ok(heightsAt(reference, -0.03, -0.013333333333).length)
  assert.ok(heightsAt(geometry, -0.03, -0.013333333333).length, 'Inserting the centreline must not remove the folded corner')
  const area = mesh => {
    let total = 0
    triangles(mesh, ([a, b, c]) => { total += Math.abs((b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0])) / 2 })
    return total
  }
  assert.ok(Math.abs(area(geometry) - area(reference)) < 1e-6)
  for (const [from, to] of [[reference, geometry], [geometry, reference]]) {
    triangles(from, vertices => {
      for (const weights of [[1 / 3, 1 / 3, 1 / 3], [0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.1, 0.1, 0.8]]) {
        const x = vertices.reduce((sum, vertex, i) => sum + vertex[0] * weights[i], 0)
        const z = vertices.reduce((sum, vertex, i) => sum + vertex[2] * weights[i], 0)
        assert.ok(heightsAt(to, x, z).length, `The folded bridge footprint changed at ${x},${z}`)
      }
    })
  }
  checkSurface(geometry, 'folded bridge', true)
  for (const point of points) assert.ok(heightsAt(geometry, point.x, point.z).some(y => Math.abs(y - point.y) < HEIGHT_TOLERANCE), 'The centreline profile must remain a mesh constraint')
  geometry.dispose()
  reference.dispose()
})
