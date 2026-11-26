import * as THREE from 'three'

/** Fictional shelter: three static cabinets, no game state or real-world address. */
export function createScoloLandmark() {
  const group = new THREE.Group()
  group.name = 'scolo-shelter'
  const cube = new THREE.BoxGeometry(1, 1, 1)
  const materials = new Map()
  const box = (w, h, d, x, y, z, color) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .88 }))
    const mesh = new THREE.Mesh(cube, materials.get(color))
    mesh.scale.set(w, h, d)
    mesh.position.set(x, y, z)
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  const yellow = 0xffcf43, ink = 0x253a37, paper = 0xf1ebd3
  box(.9, .025, .8, 0, .0125, 0, paper)
  for (const x of [-.4, .4]) for (const z of [-.35, .35]) box(.025, .52, .025, x, .285, z, ink)
  box(.9, .05, .8, 0, .57, 0, yellow)
  // Open front and sides keep the three cabinets readable beneath the canopy.
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * .26
    const cabinet = box(.19, .32, .22, x, .185, -.16, ink)
    cabinet.name = `scolo-cabinet-${i + 1}`
    box(.145, .115, .012, x, .265, -.043, paper)
    box(.19, .03, .11, x, .16, -.015, yellow)
    box(.012, .025, .012, x - .035, .188, .015, ink)
  }
  // A sandal on the roof is an anonymous visual clue, not an interactive goal.
  const sole = box(.17, .025, .32, 0, .61, .02, ink)
  sole.rotation.y = -.3
  const strap = box(.18, .045, .09, -.02, .64, -.015, paper)
  strap.rotation.y = -.3
  return { group, footprint: { width: .9, depth: .8 }, markerHeight: .9 }
}
