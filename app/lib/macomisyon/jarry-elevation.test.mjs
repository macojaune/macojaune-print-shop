import test from 'node:test'
import assert from 'node:assert/strict'
import surfaces from './data/jarry-surfaces.json' with { type: 'json' }
import { geography, METRES_PER_UNIT, PROJECT_SITES } from './jarry-geography.js'
import { elevationAtMetres, groundHeight, padPoint, siteFoundations, siteHeights, terrainSegmentStops } from './jarry-elevation.js'

test('the four authored plinths have continuous foundations across their full terrain footprint', () => {
  for (const [id, pads] of Object.entries(siteFoundations)) for (const pad of pads) {
    const top = siteHeights[id] + pad.bottom
    for (let u = 0; u <= 30; u++) for (let v = 0; v <= 30; v++) {
      const point = padPoint(PROJECT_SITES[id], pad, (u / 30 - .5) * pad.width, (v / 30 - .5) * pad.depth)
      const terrain = groundHeight(...point)
      assert.ok(top >= terrain, `${id}: the pad intersects the terrain at ${point}`)
      assert.ok(pad.min - .025 <= terrain, `${id}: the foundation stops above the terrain at ${point}`)
    }
  }
  // The previous centre-only bank placement left almost five metres of air here.
  const bank = siteFoundations.memebank[0]
  const corner = groundHeight(-52.0625, -4.41)
  assert.ok(bank.min - .025 < corner && siteHeights.memebank + bank.bottom > corner)
})

test('the runtime sampler agrees with the exported terrain, including triangle interiors', () => {
  let checked = 0
  for (const surface of surfaces.layers.land) {
    for (let i = 0; i < surface.indices.length; i += 57) {
      const vertices = surface.indices.slice(i, i + 3).map(index => surface.positions.slice(index * 3, index * 3 + 3))
      if (vertices.length !== 3) continue
      const center = [0, 1, 2].map(axis => vertices.reduce((sum, vertex) => sum + vertex[axis], 0) / 3)
      assert.ok(center.every(Number.isFinite), 'A terrain triangle must contain finite coordinates')
      assert.ok(Math.abs(elevationAtMetres(center[0], center[2]) - center[1]) < 0.04, `Sampler does not match mesh at ${center}`)
      assert.ok(Math.abs(groundHeight(center[0] / METRES_PER_UNIT, center[2] / METRES_PER_UNIT) * METRES_PER_UNIT - center[1]) < 0.04, 'The vertical scale must equal the horizontal scale')
      checked++
    }
  }
  assert.ok(checked > 100, 'Check the exported neighbourhood, not a synthetic triangle')
})

test('street segments meet every terrain break instead of crossing through the ground', () => {
  let checked = 0
  for (const road of geography.roads.filter(road => !road.bridge).filter((_, index) => index % 5 === 0)) {
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1], b = road.points[i]
      const pointAt = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
      const stops = terrainSegmentStops(a, b)
      assert.equal(stops[0], 0)
      assert.equal(stops.at(-1), 1)
      for (let s = 1; s < stops.length; s++) {
        const start = pointAt(stops[s - 1]), end = pointAt(stops[s])
        const midpoint = pointAt((stops[s - 1] + stops[s]) / 2)
        const interpolated = (groundHeight(...start) + groundHeight(...end)) / 2
        assert.ok(Math.abs(interpolated - groundHeight(...midpoint)) < 1e-7, `Road ${road.id} crosses a terrain break without a vertex`)
        checked++
      }
    }
  }
  assert.ok(checked > 1000)
})
