import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/** A fictional Creole house, opened towards the fixed map camera (+X, +Z). */
export function createScoloLandmark() {
  const group = new THREE.Group()
  group.name = 'scolo-house'
  const parts = []
  const cube = new THREE.BoxGeometry(1, 1, 1)
  const transform = new THREE.Object3D()
  function box(width, height, depth, x, y, z, tint, pitch = 0, yaw = 0) {
    transform.position.set(x, y, z)
    transform.rotation.set(pitch, yaw, 0)
    transform.scale.set(width, height, depth)
    transform.updateMatrix()
    const geometry = cube.clone().applyMatrix4(transform.matrix)
    const color = new THREE.Color(tint)
    const colors = new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
    for (let i = 0; i < colors.count; i++) colors.setXYZ(i, color.r, color.g, color.b)
    geometry.setAttribute('color', colors)
    parts.push(geometry)
  }

  const cream = 0xffe8b3, timber = 0x36776d, shutter = 0x13594f
  const roof = 0xb95343, zinc = 0xe58e6e, floor = 0xe0b27e
  box(.9, .055, .8, 0, .0275, 0, cream)
  box(.86, .016, .76, 0, .063, 0, floor)
  // Clapboard walls, window and open shutters. The veranda side stays cut away.
  box(.83, .41, .04, 0, .273, -.345, timber)
  box(.035, .41, .38, -.398, .273, -.17, timber)
  box(.22, .22, .018, -.17, .27, -.316, cream)
  box(.18, .18, .012, -.17, .27, -.302, 0x263e3d)
  box(.013, .18, .009, -.17, .27, -.29, cream)
  for (const x of [-.334, -.006]) {
    box(.083, .22, .022, x, .27, -.307, shutter)
    for (const y of [.206, .248, .29, .332]) box(.075, .012, .011, x, y, -.29, 0x81b8a3)
  }
  // Short corrugated roof preserves the silhouette while exposing the room.
  box(.89, .036, .31, 0, .497, -.236, roof, -.26)
  for (let rib = -5; rib <= 5; rib++) box(.009, .007, .31, rib * .078, .518, -.236, zinc, -.26)
  box(.89, .034, .022, 0, .519, -.081, cream)
  for (let tooth = -5; tooth <= 5; tooth++) box(.045, .026, .019, tooth * .078, .493, -.081, cream)
  for (const x of [-.4, .4]) box(.026, .423, .026, x, .282, -.095, cream)

  // Parcels are stacked in two piles. Packing tape continues over the front edge.
  function carton(x, base, z, size, color) {
    const height = size * .82
    box(size, height, size, x, base + height / 2, z, color)
    box(size * .13, .003, size, x, base + height + .001, z, 0xf3cf8e)
    box(size * .13, height * .4, .003, x, base + height * .8, z + size / 2, 0xf3cf8e)
  }
  carton(.23, .071, -.16, .19, 0xb47440)
  carton(.23, .227, -.16, .15, 0xd99956)
  carton(.07, .071, -.1, .119, 0x9f6239)
  carton(-.30, .071, .13, .15, 0xde9e5a)

  // Curled segmented bodies and splayed legs lie still on the floorboards.
  function scolo(x, z, yaw) {
    const cos = Math.cos(yaw), sin = Math.sin(yaw)
    for (let i = 0; i < 6; i++) {
      const dx = (i - 2.5) * .017, dz = .004 * (i - 2.5) ** 2
      const px = x + dx * cos + dz * sin, pz = z - dx * sin + dz * cos
      const tangent = yaw - Math.atan(.47 * (i - 2.5))
      box(.011, .005, .046, px, .074, pz, 0xb46136, 0, tangent)
      box(.025, .013, .022, px, .081, pz, i === 5 ? 0x9a3e28 : 0x443430, 0, tangent)
    }
  }
  for (const [x, z, angle] of [[-.17, .28, .3], [.06, .19, 2.2], [.27, .26, -.9], [-.13, -.05, .85], [.29, .04, -.36]]) {
    scolo(x, z, angle)
  }

  const geometry = mergeGeometries(parts)
  cube.dispose()
  for (const part of parts) part.dispose()
  const house = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 }))
  house.name = 'scolo-cutaway'
  house.castShadow = house.receiveShadow = true
  group.add(house)
  return { group, footprint: { width: .9, depth: .8 }, markerHeight: .9 }
}
