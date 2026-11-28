import assert from 'node:assert/strict'
import test from 'node:test'
import { createScoloStore, weapons } from './scolo/model.js'

function browserStorage() {
  const values = new Map()
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}

test('weapons are validated in any order, once each, and the third readies the move', () => {
  const storage = browserStorage()
  const store = createScoloStore({ storage })
  assert.deepEqual(weapons.map(weapon => weapon.id), ['sandale', 'coutelas', 'digrain'])
  assert.deepEqual(store.getState(), { completed: [], ready: false })
  for (const invalid of [null, 'unknown', '__proto__']) store.validate(invalid)
  assert.equal(storage.values.size, 0)
  assert.deepEqual(store.validate('digrain'), { completed: ['digrain'], ready: false })
  assert.deepEqual(store.validate('digrain'), { completed: ['digrain'], ready: false })
  assert.deepEqual(store.validate('sandale'), { completed: ['sandale', 'digrain'], ready: false }, 'Completed weapons keep the room order')
  assert.deepEqual(store.validate('coutelas'), { completed: ['sandale', 'coutelas', 'digrain'], ready: true })
  assert.deepEqual(createScoloStore({ storage }).getState(), store.getState())
})

test('two tabs share validated weapons through storage', () => {
  const storage = browserStorage()
  const first = createScoloStore({ storage })
  const second = createScoloStore({ storage })
  first.validate('coutelas')
  assert.deepEqual(second.validate('sandale').completed, ['sandale', 'coutelas'])
  storage.setItem('macomisyon-scolo-v2:digrain', 'broken')
  assert.equal(createScoloStore({ storage }).getState().completed.includes('digrain'), false)
})

test('blocked reads and writes leave the house usable in memory', () => {
  const denied = () => { throw new Error('Storage unavailable') }
  for (const storage of [null, { getItem: denied, setItem: denied, removeItem: denied }]) {
    const store = createScoloStore({ storage })
    for (const weapon of weapons) store.validate(weapon.id)
    assert.deepEqual(store.getState(), { completed: ['sandale', 'coutelas', 'digrain'], ready: true })
  }
})

test('the development reset forgets every validated weapon on this device', () => {
  const storage = browserStorage()
  const store = createScoloStore({ storage })
  for (const weapon of weapons) store.validate(weapon.id)
  assert.deepEqual(store.reset(), { completed: [], ready: false })
  assert.equal(storage.values.size, 0)
  assert.deepEqual(createScoloStore({ storage }).getState(), { completed: [], ready: false })
})
