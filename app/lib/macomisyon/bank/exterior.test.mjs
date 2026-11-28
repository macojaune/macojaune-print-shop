import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createBankExterior } from './exterior.js'

function fixture() {
  const scene = new THREE.Scene()
  const resources = new Set()
  const mat = new THREE.MeshBasicMaterial()
  const cube = new THREE.BoxGeometry()
  resources.add(cube)
  const mesh = (shape, _color, position, parent = scene) => { resources.add(shape); const result = new THREE.Mesh(shape, mat); result.position.set(...position); parent.add(result); return result }
  const box = (size, position, color, parent) => { const result = mesh(cube, color, position, parent); result.scale.set(...size); return result }
  const palette = { ink: 0x173b3c, paper: 0xf1ebd3, yellow: 0xffcf43, pavement: 0xa9b79b }
  const bank = createBankExterior({ scene, box, mesh, palette })
  return { bank, dispose: () => { resources.forEach(item => item.dispose()); mat.dispose(); scene.clear() } }
}
const closed = { counts: { newsletter: 0 }, completed: [], betaOpen: false }
const open = { counts: { newsletter: 8 }, completed: ['curiosity', 'newsletter'], betaOpen: true }

test('First persisted exterior is final immediately, without replaying the shutter', () => {
  const { bank, dispose } = fixture()
  try { bank.setState(open, { animate: true }); assert.deepEqual(bank.getDebug(), { unlocked: true, betaOpen: true, aperture: 1 }) }
  finally { dispose() }
})
test('A newly reached curiosity objective animates, then can be settled by pause', () => {
  const { bank, dispose } = fixture()
  try {
    bank.setState(closed)
    bank.setState(open, { animate: true })
    assert.equal(bank.getDebug().aperture, 0)
    bank.update(.1)
    assert.ok(bank.getDebug().aperture > 0 && bank.getDebug().aperture < 1)
    bank.settle()
    assert.equal(bank.getDebug().aperture, 1)
  } finally { dispose() }
})
test('Paused or hidden exterior projects resets without pending animation', () => {
  const { bank, dispose } = fixture()
  try { bank.setState(open); bank.setState(closed, { animate: false }); assert.deepEqual(bank.getDebug(), { unlocked: false, betaOpen: false, aperture: 0 }) }
  finally { dispose() }
})
