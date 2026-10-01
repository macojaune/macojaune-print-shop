import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createVhsArchives } from './tapes.js'

function fixture() {
  const root = new THREE.Group()
  const geometries = new Map()
  const material = new THREE.MeshBasicMaterial()
  const geometry = (key, make) => { if (!geometries.has(key)) geometries.set(key, make()); return geometries.get(key) }
  const group = (parent, position = [0, 0, 0]) => { const object = new THREE.Group(); object.position.set(...position); parent.add(object); return object }
  const mesh = (parent, shape, _color, position = [0, 0, 0]) => { const object = new THREE.Mesh(shape, material); object.position.set(...position); parent.add(object); return object }
  const box = (parent, size, position, color) => { const object = mesh(parent, geometry('box', () => new THREE.BoxGeometry()), color, position); object.scale.set(...size); return object }
  const disc = (parent, radius, depth, position, color) => { const object = mesh(parent, geometry('disc', () => new THREE.CylinderGeometry(1, 1, 1, 8)), color, position); object.scale.set(radius, depth, radius); return object }
  const palette = Object.fromEntries(['ink','deepInk','paper','steelLight','brass'].map(key => [key, 0x999999]))
  const result = createVhsArchives({ root, group, box, mesh, disc, geometry, painted: () => material, palette })
  return { ...result, root, dispose: () => { geometries.forEach(value => value.dispose()); material.dispose() } }
}

test('The blind vault holds 35 VHS tapes plus one ceremonial cassette, not a lounge', () => {
  const scene = fixture()
  try {
    let count = 0
    scene.archives.traverse(object => { if (object.name === 'vhs-cassette') count++ })
    assert.equal(count, 35)
    assert.equal(scene.heroTape.name, 'vhs-cassette')
    assert.equal(scene.heroTape.parent, scene.root)
  } finally { scene.dispose() }
})

test('A closed vault hides the archive and its outbound cassette', () => {
  const scene = fixture()
  try {
    scene.update(0)
    assert.equal(scene.archives.visible, false)
    assert.equal(scene.heroTape.visible, false)
    scene.update(.5)
    assert.equal(scene.archives.visible, true)
    assert.equal(scene.heroTape.visible, false)
  } finally { scene.dispose() }
})

test('An open saved state projects the same final cassette pose without an animation clock', () => {
  const scene = fixture()
  try {
    scene.update(.82)
    const intermediate = scene.heroTape.position.z
    assert.ok(intermediate > -1.85 && intermediate < .8)
    scene.update(1)
    assert.equal(scene.archives.visible, true)
    assert.equal(scene.heroTape.visible, true)
    assert.ok(Math.abs(scene.heroTape.position.z - .8) < 1e-8)
    const final = scene.heroTape.position.toArray()
    scene.update(0); scene.update(1)
    assert.deepEqual(scene.heroTape.position.toArray(), final)
  } finally { scene.dispose() }
})
