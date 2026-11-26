import assert from 'node:assert/strict'
import test from 'node:test'
import { createScoloStore, missions } from './scolo/model.js'

function browserStorage() {
  const values = new Map()
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('visiting does not progress the demo, and only one simulated finish per game counts, in order', () => {
  const storage = browserStorage()
  const store = createScoloStore({ storage })
  const ids = ['sandale', 'coutelas', 'digrain']
  assert.deepEqual(missions.map(mission => mission.id), ids)
  assert.deepEqual(store.getState(), { completed: [], moved: false })
  for (const invalid of [null, 'coutelas', 'digrain', 'unknown']) store.contribute(invalid)
  assert.equal(storage.values.size, 0)
  for (const [i, id] of ids.entries()) {
    const state = store.contribute(id)
    assert.deepEqual(state, { completed: ids.slice(0, i + 1), moved: i === 2 })
    assert.deepEqual(store.contribute(id), state)
    state.completed.length = 0
    assert.deepEqual(createScoloStore({ storage }).getState(), store.getState())
  }
})

test('two tabs retain previous finishes across reloads and ignore out-of-order stored data', () => {
  const storage = browserStorage()
  const first = createScoloStore({ storage })
  const second = createScoloStore({ storage })
  first.contribute('sandale')
  second.contribute('coutelas')
  assert.deepEqual(first.contribute('digrain'), { completed: ['sandale', 'coutelas', 'digrain'], moved: true })
  assert.equal(second.getState().moved, true)
  const firstKey = [...storage.values.keys()][0]
  storage.setItem(firstKey, 'broken')
  assert.deepEqual(createScoloStore({ storage }).getState(), { completed: [], moved: false })
})

test('blocked reads and writes leave the demo playable in memory', () => {
  const denied = () => { throw new Error('Storage unavailable') }
  for (const storage of [null, { getItem: denied, setItem: denied }]) {
    const store = createScoloStore({ storage })
    for (const mission of missions) store.contribute(mission.id)
    assert.deepEqual(store.getState(), { completed: ['sandale', 'coutelas', 'digrain'], moved: true })
  }
})

test('a later successful write also saves a finish made while storage was blocked', () => {
  const storage = browserStorage()
  const write = storage.setItem
  storage.setItem = () => { throw new Error('Storage full') }
  const store = createScoloStore({ storage })
  store.contribute('sandale')
  storage.setItem = write
  store.contribute('coutelas')
  assert.deepEqual(createScoloStore({ storage }).getState(), { completed: ['sandale', 'coutelas'], moved: false })
})
