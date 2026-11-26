import * as THREE from 'three'

/**
 * A compact fictional volcano, centred on X/Z with its base at Y = 0.
 * Width/depth are the full scene-unit envelope, height is the highest rim point.
 * The footprint outline is the unclosed X/Z base polygon, in scene units.
 * Three static meshes, no terrain, lights or shared GPU resources. The caller
 * places the landmark and disposes its geometries/materials with the world.
 */
export function createMaggmaLandmark({ width = 1.5, depth = 1.5, height = 1.1 } = {}) {
  for (const [name, value] of Object.entries({ width, depth, height })) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be a positive finite scene dimension`)
  }
  const group = new THREE.Group()
  group.name = 'maggma-landmark'
  const segments = 12
  const baseRadii = [1, 0.92, 0.97, 1, 0.94, 0.96, 1, 0.95, 0.91, 1, 0.96, 0.94]
  const rimHeights = [0.94, 0.97, 0.95, 0.92, 1, 0.98, 0.94, 0.91, 0.95, 0.98, 0.96, 0.92]
  const rockColors = [0x3b4241, 0x454b48, 0x505650, 0x414744].map(color => new THREE.Color(color))
  const innerColor = new THREE.Color(0x292f2e)
  const lipColor = new THREE.Color(0x555a52)
  const rock = { positions: [], colors: [] }
  const lava = { positions: [] }
  const embers = { positions: [] }

  function triangle(target, a, b, c, color) {
    for (const point of [a, b, c]) target.positions.push(point[0] * width, point[1] * height, point[2] * depth)
    if (color) for (let i = 0; i < 3; i++) target.colors.push(color.r, color.g, color.b)
  }
  function joinRings(from, to, colorAt) {
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments
      const color = colorAt(i)
      triangle(rock, from[i], to[i], to[j], color)
      triangle(rock, from[i], to[j], from[j], color)
    }
  }
  function ring(radiusAt, heightAt, centerX = 0, centerZ = 0) {
    return Array.from({ length: segments }, (_, i) => {
      const angle = i * Math.PI * 2 / segments
      const radius = radiusAt(i)
      return [centerX + Math.cos(angle) * radius, heightAt(i), centerZ + Math.sin(angle) * radius]
    })
  }

  const base = ring(i => 0.5 * baseRadii[i], () => 0)
  const shoulder = ring(i => 0.33 * baseRadii[i], i => 0.36 + (rimHeights[i] - 0.94) * 0.6, -0.015, 0.01)
  const outerRim = ring(i => 0.21 + (baseRadii[i] - 1) * 0.1, i => rimHeights[i], -0.035, 0.015)
  const innerRim = ring(i => 0.15 + (baseRadii[i] - 1) * 0.07, i => rimHeights[i] - 0.018, -0.035, 0.015)
  const pool = ring(() => 0.105, () => 0.66, -0.035, 0.015)
  joinRings(base, shoulder, i => rockColors[i % rockColors.length])
  joinRings(shoulder, outerRim, i => rockColors[(i + 1) % rockColors.length])
  joinRings(outerRim, innerRim, () => lipColor)
  joinRings(innerRim, pool, () => innerColor)
  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments
    triangle(rock, [0, 0, 0], base[i], base[j], innerColor)
    triangle(lava, [-0.035, 0.66, 0.015], pool[j], pool[i])
  }

  // Narrow seams follow two actual mesh edges; they stop on the slope instead
  // of flowing onto the map. Tiny offsets keep them above the rock facets.
  for (const index of [2, 8]) {
    const angle = index * Math.PI * 2 / segments
    const outward = [Math.cos(angle), 0, Math.sin(angle)]
    const tangent = [-Math.sin(angle), 0, Math.cos(angle)]
    const tip = base[index].map((value, axis) => THREE.MathUtils.lerp(shoulder[index][axis], value, 0.48))
    const points = [outerRim[index], shoulder[index], tip]
    const halfWidths = [0.005, 0.006, 0.001]
    const edges = points.map((point, i) => [-1, 1].map(side => point.map((value, axis) =>
      value + outward[axis] * 0.003 + (axis === 1 ? 0.003 : 0) + tangent[axis] * halfWidths[i] * side,
    )))
    for (let i = 0; i < edges.length - 1; i++) {
      const [a, b] = edges[i]
      const [c, d] = edges[i + 1]
      triangle(lava, a, b, c)
      triangle(lava, b, d, c)
    }
  }

  // Small warm patches in the recessed pool, with no plume or moving effect.
  const hotCenter = [-0.04, 0.661, 0.018]
  const hotRing = ring(i => i % 2 ? 0.043 : 0.052, () => 0.661, hotCenter[0], hotCenter[2])
  for (let i = 0; i < segments; i++) triangle(embers, hotCenter, hotRing[(i + 1) % segments], hotRing[i])

  function mesh(name, data, material) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3))
    if (data.colors) geometry.setAttribute('color', new THREE.Float32BufferAttribute(data.colors, 3))
    geometry.computeVertexNormals()
    const object = new THREE.Mesh(geometry, material)
    object.name = name
    object.castShadow = name === 'rock'
    object.receiveShadow = name === 'rock'
    group.add(object)
  }
  mesh('rock', rock, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, flatShading: true }))
  mesh('lava', lava, new THREE.MeshStandardMaterial({ color: 0xc66b3f, emissive: 0xed6e2f, emissiveIntensity: 0.45, roughness: 0.86 }))
  mesh('embers', embers, new THREE.MeshStandardMaterial({ color: 0xe9a45a, emissive: 0xff963f, emissiveIntensity: 0.6, roughness: 0.8 }))

  return {
    group,
    footprint: { width, depth, outline: base.map(([x, , z]) => [x * width, z * depth]) },
    markerHeight: height + Math.min(width, depth) * 0.15,
  }
}
