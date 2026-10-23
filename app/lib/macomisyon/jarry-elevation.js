import source from './data/jarry-elevation.json' with { type: 'json' }
import { geography, METRES_PER_UNIT, PROJECT_SITES } from './jarry-geography.js'

export const elevationMetadata = source.meta
export const terrainGrid = source.grid

/** The prepared DEM and the map share an east/south metric grid. No vertical exaggeration. */
export function elevationAtMetres(x, z) {
  const { columns, rows, minX, minZ, stepX, stepZ } = source.grid
  const gx = Math.max(0, Math.min(columns - 1, (x - minX) / stepX))
  const gz = Math.max(0, Math.min(rows - 1, (z - minZ) / stepZ))
  const col = Math.min(columns - 2, Math.floor(gx))
  const row = Math.min(rows - 2, Math.floor(gz))
  const u = gx - col, v = gz - row
  const at = (dx, dz) => source.heights[(row + dz) * columns + col + dx]
  // Match the actual mesh triangles (NW → SE), including on their diagonal.
  return u >= v
    ? (1 - u) * at(0, 0) + (u - v) * at(1, 0) + v * at(1, 1)
    : (1 - v) * at(0, 0) + (v - u) * at(0, 1) + u * at(1, 1)
}

export const groundHeight = (x, z) => elevationAtMetres(x * METRES_PER_UNIT, z * METRES_PER_UNIT) / METRES_PER_UNIT

// The coloured ground overlays sit slightly above the DEM to avoid z-fighting.
// Small props must rest on these same rendered surfaces, not underneath them.
export const DRY_SURFACE_LIFTS = { industrial: .006, vegetation: .012 }
export const ROAD_SURFACE_LIFT = .025
function ringContains(x, z, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[j]
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) inside = !inside
  }
  return inside
}
export function drySurfaceHeight(x, z) {
  let lift = 0
  for (const [layer, offset] of Object.entries(DRY_SURFACE_LIFTS)) {
    if (geography[layer].some(polygon => ringContains(x, z, polygon.outer) && !polygon.holes.some(ring => ringContains(x, z, ring)))) lift = Math.max(lift, offset)
  }
  return groundHeight(x, z) + lift
}

/** Split a road wherever it crosses a terrain triangle, as well as every ten metres. */
export function terrainSegmentStops(a, b) {
  const { minX, minZ, stepX, stepZ } = source.grid
  const ax = (a[0] * METRES_PER_UNIT - minX) / stepX, az = (a[1] * METRES_PER_UNIT - minZ) / stepZ
  const bx = (b[0] * METRES_PER_UNIT - minX) / stepX, bz = (b[1] * METRES_PER_UNIT - minZ) / stepZ
  const stops = new Set([0, 1])
  for (const [from, to] of [[ax, bx], [az, bz], [ax - az, bx - bz]]) {
    if (Math.abs(to - from) < 1e-9) continue
    for (let boundary = Math.ceil(Math.min(from, to)); boundary < Math.max(from, to); boundary++) {
      const t = (boundary - from) / (to - from)
      if (t > 1e-8 && t < 1 - 1e-8) stops.add(t)
    }
  }
  const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5))
  for (let i = 1; i < steps; i++) stops.add(i / steps)
  return [...stops].sort((x, y) => x - y).filter((value, i, values) => !i || value - values[i - 1] > 1e-8)
}

// Footprints of the authored plinths, in scene units. Their elevations are computed
// over the complete footprint; only the fictional foundations change the site.
export const sitePads = {
  memebank: [{ width: 7.1 * .55, depth: 6.8 * .55, dz: .8 * .55, bottom: .01 * .55 }],
  quilivreou: [{ width: 6.15, depth: 5.15, bottom: .04 }, { width: 6.6, depth: 1.8, dz: 3.1, bottom: .1 }],
  shootareas: [{ width: 5.1, depth: 3.5, bottom: .055 }],
  zikak: [{ width: 3.75, depth: 3.05, angle: .1, bottom: .04 }],
}

export function padPoint(site, pad, x, z) {
  const angle = pad.angle || 0
  return [site.x + (pad.dx || 0) + x * Math.cos(angle) + z * Math.sin(angle), site.z + (pad.dz || 0) - x * Math.sin(angle) + z * Math.cos(angle)]
}

export function padExtrema(site, pad) {
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => padPoint(site, pad, x * pad.width / 2, z * pad.depth / 2))
  const heights = []
  // A linear terrain triangle reaches its extrema at a clipped corner: the pad
  // perimeter's terrain intersections, or a DEM node inside the rectangle.
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % corners.length]
    for (const t of terrainSegmentStops(a, b)) heights.push(groundHeight(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
  })
  const { minX, minZ, stepX, stepZ } = terrainGrid
  const bounds = [0, 1].map(axis => [Math.min(...corners.map(p => p[axis])), Math.max(...corners.map(p => p[axis]))])
  for (let col = Math.ceil((bounds[0][0] * METRES_PER_UNIT - minX) / stepX); minX + col * stepX <= bounds[0][1] * METRES_PER_UNIT; col++) {
    for (let row = Math.ceil((bounds[1][0] * METRES_PER_UNIT - minZ) / stepZ); minZ + row * stepZ <= bounds[1][1] * METRES_PER_UNIT; row++) {
      const x = (minX + col * stepX) / METRES_PER_UNIT, z = (minZ + row * stepZ) / METRES_PER_UNIT
      const [cx, cz] = padPoint(site, pad, 0, 0), angle = pad.angle || 0
      const dx = (x - cx) * Math.cos(angle) - (z - cz) * Math.sin(angle)
      const dz = (x - cx) * Math.sin(angle) + (z - cz) * Math.cos(angle)
      if (Math.abs(dx) <= pad.width / 2 && Math.abs(dz) <= pad.depth / 2) heights.push(groundHeight(x, z))
    }
  }
  return { min: Math.min(...heights), max: Math.max(...heights) }
}

export const siteFoundations = Object.fromEntries(Object.entries(sitePads).map(([id, pads]) => [id, pads.map(pad => ({ ...pad, ...padExtrema(PROJECT_SITES[id], pad) }))]))
export const siteHeights = Object.fromEntries(Object.entries(siteFoundations).map(([id, pads]) => [id, Math.max(...pads.map(pad => pad.max - pad.bottom)) + .005]))
