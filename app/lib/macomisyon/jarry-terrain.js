import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { geography, METRES_PER_UNIT, PROJECT_SITES, WORLD_BOUNDS } from './jarry-geography.js'
import { DRY_SURFACE_LIFTS, ROAD_SURFACE_LIFT as ROAD_Y, elevationMetadata, groundHeight, terrainSegmentStops } from './jarry-elevation.js'
import { roadRibbonGeometry } from './jarry-roads.js'
import { REPLACED_BUILDING_IDS } from './jarry-landmark-sites.js'
import surfaces from './data/jarry-surfaces.json' with { type: 'json' }

const ROAD_WIDTHS = {
  trunk: 0.46, trunk_link: 0.30,
  primary: 0.38, primary_link: 0.28,
  secondary: 0.32, secondary_link: 0.25,
  tertiary: 0.30, tertiary_link: 0.23,
  residential: 0.26, unclassified: 0.26, living_street: 0.22,
  service: 0.18, construction: 0.18,
}
const TREE_LIMIT = 10000
const SITE_CLEARANCE = 6

function random(seed) {
  const value = Math.sin(seed * 127.1 + 41.7) * 43758.5453
  return value - Math.floor(value)
}

function ringContains(x, z, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, az] = ring[i]
    const [bx, bz] = ring[j]
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) inside = !inside
  }
  return inside
}

function contains(x, z, polygon) {
  return ringContains(x, z, polygon.outer) && !(polygon.holes || []).some(hole => ringContains(x, z, hole))
}

function segmentDistanceSquared(x, z, a, b) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const lengthSquared = dx * dx + dz * dz
  const t = lengthSquared ? THREE.MathUtils.clamp(((x - a[0]) * dx + (z - a[1]) * dz) / lengthSquared, 0, 1) : 0
  return (x - a[0] - dx * t) ** 2 + (z - a[1] - dz * t) ** 2
}

function touchesRing(x, z, radius, ring) {
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    if (segmentDistanceSquared(x, z, ring[i], ring[j]) < radius * radius) return true
  }
  return false
}

function overlapsPolygon(x, z, radius, polygon) {
  return contains(x, z, polygon) || touchesRing(x, z, radius, polygon.outer)
    || (polygon.holes || []).some(hole => touchesRing(x, z, radius, hole))
}

function polygonBounds(polygon, padding = 0) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
  for (const [x, z] of polygon.outer) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
  }
  return { minX: minX - padding, maxX: maxX + padding, minZ: minZ - padding, maxZ: maxZ + padding }
}

/** A coarse spatial index keeps tree clearance checks local to each candidate. */
function spatialIndex(cellSize = 6) {
  const cells = new Map()
  const key = (x, z) => `${Math.floor(x / cellSize)}:${Math.floor(z / cellSize)}`
  return {
    add(item, bounds) {
      for (let x = Math.floor(bounds.minX / cellSize); x <= Math.floor(bounds.maxX / cellSize); x++) {
        for (let z = Math.floor(bounds.minZ / cellSize); z <= Math.floor(bounds.maxZ / cellSize); z++) {
          const id = `${x}:${z}`
          if (!cells.has(id)) cells.set(id, [])
          cells.get(id).push(item)
        }
      }
    },
    at(x, z) { return cells.get(key(x, z)) || [] },
  }
}

function makeShape(polygon) {
  const shape = new THREE.Shape()
  const addRing = (path, points) => {
    for (let i = 0; i < points.length; i++) {
      const [x, z] = points[i]
      if (i === 0) path.moveTo(x, -z)
      else path.lineTo(x, -z)
    }
    path.closePath()
  }
  addRing(shape, polygon.outer)
  for (const points of polygon.holes || []) {
    const hole = new THREE.Path()
    addRing(hole, points)
    shape.holes.push(hole)
  }
  return shape
}

function polygonGeometry(polygon, y, depth = 0) {
  const shape = makeShape(polygon)
  const geometry = depth
    ? new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1, curveSegments: 1 })
    : new THREE.ShapeGeometry(shape)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, y, 0)
  return geometry
}

function surfaceGeometry(surface, offset) {
  const geometry = new THREE.BufferGeometry()
  const positions = Float32Array.from(surface.positions, (value, index) => value / METRES_PER_UNIT + (index % 3 === 1 ? offset : 0))
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(surface.indices)
  geometry.computeVertexNormals()
  return geometry
}

