import * as THREE from 'three'

function checkDimensions(dimensions) {
  for (const [name, value] of Object.entries(dimensions)) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be a positive finite scene dimension`)
  }
}

function quad(positions, a, b, c, d) {
  positions.push(...a, ...b, ...c, ...a, ...c, ...d)
}

function geometryFrom(positions) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

function addMesh(group, name, geometry, material) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

/**
 * A continuous row of red/cream plastic road barriers, 1 m high and 0.7 m deep.
 * Scene scale: 20 m/unit. Width follows local X, depth Z; the base is Y = 0.
 * Centred on X/Z, including the small feet. GPU resources belong to this call;
 * the caller places the group and owns disposal, as with the other landmarks.
 */
export function createRoadBarriers({ width = 0.6 } = {}) {
  const height = 0.05, depth = 0.035
  checkDimensions({ width })
  const group = new THREE.Group()
  group.name = 'road-barriers'
  const red = new THREE.MeshStandardMaterial({ color: 0xc65c48, roughness: 0.87, flatShading: true })
  const cream = new THREE.MeshStandardMaterial({ color: 0xf5edd9, roughness: 0.87, flatShading: true })

  // A low, broad foot narrows into the upright body; the cap has a small bevel.
  // Normalised coordinates keep the outer dimensions exact after mesh scaling.
  const rings = [
    [0, 0.5, 0.5], [0.12, 0.5, 0.5], [0.48, 0.5, 0.22],
    [0.92, 0.5, 0.22], [1, 0.46, 0.15],
  ].map(([y, x, z]) => [[-x, y, -z], [x, y, -z], [x, y, z], [-x, y, z]])
  const bodyPositions = []
  for (let ring = 1; ring < rings.length; ring++) {
    for (let side = 0; side < 4; side++) {
      const next = (side + 1) % 4
      quad(bodyPositions, rings[ring - 1][side], rings[ring][side], rings[ring][next], rings[ring - 1][next])
    }
  }
  quad(bodyPositions, ...rings[0])
  quad(bodyPositions, ...rings[rings.length - 1].toReversed())
  const body = geometryFrom(bodyPositions)

  // Broad plain reflectors on both faces, with no lettering or remote textures.
  const reflectorPositions = []
  for (const side of [-1, 1]) {
    const points = [
      [-0.36, 0.6, side * 0.225], [-0.36, 0.78, side * 0.225],
      [0.36, 0.78, side * 0.225], [0.36, 0.6, side * 0.225],
    ]
    quad(reflectorPositions, ...(side < 0 ? points : points.reverse()))
  }
  const reflectors = geometryFrom(reflectorPositions)
  // Nominal 2 m modules; cap their count to keep even wide closures inexpensive.
  const count = Math.min(24, Math.max(1, Math.ceil(width / 0.1)))
  const segmentWidth = width / count
  for (let i = 0; i < count; i++) {
    const x = -width / 2 + (i + 0.5) * segmentWidth
    const barrier = addMesh(group, `barrier-${i + 1}`, body, i % 2 ? cream : red)
    const reflector = addMesh(group, `reflectors-${i + 1}`, reflectors, i % 2 ? red : cream)
    for (const mesh of [barrier, reflector]) {
      mesh.scale.set(segmentWidth, height, depth)
      mesh.position.x = x
    }
  }

  return { group, footprint: { width, depth, height } }
}

/**
 * One closed, opaque white tarpaulin envelope over a broad irregular rubble heap.
 * Required width/depth are full scene dimensions along X/Z; height defaults to
 * exactly 4 m (0.2 scene units). The rectangular base is centred at Y = 0.
 * Raised ends span the entire width, with three broad humps and draped folds.
 * No exposed rocks, textures, animation or shared resources between calls.
 */
export function createCoveredRubble({ width, depth, height = 0.2 } = {}) {
  checkDimensions({ width, depth, height })
  const group = new THREE.Group()
  group.name = 'covered-rubble'

  // X, crest height, crest Z, front shoulder Z, rear shoulder Z. All coordinates
  // are normalised; the single 1.0 crest fixes the height without extra overlays.
  const sections = [
    [-0.5, 0.42, -0.04, -0.29, 0.28],
    [-0.4, 0.72, 0.02, -0.32, 0.3],
    [-0.29, 0.9, 0.06, -0.27, 0.32],
    [-0.18, 0.78, 0.01, -0.31, 0.26],
    [-0.13, 0.84, -0.03, -0.28, 0.29],
    [-0.02, 1, -0.05, -0.3, 0.27],
    [0.08, 0.87, 0.02, -0.26, 0.32],
    [0.13, 0.79, 0.06, -0.29, 0.3],
    [0.24, 0.91, 0.03, -0.31, 0.28],
    [0.36, 0.79, -0.02, -0.27, 0.31],
    [0.5, 0.46, 0.01, -0.3, 0.29],
  ].map(([x, crest, z, front, rear], i) => [
    [x, 0, -0.5],
    [x, crest * (i % 3 === 0 ? 0.56 : 0.62), front],
    [x, crest, z],
    [x, crest * (i % 3 === 1 ? 0.6 : 0.55), rear],
    [x, 0, 0.5],
  ])
  const shades = [0xf5f2e9, 0xfffdf5, 0xeeeadd].map(color => new THREE.Color(color))
  const positions = [], colors = []
  function triangle(a, b, c, color) {
    positions.push(...a, ...b, ...c)
    for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b)
  }

  for (let i = 0; i < sections.length - 1; i++) {
    const left = sections[i], right = sections[i + 1]
    // Gentle changes identify broad sheets; the folds themselves are geometry.
    const shade = shades[Math.min(2, Math.floor(i / 4))]
    for (let row = 0; row < left.length - 1; row++) {
      triangle(left[row], left[row + 1], right[row + 1], shade)
      triangle(left[row], right[row + 1], right[row], shade)
    }
    // The underside is covered too, with matching edges at every section.
    triangle(left[0], right[0], right[4], shade)
    triangle(left[0], right[4], left[4], shade)
  }
  for (const end of [0, sections.length - 1]) {
    const section = sections[end]
    for (let row = 1; row < section.length - 1; row++) {
      if (end === 0) triangle(section[0], section[row + 1], section[row], shades[0])
      else triangle(section[0], section[row], section[row + 1], shades[2])
    }
  }

  const geometry = geometryFrom(positions)
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, flatShading: true })
  const tarp = addMesh(group, 'white-tarpaulin', geometry, material)
  tarp.scale.set(width, height, depth)

  return { group, footprint: { width, depth, height } }
}
