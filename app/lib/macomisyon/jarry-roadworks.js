import * as THREE from 'three'
import { groundHeight, ROAD_SURFACE_LIFT } from './jarry-elevation.js'
import { createCoveredRubble, createRoadBarriers } from './landmarks/roadworks.js'

// Local scenery requested by Marvin from his road observations. These are not
// live traffic data, and do not alter the OSM streets or introduce a mission.
export const ROADWORK_SITES = {
  'roundabout-barriers': {
    kind: 'barriers', roadId: 'way/1005580704/0',
    x: -33.758, z: -81.3195, angle: -1.51116561366,
    model: { width: .50 },
  },
  'mangrove-rubble': {
    kind: 'rubble', roadId: 'way/231852331/0',
    x: -34.40475, z: -53.75025, angle: -.15419425585,
    model: { width: .50, depth: .35, height: .20 },
  },
}

export function createJarryRoadworks(sites = ROADWORK_SITES) {
  const group = new THREE.Group()
  group.name = 'jarry-roadworks'
  const geometries = new Set(), materials = new Set()
  const counts = { sites: 0, triangles: 0, locations: {} }
  for (const [id, site] of Object.entries(sites)) {
    const model = site.kind === 'rubble' ? createCoveredRubble(site.model) : createRoadBarriers(site.model)
    const placed = new THREE.Group()
    placed.name = id
    model.group.position.set(site.x, 0, site.z)
    model.group.rotation.y = site.angle
    model.group.updateMatrixWorld(true)
    const originals = new Set()
    model.group.traverse(object => {
      if (!object.isMesh) return
      originals.add(object.geometry)
      // Bake each instance before draping: the barrier modules share a source
      // geometry, but sit at different points on the actual road surface.
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
      const positions = geometry.getAttribute('position')
      for (let i = 0; i < positions.count; i++) {
        const height = positions.getY(i)
        // Extend the bottom to the DEM, including on the shoulders. The raised
        // road intersects this solid base; the visible top keeps its full height
        // above the road. No half-metre gap beneath the overhanging tarp edges.
        const lift = height < 1e-6 ? 0 : ROAD_SURFACE_LIFT
        positions.setY(i, height + groundHeight(positions.getX(i), positions.getZ(i)) + lift)
      }
      geometry.computeVertexNormals()
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
      const mesh = new THREE.Mesh(geometry, object.material)
      mesh.name = object.name
      mesh.castShadow = mesh.receiveShadow = true
      placed.add(mesh)
      geometries.add(geometry)
      for (const material of [].concat(object.material)) materials.add(material)
      counts.triangles += (geometry.index?.count || positions.count) / 3
    })
    originals.forEach(geometry => geometry.dispose())
    model.group.clear()
    group.add(placed)
    counts.sites++
    counts.locations[id] = { x: site.x, y: groundHeight(site.x, site.z) + ROAD_SURFACE_LIFT, z: site.z, angle: site.angle, footprint: model.footprint }
  }
  let disposed = false
  return {
    group, counts,
    dispose() {
      if (disposed) return
      disposed = true
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      group.removeFromParent()
      group.clear()
    },
  }
}