// Close the narrow terrain edge down into the flat sea, without a display plinth.
function landEdgeGeometry(polygon) {
  const positions = [], indices = []
  for (const ring of [polygon.outer, ...(polygon.holes || [])]) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length]
      const cuts = terrainSegmentStops(a, b)
      for (let j = 1; j < cuts.length; j++) {
        const at = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
        const p = at(cuts[j - 1]), q = at(cuts[j]), start = positions.length / 3
        positions.push(p[0], groundHeight(...p), p[1], p[0], -1, p[1], q[0], -1, q[1], q[0], groundHeight(...q), q[1])
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function lengthOf(points) {
  let length = 0
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
  return length
}

/** Preserve OSM alignment; sample long segments so streets follow the same DEM as the ground. */
function roadPoints(road) {
  const points = road.points.filter((point, i) => i === 0 || point[0] !== road.points[i - 1][0] || point[1] !== road.points[i - 1][1])
  const length = lengthOf(points)
  const vertices = []
  const startHeight = points.length ? groundHeight(...points[0]) : 0
  const endHeight = points.length ? groundHeight(...points.at(-1)) : 0
  let distance = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    const segmentLength = Math.hypot(b[0] - a[0], b[1] - a[1])
    for (const t of terrainSegmentStops(a, b).slice(0, -1)) {
      const progress = length ? (distance + segmentLength * t) / length : 0
      const x = THREE.MathUtils.lerp(a[0], b[0], t), z = THREE.MathUtils.lerp(a[1], b[1], t)
      // A mapped bridge keeps a deck between its banks, instead of descending into water.
      // Its exact deck height is unknown; the slight arch is a documented rendering convention.
      const height = road.bridge ? Math.max(groundHeight(x, z), THREE.MathUtils.lerp(startHeight, endHeight, progress) + Math.sin(progress * Math.PI) * 0.12) : groundHeight(x, z)
      vertices.push(new THREE.Vector3(x, height + ROAD_Y, z))
    }
    distance += segmentLength
  }
  if (points.length) vertices.push(new THREE.Vector3(points.at(-1)[0], endHeight + ROAD_Y, points.at(-1)[1]))
  return vertices
}

