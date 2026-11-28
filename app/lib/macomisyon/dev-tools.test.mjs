import assert from 'node:assert/strict'
import test from 'node:test'
import { devSections, devToolsFlag, registerDevSections } from './dev-tools.js'

test('dev sections follow the context and an interior hides the map controls', () => {
  const section = (id, context, focus) => ({ id, title: id, context, focus, actions: [] })
  const offGlobal = registerDevSections('global', () => section('reset', 'global'))
  const offMap = registerDevSections('map', () => [section('bank', 'map'), section('scolo', 'map', true)])
  assert.deepEqual(devSections().map(item => item.id), ['scolo', 'bank', 'reset'])
  const offInterior = registerDevSections('depot', () => section('depot', 'interior'))
  assert.deepEqual(devSections().map(item => item.id), ['depot', 'reset'])
  offInterior()
  assert.deepEqual(devSections().map(item => item.id), ['scolo', 'bank', 'reset'])
  const stale = offMap
  registerDevSections('map', () => section('other', 'map'))
  stale()
  assert.deepEqual(devSections().map(item => item.id), ['other', 'reset'], 'A replaced getter is not removed by the old unregister')
  offGlobal()
})

test('the runtime flag accepts only explicit enabled values', () => {
  for (const value of [true, 'true', '1']) assert.equal(devToolsFlag(value), true)
  for (const value of [false, 'false', '', '0', undefined, null, 'yes']) assert.equal(devToolsFlag(value), false)
})
