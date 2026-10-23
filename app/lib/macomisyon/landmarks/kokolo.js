import * as THREE from 'three'

/**
 * A parked, empty car at Jarry's 20 metres per scene unit: 4.6 × 1.9 m.
 * Its nose faces +X, width runs along Z, and the tyres touch local Y = 0.
 * Resources belong to this instance; the world owns their eventual disposal.
 */
export function createKokoloLandmark() {
  const group = new THREE.Group()
  group.name = 'kokolo-landmark'

  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...extra })
  const paint = material(0x9aafa1)
  const cream = material(0xf4ead2)
  const glass = material(0x4d7477, { roughness: 0.28, metalness: 0.12 })
  const rubber = material(0x293330, { roughness: 0.96 })
  const trim = material(0x53645f)
  const alloy = material(0xc3c8b5, { roughness: 0.5, metalness: 0.35 })
  const headlamp = material(0xf6e0a4)
  const taillamp = material(0xc36b55)
  const cube = new THREE.BoxGeometry(1, 1, 1)

  function mesh(name, geometry, mat) {
    const object = new THREE.Mesh(geometry, mat)
    object.name = name
    object.castShadow = true
    object.receiveShadow = true
    group.add(object)
    return object
  }
  function box(name, size, position, mat) {
    const object = mesh(name, cube, mat)
    object.scale.set(...size)
    object.position.set(...position)
    return object
  }
  function surface(name, quads, mat) {
    const positions = []
    for (const [a, b, c, d] of quads) positions.push(...a, ...b, ...c, ...a, ...c, ...d)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.computeVertexNormals()
    return mesh(name, geometry, mat)
  }

  // A bevel catches the light; real wheel openings leave all four tyres visible.
  const profile = new THREE.Shape()
  profile.moveTo(-0.11, 0.019)
  for (const [x, y] of [
    [-0.11, 0.034], [-0.1, 0.042], [-0.078, 0.045],
    [0.052, 0.045], [0.085, 0.042], [0.11, 0.034], [0.11, 0.019],
  ]) profile.lineTo(x, y)
  const axleY = 0.016
  const archRadius = 0.019
  const archStart = Math.asin((0.019 - axleY) / archRadius)
  for (const axleX of [0.073, -0.073]) {
    for (let i = 0; i <= 8; i++) {
      const angle = archStart + (Math.PI - 2 * archStart) * i / 8
      profile.lineTo(axleX + Math.cos(angle) * archRadius, axleY + Math.sin(angle) * archRadius)
    }
  }
  profile.closePath()
  const body = new THREE.ExtrudeGeometry(profile, {
    depth: 0.084, steps: 1, curveSegments: 1,
    bevelEnabled: true, bevelSize: 0.001, bevelThickness: 0.001, bevelSegments: 1,
  })
  body.translate(0, 0, -0.042)
  mesh('body', body, paint)
  box('underbody', [0.177, 0.009, 0.065], [0, 0.018, 0], rubber)

  // Tapered cabin: cream pillars and roof surround opaque blue-green glazing.
  const rearLow = z => [-0.084, 0.044, z * 0.0395]
  const frontLow = z => [0.054, 0.044, z * 0.0395]
  const rearHigh = z => [-0.052, 0.074, z * 0.032]
  const frontHigh = z => [0.02, 0.074, z * 0.032]
  surface('cabin', [
    [rearLow(1), frontLow(1), frontHigh(1), rearHigh(1)],
    [frontLow(-1), rearLow(-1), rearHigh(-1), frontHigh(-1)],
    [frontLow(1), frontLow(-1), frontHigh(-1), frontHigh(1)],
    [rearLow(-1), rearLow(1), rearHigh(1), rearHigh(-1)],
    [rearHigh(1), frontHigh(1), frontHigh(-1), rearHigh(-1)],
    [rearLow(-1), frontLow(-1), frontLow(1), rearLow(1)],
  ], cream)

  const windows = []
  const halfWidthAt = y => 0.0395 - (y - 0.044) / 0.03 * 0.0075
  for (const side of [-1, 1]) {
    const onSide = (x, y) => [x, y, side * (halfWidthAt(y) + 0.00035)]
    for (const points of [
      [[-0.074, 0.048], [-0.018, 0.048], [-0.018, 0.069], [-0.05, 0.069]],
      [[-0.012, 0.048], [0.045, 0.048], [0.016, 0.069], [-0.012, 0.069]],
    ]) {
      const quad = points.map(([x, y]) => onSide(x, y))
      windows.push(side > 0 ? quad : quad.reverse())
    }
    // Mirrors stay within the advertised 1.9 m width, including their stems.
    box(`mirror-${side}`, [0.011, 0.005, 0.01], [0.039, 0.049, side * 0.0425], paint)
    windows.push([
      [0.0334, 0.0475, side * 0.0395], [0.0334, 0.0475, side * 0.046],
      [0.0334, 0.0505, side * 0.046], [0.0334, 0.0505, side * 0.0395],
    ])
    // Mirror glass faces the rear; reverse the opposite side's winding.
    if (side < 0) windows[windows.length - 1].reverse()
    for (const x of [-0.045, 0.024]) box(`door-handle-${side}-${x}`, [0.012, 0.0025, 0.0015], [x, 0.0395, side * 0.0435], alloy)
  }
  for (const front of [false, true]) {
    const onSlope = (y, side) => [
      (front ? 0.054 : -0.084) + (y - 0.044) / 0.03 * (front ? -0.034 : 0.032) + (front ? 0.00035 : -0.00035),
      y, side * (halfWidthAt(y) - 0.0035),
    ]
    const quad = [onSlope(0.048, -1), onSlope(0.069, -1), onSlope(0.069, 1), onSlope(0.048, 1)]
    windows.push(front ? quad : quad.reverse())
  }
  surface('glazing', windows, glass)

  const tyreGeometry = new THREE.CylinderGeometry(0.016, 0.016, 0.011, 12)
  const rimGeometry = new THREE.CylinderGeometry(0.0085, 0.0085, 0.001, 12)
  for (const x of [-0.073, 0.073]) {
    for (const side of [-1, 1]) {
      const tyre = mesh(`tyre-${x}-${side}`, tyreGeometry, rubber)
      tyre.rotation.x = Math.PI / 2
      tyre.position.set(x, axleY, side * 0.0415)
      const rim = mesh(`rim-${x}-${side}`, rimGeometry, alloy)
      rim.rotation.x = Math.PI / 2
      rim.position.set(x, axleY, side * 0.047)
    }
  }
  for (const end of [-1, 1]) {
    box(`bumper-${end}`, [0.007, 0.007, 0.073], [end * 0.1105, 0.0225, 0], trim)
    box(`number-plate-${end}`, [0.001, 0.005, 0.023], [end * 0.1145, 0.023, 0], cream)
    for (const side of [-1, 1]) {
      box(`lamp-${end}-${side}`, [0.004, 0.008, 0.017], [end * 0.11, 0.0335, side * 0.027], end > 0 ? headlamp : taillamp)
    }
  }
  box('front-grille', [0.002, 0.006, 0.025], [0.111, 0.031, 0], rubber)

  return { group, footprint: { width: 0.23, depth: 0.095 }, markerHeight: 0.12 }
}