function ribbonGeometry(points, width) {
  if (points.length < 2) return null
  const positions = [], indices = []
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const before = points[Math.max(0, i - 1)]
    const after = points[Math.min(points.length - 1, i + 1)]
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
    for (const side of [1, -1]) {
      const x = point.x + normal.x * offset * side, z = point.z + normal.y * offset * side
      positions.push(x, point.y, z)
    }
    if (i < points.length - 1) {
      const a = i * 2
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function polylineCurve(points) {
  const curve = new THREE.CurvePath()
  for (let i = 1; i < points.length; i++) curve.add(new THREE.LineCurve3(points[i - 1], points[i]))
  return curve
}

/** Real OSM footprints and coastline, with deliberately stylized building and tree heights. */
export function createJarryTerrain({ scene, mesh, batch, palette }) {
  const groups = new Map()
  const sites = Object.values(PROJECT_SITES)
  const counts = { buildings: 0, reservedBuildings: 0, roads: 0, bridges: 0, trees: 0, markings: 0, mergedMeshes: 0, elevation: elevationMetadata.source, verticalExaggeration: 1 }
  const roadIndex = spatialIndex()
  const buildingIndex = spatialIndex()
  const waterIndex = spatialIndex()
  const landIndex = spatialIndex(20)
  const vegetationIndex = spatialIndex(12)
  const colors = {
    ground: 0xbbc3a6,
    industry: 0xd6d0bf,
    mangrove: 0x365c48,
    wood: 0x54774e,
    grass: 0xa2b681,
    water: palette.sea,
    shallows: 0x96cdb7,
    walls: 0xe9dfc4,
    sageWalls: 0xbec5ac,
    roof: 0xc6d3bc,
    creamRoof: 0xf0e3c7,
    clayRoof: 0xc99278,
  }

  function queue(geometry, color, castShadow = false) {
    if (!geometry) return
    const key = `${color}:${castShadow}`
    if (!groups.has(key)) groups.set(key, { color, castShadow, geometries: [] })
    // ShapeGeometry is indexed, ExtrudeGeometry is not. Normalize before merging.
    const normalized = geometry.index ? geometry.toNonIndexed() : geometry
    if (normalized !== geometry) geometry.dispose()
    normalized.deleteAttribute('uv')
    normalized.clearGroups()
    groups.get(key).geometries.push(normalized)
  }

  function reserved(x, z, radius = 0) {
    return sites.some(site => Math.hypot(x - site.x, z - site.z) < SITE_CLEARANCE + radius)
  }

  // The sea continues beyond the map crop, as in the original flat presentation.
  const sea = new THREE.PlaneGeometry(WORLD_BOUNDS.width * 8, WORLD_BOUNDS.depth * 8)
  sea.rotateX(-Math.PI / 2)
  const water = mesh(sea, colors.water, [0, -0.04, 0], scene)
  water.castShadow = water.receiveShadow = false
  for (const polygon of geography.land) {
    const edge = mesh(landEdgeGeometry(polygon), palette.sand, null, scene, { side: THREE.DoubleSide })
    edge.castShadow = edge.receiveShadow = false
    landIndex.add(polygon, polygonBounds(polygon))
  }
  for (const surface of surfaces.layers.land) queue(surfaceGeometry(surface, 0), colors.ground)
  for (const coast of geography.coastline) {
    queue(ribbonGeometry(coast.points.map(([x, z]) => new THREE.Vector3(x, -0.032, z)), 0.45), colors.shallows)
  }
  for (const surface of surfaces.layers.industrial) queue(surfaceGeometry(surface, DRY_SURFACE_LIFTS.industrial), colors.industry)
  for (const surface of surfaces.layers.vegetation) {
    const kind = surface.kind
    const wooded = ['wood', 'forest', 'mangrove', 'scrub', 'wetland'].includes(kind)
    const color = kind === 'mangrove' || kind === 'wetland' ? colors.mangrove : wooded ? colors.wood : colors.grass
    queue(surfaceGeometry(surface, DRY_SURFACE_LIFTS.vegetation), color)
  }
  for (const polygon of geography.vegetation) {
    const kind = polygon.kind
    const wooded = ['wood', 'forest', 'mangrove', 'scrub', 'wetland'].includes(kind)
    if (wooded) vegetationIndex.add(polygon, polygonBounds(polygon))
  }
  for (const surface of surfaces.layers.water) queue(surfaceGeometry(surface, 0.018), colors.water)
  for (const polygon of geography.water) {
    waterIndex.add(polygon, polygonBounds(polygon, 2))
  }

  let trafficPoints = null, longestTrafficRoad = 0
  for (const road of geography.roads) {
    const width = ROAD_WIDTHS[road.class] || 0.26
    const points = roadPoints(road)
    if (points.length < 2) continue
    const major = ['trunk', 'primary', 'secondary'].includes(road.class)
    queue(roadRibbonGeometry(points, width, { bridge: road.bridge }), major ? palette.road : palette.asphalt)
    counts.roads++
    if (road.bridge) counts.bridges++
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1], b = road.points[i]
      const segment = { a, b, width }
      const padding = width / 2 + 2
      roadIndex.add(segment, {
        minX: Math.min(a[0], b[0]) - padding, maxX: Math.max(a[0], b[0]) + padding,
        minZ: Math.min(a[1], b[1]) - padding, maxZ: Math.max(a[1], b[1]) + padding,
      })
    }
    const length = lengthOf(road.points)
    if (road.class === 'primary' && !road.bridge && length > longestTrafficRoad) {
      longestTrafficRoad = length
      trafficPoints = points
    }
    if (major && length > 2 && counts.markings < 1100) {
      const curve = polylineCurve(points)
      for (let distance = 1.0; distance < length - 0.5 && counts.markings < 1100; distance += 2.65) {
        const t = distance / length
        const point = curve.getPoint(t)
        const tangent = curve.getTangent(t)
        batch([0.009, 0.008, 0.18], [point.x, point.y + 0.009, point.z], palette.paper, [0, Math.atan2(tangent.x, tangent.z), 0])
        counts.markings++
      }
    }
  }

  for (let index = 0; index < geography.buildings.length; index++) {
    const building = geography.buildings[index]
    buildingIndex.add(building, polygonBounds(building, 2))
    if (building.kind === 'no') continue
    if (REPLACED_BUILDING_IDS.has(building.id) || sites.some(site => overlapsPolygon(site.x, site.z, SITE_CLEARANCE, building))) {
      counts.reservedBuildings++
      continue
    }
    // Areas and explicit heights remain in metres in the source dataset.
    const sourceHeight = Number.parseFloat(building.height)
    const industrial = ['industrial', 'warehouse', 'retail', 'commercial'].includes(building.kind) || building.area > 900
    const height = (Number.isFinite(sourceHeight) && sourceHeight > 0 ? sourceHeight : industrial ? 7 : 4.5) / METRES_PER_UNIT
    const samples = building.outer.map(([x, z]) => groundHeight(x, z))
    const base = Math.min(...samples), foundation = Math.max(...samples)
    const roofColor = index % 11 === 0 ? colors.clayRoof : index % 3 === 0 ? colors.creamRoof : colors.roof
    queue(polygonGeometry(building, base + 0.018, height + foundation - base), index % 5 === 0 ? colors.sageWalls : colors.walls, true)
    queue(polygonGeometry(building, foundation + 0.019 + height), roofColor, true)
    counts.buildings++
  }

  // A jittered grid spreads trees across all mangroves instead of filling one polygon first.
  const candidates = []
  const spacing = 0.9
  let seed = 0
  for (let z = WORLD_BOUNDS.minZ + spacing / 2; z < WORLD_BOUNDS.maxZ; z += spacing) {
    for (let x = WORLD_BOUNDS.minX + spacing / 2; x < WORLD_BOUNDS.maxX; x += spacing) {
      seed++
      const px = x + (random(seed * 3) - 0.5) * 0.70
      const pz = z + (random(seed * 3 + 1) - 0.5) * 0.70
      const polygon = vegetationIndex.at(px, pz).find(region => contains(px, pz, region))
      if (!polygon) continue
      const radius = 0.24 + random(seed * 3 + 2) * 0.18
      if (reserved(px, pz, radius)) continue
      if (touchesRing(px, pz, radius, polygon.outer) || (polygon.holes || []).some(hole => touchesRing(px, pz, radius, hole))) continue
      const land = landIndex.at(px, pz).find(region => contains(px, pz, region))
      if (!land || touchesRing(px, pz, radius, land.outer) || (land.holes || []).some(hole => touchesRing(px, pz, radius, hole))) continue
      if (waterIndex.at(px, pz).some(region => overlapsPolygon(px, pz, radius + 0.12, region))) continue
      if (buildingIndex.at(px, pz).some(building => overlapsPolygon(px, pz, radius + 0.2, building))) continue
      if (roadIndex.at(px, pz).some(({ a, b, width }) => segmentDistanceSquared(px, pz, a, b) < (radius + width / 2 + 0.24) ** 2)) continue
      candidates.push({ x: px, z: pz, radius, seed, kind: polygon.kind, order: random(seed + 12001) })
    }
  }
  candidates.sort((a, b) => a.order - b.order)
  const treeColors = [0x375c40, 0x456a48, 0x527751, 0x64865a]
  for (const tree of candidates.slice(0, TREE_LIMIT)) {
    const { x, z, radius, seed: treeSeed, kind } = tree
    const mangrove = kind === 'mangrove' || kind === 'wetland'
    const height = mangrove ? 0.22 + radius * 0.5 : 0.30 + radius * 0.65
    const base = groundHeight(x, z)
    batch([0.025, height * 0.68, 0.025], [x, base + height * 0.34, z], 0x877859, [0, 0, 0], 'cylinder')
    batch([radius, height * 0.7, radius], [x, base + height, z], treeColors[treeSeed % treeColors.length], [0, random(treeSeed) * Math.PI, 0], 'canopy')
    counts.trees++
  }

  for (const { color, castShadow, geometries } of groups.values()) {
    const merged = mergeGeometries(geometries, false)
    for (const geometry of geometries) geometry.dispose()
    if (!merged) throw new Error('Impossible de fusionner une couche du terrain de Jarry.')
    const surface = mesh(merged, color, null, scene)
    surface.castShadow = castShadow
    surface.receiveShadow = true
    counts.mergedMeshes++
  }

  // The source always contains primary roads. Keep the fallback on an existing road too.
  if (!trafficPoints) trafficPoints = roadPoints(geography.roads.find(road => road.points.length > 1))
  return { trafficCurve: polylineCurve(trafficPoints), counts }
}
