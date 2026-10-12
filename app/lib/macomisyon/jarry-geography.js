import source from './data/jarry-osm.json' with { type: 'json' }

// Geographic proportions are preserved. Only the scene's display scale changes.
// Coordinates are east +X / south +Z, with all lengths expressed in scene units.
export const METRES_PER_UNIT = 20
const point = ([x, z]) => [x / METRES_PER_UNIT, z / METRES_PER_UNIT]
const polygon = value => ({ ...value, outer: value.outer.map(point), holes: value.holes.map(ring => ring.map(point)) })
export const geography = {
  meta: source.meta,
  land: source.land.map(polygon),
  water: source.water.map(polygon),
  vegetation: source.vegetation.map(polygon),
  industrial: source.industrial.map(polygon),
  buildings: source.buildings.map(polygon),
  roads: source.roads.map(road => ({ ...road, points: road.points.map(point) })),
  coastline: source.coastline.map(coast => ({ ...coast, points: coast.points.map(point) })),
}
export const WORLD_BOUNDS = {
  minX: -source.meta.widthMetres / METRES_PER_UNIT / 2,
  maxX: source.meta.widthMetres / METRES_PER_UNIT / 2,
  minZ: -source.meta.depthMetres / METRES_PER_UNIT / 2,
  maxZ: source.meta.depthMetres / METRES_PER_UNIT / 2,
  width: source.meta.widthMetres / METRES_PER_UNIT,
  depth: source.meta.depthMetres / METRES_PER_UNIT,
}

// Fictional landmarks fit on land clear of roads and mangrove. These game
// locations make no claim about the activity of real-world buildings.
export const PROJECT_SITES = {
  memebank: { x: -50.11, z: -2.98 },
  quilivreou: { x: 11.87, z: 1.88 },
  shootareas: { x: 2.07, z: 16.78 },
  zikak: { x: -91.04, z: -7.29 },
}

export function geographicPoint(lon, lat) {
  const { origin, projection } = source.meta
  return {
    x: (lon - origin.lon) * projection.xMetresPerDegree / METRES_PER_UNIT,
    z: (lat - origin.lat) * projection.zMetresPerDegree / METRES_PER_UNIT,
  }
}
