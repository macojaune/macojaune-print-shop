import * as THREE from 'three'

/** A fictional preparation courtyard, never a claim about a real mas headquarters. */
export function createOmaslaLandmark({ width = 1.8, depth = 2.2, height = .65 } = {}) {
  const group = new THREE.Group()
  group.name = 'omasla-courtyard'
  const materials = new Map()
  const cube = new THREE.BoxGeometry(1, 1, 1)
  const material = color => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .88 }))
    return materials.get(color)
  }
  const add = (geometry, color, x, y, z) => {
    const object = new THREE.Mesh(geometry, material(color))
    object.position.set(x, y, z)
    object.castShadow = object.receiveShadow = true
    group.add(object)
    return object
  }
  const box = (w, h, d, x, y, z, color) => {
    const object = add(cube, color, x, y, z)
    object.scale.set(w, h, d)
    return object
  }
  const paper = 0xf0e3c7, ink = 0x304b48, wood = 0xab7957, purple = 0x856d86
  const floor = .018
  box(width, floor, depth, 0, floor / 2, 0, 0xcfc6ad)
  // A low local at the back leaves most of the parcel open to the street.
  box(width * .88, height, depth * .40, 0, floor + height / 2, -depth * .26, paper)
  box(width * .94, .045, depth * .44, 0, floor + height + .0225, -depth * .26, purple)
  box(width * .42, height * .76, .012, 0, floor + height * .38, -depth * .054, ink)
  for (const side of [-1, 1]) {
    box(width * .17, height * .29, .014, side * width * .33, floor + height * .52, -depth * .052, 0x6e8c87)
    box(.025, height * .31, .018, side * width * .33, floor + height * .52, -depth * .048, paper)
    box(.025, .19, depth * .55, side * (width / 2 - .025), floor + .095, depth * .20, paper)
  }
  // Stored drums, with skins and tension ropes; no automatic performance.
  for (let i = 0; i < 3; i++) {
    const x = -width * .32 + i * width * .12, z = depth * .12 + (i % 2) * .12
    const radius = width * .045, drumHeight = height * (.30 + (i % 2) * .09)
    add(new THREE.CylinderGeometry(radius, radius * .8, drumHeight, 10), wood, x, floor + drumHeight / 2, z)
    add(new THREE.CylinderGeometry(radius * 1.06, radius * 1.06, .012, 10), paper, x, floor + drumHeight, z)
    for (let rope = 0; rope < 6; rope++) {
      const angle = rope * Math.PI / 3
      box(.006, drumHeight * .85, .006, x + Math.cos(angle) * radius * .94, floor + drumHeight * .53, z + Math.sin(angle) * radius * .94, paper)
    }
  }
  // Costume rail underneath the eaves, visible from the map's fixed camera.
  const railX = width * .28, railZ = depth * .02, railY = floor + height * .67
  for (const x of [railX - width * .14, railX + width * .14]) box(.012, railY - floor, .012, x, (railY + floor) / 2, railZ, ink)
  box(width * .30, .012, .012, railX, railY, railZ, ink)
  for (let i = 0; i < 3; i++) {
    const costume = box(width * .07, height * .36, .02, railX + (i - 1) * width * .085, railY - height * .20, railZ, [purple, 0xdab75b, 0xc87966][i])
    costume.rotation.z = (i - 1) * .08
  }
  // A short garland spans the court. Flags remain static with pause/reduced motion.
  const poleX = width * .43, poleZ = depth * .35, poleY = height * 1.17
  for (const side of [-1, 1]) box(.018, poleY, .018, side * poleX, floor + poleY / 2, poleZ, ink)
  box(poleX * 2, .006, .006, 0, floor + poleY, poleZ, ink)
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * width * .105, size = width * .07
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-size / 2, 0, 0, size / 2, 0, 0, 0, -size * 1.2, 0], 3))
    geometry.setIndex([0, 2, 1])
    geometry.computeVertexNormals()
    const color = [paper, purple, 0xdab75b][i % 3], key = `flag-${color}`
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }))
    const flag = add(geometry, color, x, floor + poleY - Math.sin((i + 1) * Math.PI / 8) * .035, poleZ)
    flag.material = materials.get(key)
  }
  return { group, footprint: { width, depth }, markerHeight: floor + Math.max(height + .045, poleY) + .25 }
}
