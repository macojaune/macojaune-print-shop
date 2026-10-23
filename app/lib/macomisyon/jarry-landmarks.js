import * as THREE from 'three'
import { createKokoloLandmark } from './landmarks/kokolo.js'
import { createMaggmaLandmark } from './landmarks/maggma.js'
import { createOmaslaLandmark } from './landmarks/omasla.js'
import { parkOnTerrain, seatOnTerrain } from './landmarks/placement.js'

const factories = { kokolo: createKokoloLandmark, 'maggma-studio': createMaggmaLandmark, omasla: createOmaslaLandmark }

/** Additional authored places, separate from the four original project plinths. */
export function createJarryLandmarks(sites) {
  const group = new THREE.Group()
  group.name = 'neighbourhood-landmarks'
  const markers = [], targets = {}, pickables = [], focusWidths = {}, locations = {}
  for (const [id, site] of Object.entries(sites)) {
    const model = factories[id](site.model)
    const isCar = id === 'kokolo'
    const base = isCar
      ? parkOnTerrain(model.group, site, model.footprint)
      : (() => {
          const placement = seatOnTerrain(model.group, site, model.footprint, { round: id === 'maggma-studio', color: id === 'maggma-studio' ? 0x454b48 : 0xcfc6ad })
          group.add(placement.foundation)
          return placement.base
        })()
    group.add(model.group)
    const target = new THREE.Vector3(site.x, base, site.z)
    targets[id] = target
    markers.push({ id, position: target.clone().add(new THREE.Vector3(0, model.markerHeight, 0)), selectedOnly: isCar, labelOffset: isCar ? 32 : 0 })
    focusWidths[id] = isCar ? 4 : 8
    locations[id] = { x: site.x, y: base, z: site.z, angle: site.angle || 0, footprint: model.footprint }
    const bounds = new THREE.Box3().setFromObject(model.group)
    const size = bounds.getSize(new THREE.Vector3()), centre = bounds.getCenter(new THREE.Vector3())
    // A modest invisible hit target helps select the real-sized car; it adds no paving.
    const hit = new THREE.Mesh(new THREE.BoxGeometry(Math.max(size.x, .6), Math.max(size.y, .25), Math.max(size.z, .6)), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }))
    hit.position.copy(centre)
    hit.userData.projectId = id
    group.add(hit)
    pickables.push(hit)
  }
  const geometries = new Set(), materials = new Set()
  let triangles = 0, meshes = 0
  group.traverse(object => {
    if (!object.isMesh) return
    meshes++
    geometries.add(object.geometry)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material)
    triangles += (object.geometry.index?.count || object.geometry.attributes.position.count) / 3
  })
  let disposed = false
  return {
    group, markers, targets, pickables, focusWidths,
    counts: { places: Object.keys(sites).length, meshes, triangles, geometries: geometries.size, materials: materials.size, locations },
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
