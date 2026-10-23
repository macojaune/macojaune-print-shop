import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import ts from 'typescript'
import * as placesModule from './places.js'
import * as depotModule from './depot/model.js'
import * as bankModule from './bank/model.js'

const icon = { props: ['name'], setup: props => () => Vue.h('svg', { 'data-icon': props.name }) }

// Run the real SFC handlers and render functions without a browser or WebGL.
function harness() {
  const document = { hidden: false, addEventListener() {}, removeEventListener() {} }
  class Element {
    constructor(tag, text = '') {
      Object.assign(this, { tag, text, props: {}, style: {}, children: [], parent: null })
      Vue.markRaw(this)
    }
    [Symbol.for('nodejs.util.inspect.custom')]() { return `<${this.tag}${this.props.id ? `#${this.props.id}` : ''}>` }
    get isConnected() { return this === document.body || !!this.parent?.isConnected }
    contains(node) {
      for (let current = node; current; current = current.parent) if (current === this) return true
      return false
    }
    closest(selectors) {
      for (let current = this; current; current = current.parent) {
        if (selectors.split(',').some(selector => {
          selector = selector.trim()
          if (selector.startsWith('.')) return String(current.props.class || '').split(/\s+/).includes(selector.slice(1))
          const attribute = selector.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/)
          assert.ok(attribute, `Unsupported test selector: ${selector}`)
          const value = current.props[attribute[1]]
          return attribute[2] === undefined ? value != null && value !== false : String(value) === attribute[2]
        })) return current
      }
      return null
    }
    getClientRects() {
      if (!this.isConnected) return []
      for (let current = this; current; current = current.parent) if (current.style.display === 'none') return []
      return [{ x: 0, y: 0, width: 44, height: 44 }]
    }
    focus(options) {
      if (!this.getClientRects().length || this.closest('[inert]')) return
      document.activeElement = this
      this.focusOptions = options
    }
  }
  const remove = node => {
    if (node.contains(document.activeElement)) document.activeElement = document.body
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = null
  }
  const insert = (node, parent, anchor) => {
    if (node.parent) remove(node)
    const index = parent.children.indexOf(anchor)
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
    node.parent = parent
  }
  const renderer = Vue.createRenderer({
    createElement: tag => new Element(tag),
    createText: text => new Element('#text', text),
    createComment: text => new Element('#comment', text),
    setText: (node, text) => { node.text = text },
    setElementText: (node, text) => { node.text = text; [...node.children].forEach(remove) },
    patchProp: (node, key, _previous, value) => {
      node.props[key] = value
      if (key === 'style') node.style = { ...value }
    },
    insert, remove,
    parentNode: node => node.parent,
    nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
    insertStaticContent(content, parent, anchor) {
      const node = new Element('#static', content)
      insert(node, parent, anchor)
      return [node, node]
    },
  })
  // A deterministic clock exercises the page's credit timeout without real waits.
  let now = 0
  let nextHandle = 0
  const frames = new Map()
  const timers = new Map()
  const clock = {
    requestAnimationFrame(callback) { frames.set(++nextHandle, callback); return nextHandle },
    cancelAnimationFrame(handle) { frames.delete(handle) },
    setTimeout(callback, delay) { timers.set(++nextHandle, { callback, at: now + delay }); return nextHandle },
    clearTimeout(handle) { timers.delete(handle) },
    async frame() {
      const callbacks = [...frames.values()]
      frames.clear()
      callbacks.forEach(callback => callback(now))
      await Vue.nextTick()
    },
    async advance(milliseconds) {
      const end = now + milliseconds
      for (;;) {
        const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0]
        if (!next) break
        const [handle, timer] = next
        timers.delete(handle)
        now = timer.at
        timer.callback()
        await Vue.nextTick()
      }
      now = end
    },
  }
  const globals = {
    ...Vue,
    definePageMeta() {}, useSeoMeta() {},
    document,
    localStorage: { getItem() { return null }, setItem() {} },
    ...clock, HTMLElement: Element, Node: Element,
  }
  function compile(relativePath, imports, extraGlobals = {}) {
    const filename = new URL(relativePath, import.meta.url).pathname
    const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename })
    assert.deepEqual(errors, [])
    const script = compileScript(descriptor, { id: filename, inlineTemplate: true, templateOptions: { compilerOptions: { hoistStatic: false } } })
    const { outputText, diagnostics } = ts.transpileModule(script.content, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS } })
    assert.deepEqual(diagnostics, [])
    const module = { exports: {} }
    const scope = { ...globals, ...extraGlobals }
    const require = name => {
      if (name === 'vue') return Vue
      assert.ok(name in imports, `Unexpected import: ${name}`)
      return imports[name]
    }
    new Function('require', 'module', 'exports', ...Object.keys(scope), outputText)(require, module, module.exports, ...Object.values(scope))
    return module.exports.default
  }
  const root = new Element('body')
  document.body = root
  document.activeElement = root
  const walk = node => [node, ...node.children.flatMap(walk)]
  const all = predicate => walk(root).filter(predicate)
  const byClass = value => all(node => String(node.props.class || '').split(/\s+/).includes(value))
  const text = node => node.tag === '#comment' ? '' : node.text + node.children.map(text).join('')
  const click = async node => {
    assert.ok(node, 'The control exists')
    assert.equal(node.isConnected, true, 'The control is still mounted')
    assert.notEqual(node.props.disabled, true, 'The control is enabled')
    node.focus()
    await node.props.onClick({ detail: 0, currentTarget: node })
    await Vue.nextTick()
  }
  const keydown = async (key = 'Escape') => {
    const event = { key, prevented: false, stopped: false, preventDefault() { this.prevented = true }, stopPropagation() { this.stopped = true } }
    all(node => node.tag === 'main')[0].props.onKeydown(event)
    await Vue.nextTick()
    return event
  }
  return { renderer, compile, root, walk, all, byClass, text, click, keydown, clock, document, focused: () => document.activeElement }
}

async function mountPage(t) {
  const h = harness()
  const route = Vue.reactive({ query: {} })
  const navigations = []
  const cameraCalls = []
  let view = { target: [124, 0, 81], zoom: 1.7 }
  let callbacks
  let selected
  const map = h.compile('../../components/macomisyon/JarryMap.client.vue', {
    './GameIcon.vue': { default: icon },
    '../../lib/macomisyon/places.js': placesModule,
    '../../lib/macomisyon/jarry-world.js': {
      createJarryWorld(_surface, next) {
        callbacks = next
        return {
          setPaused() {}, setActive() {}, setRepaired() {}, setBankState() {}, setBottomInset() {}, dispose() {},
          setSelected(id) { selected = id },
          async focusProject(id) { cameraCalls.push(['focusProject', id]) },
          resetView() { cameraCalls.push(['resetView']); view = { target: [0, 0, 0], zoom: 1 } },
          zoomBy(factor) { cameraCalls.push(['zoomBy', factor]); view.zoom *= factor },
          getView() { return structuredClone(view) },
          async setView(nextView) { cameraCalls.push(['setView', nextView]); view = structuredClone(nextView) },
        }
      },
    },
  })
  const navigate = target => { navigations.push(target); route.query = { ...target.query } }
  const page = h.compile('../../pages/macomisyon/index.vue', {
    '../../components/macomisyon/GameIcon.vue': { default: icon },
    '../../lib/macomisyon/places.js': placesModule,
    '../../lib/macomisyon/depot/model.js': depotModule,
    '../../lib/macomisyon/bank/model.js': bankModule,
  }, {
    useRoute: () => route,
    useRouter: () => ({ push: navigate, replace: navigate }),
  })
  const app = h.renderer.createApp(page)
  app.component('NuxtLink', { props: ['to'], setup: (props, { slots }) => () => Vue.h('a', { href: props.to }, slots.default?.()) })
  app.component('ClientOnly', { setup: (_props, { slots }) => () => slots.default?.() })
  app.component('MacomisyonJarryMap', map)
  app.component('LazyMacomisyonMemeBank', { render: () => Vue.h('section', { 'data-interior': 'bank' }) })
  app.component('LazyMacomisyonDepotQ', { render: () => Vue.h('section', { 'data-interior': 'depot-q' }) })
  app.mount(h.root)
  t.after(() => app.unmount())
  await new Promise(resolve => setImmediate(resolve))
  await Vue.nextTick()
  assert.ok(callbacks, 'The real map component started its stubbed 3D world')
  const labels = placesModule.places.map((place, index) => ({ id: place.id, x: 80 * index, y: 80, visible: true }))
  callbacks.onLabels(labels)
  await Vue.nextTick()
  const placesButton = () => h.all(node => node.tag === 'button' && node.props['aria-controls'] === 'places-panel')[0]
  const helpButton = () => h.all(node => node.tag === 'button' && node.props['aria-controls'] === 'help-panel')[0]
  const marker = id => h.all(node => node.props['data-project'] === id)[0]
  const openList = () => h.click(placesButton())
  const select = async name => {
    await openList()
    const row = h.byClass('place-row').find(node => h.text(node).includes(name))
    await h.click(row)
    return row
  }
  const mapSelect = async id => { callbacks.onSelect(id); await Vue.nextTick() }
  const dock = () => h.byClass('project-dock')[0]
  const closeButton = () => h.all(node => node.tag === 'button' && node.props['aria-label'] === 'Fermer la fiche du lieu')[0]
  const assertDetail = id => {
    const place = placesModule.places.find(place => place.id === id)
    assert.equal(h.byClass('project-dock').length, 1)
    assert.equal(h.byClass('place-detail').length, 1)
    assert.equal(dock().tag, 'section')
    assert.equal(dock().parent, h.byClass('world-layer')[0])
    assert.equal(dock().props['aria-labelledby'], 'place-detail-title')
    const title = h.walk(dock()).find(node => node.tag === 'h2')
    assert.equal(title.props.id, 'place-detail-title')
    assert.equal(String(title.props.tabindex), '-1')
    assert.equal(h.text(title), place.name)
    assert.equal(h.focused(), title)
    assert.deepEqual(title.focusOptions, { preventScroll: true })
    assert.ok(closeButton())
    assert.equal(h.byClass('map-panel').length, 0)
    assert.equal(selected, id)
  }
  return { ...h, route, navigations, cameraCalls, callbacks, labels, marker, placesButton, helpButton, openList, select, mapSelect, dock, closeButton, assertDetail, selected: () => selected, view: () => structuredClone(view) }
}

test('the place window is absent initially and map selection focuses its accessible heading', async t => {
  const h = await mountPage(t)
  assert.equal(h.dock(), undefined)
  assert.equal(h.closeButton(), undefined)
  assert.equal(h.selected(), null)
  assert.equal(h.placesButton().props.id, 'project-access')
  assert.equal(h.all(node => node.props.id === 'project-access').length, 1)
  assert.equal(h.byClass('game-skip')[0].props.href, '#project-access')

  // A pointer selection starts with the body focused, as on a canvas tap.
  await h.mapSelect('kokolo')
  h.assertDetail('kokolo')
  assert.deepEqual(h.cameraCalls, [['focusProject', 'kokolo']])
  await h.click(h.closeButton())
  assert.equal(h.dock(), undefined)
  assert.equal(h.focused(), h.placesButton())

  // Keyboard activation takes the real marker -> component emit -> page path.
  const marker = h.marker('maggma-studio')
  await h.click(marker)
  h.assertDetail('maggma-studio')
  const cameraCalls = [...h.cameraCalls]
  const view = h.view()
  await h.click(h.closeButton())
  assert.equal(h.dock(), undefined)
  assert.equal(h.selected(), null)
  assert.equal(h.focused(), marker)
  assert.deepEqual(marker.focusOptions, { preventScroll: true })
  assert.deepEqual(h.cameraCalls, cameraCalls, 'Closing never moves or recentres the map')
  assert.deepEqual(h.view(), view)
  assert.deepEqual(h.navigations, [])
})

test('list selection focuses the heading and closing falls back from the unmounted row', async t => {
  const h = await mountPage(t)
  await h.openList()
  assert.equal(h.focused().props.id, 'places-title')
  assert.equal(h.dock(), undefined)
  const row = h.byClass('place-row').find(node => h.text(node).includes('La voiture à l’écart'))
  await h.click(row)
  h.assertDetail('kokolo')
  assert.equal(row.isConnected, false)
  const cameraCalls = [...h.cameraCalls]
  const event = await h.keydown()
  assert.equal(event.prevented, true)
  assert.equal(event.stopped, true)
  assert.equal(h.dock(), undefined)
  assert.equal(h.selected(), null)
  assert.equal(h.focused(), h.placesButton())
  assert.deepEqual(h.cameraCalls, cameraCalls)
})

test('closing rejects disconnected, layoutless, hidden, inert and offscreen map triggers', async t => {
  const cases = [
    ['selected-only marker removed on close', 'kokolo', () => {}],
    ['ancestor without a layout box', 'maggma-studio', (_h, marker) => { marker.parent.style.display = 'none' }],
    ['aria-hidden ancestor', 'maggma-studio', (_h, marker) => { marker.parent.props['aria-hidden'] = 'true' }],
    ['inert ancestor', 'maggma-studio', (_h, marker) => { marker.parent.props.inert = '' }],
    ['offscreen marker', 'maggma-studio', (h, marker) => {
      h.callbacks.onLabels(h.labels.map(label => ({ ...label, visible: label.id !== marker.props['data-project'] })))
    }],
  ]
  for (const [name, id, hide] of cases) await t.test(name, async t => {
    const h = await mountPage(t)
    if (id === 'kokolo') await h.mapSelect(id)
    const marker = h.marker(id)
    await h.click(marker)
    h.assertDetail(id)
    hide(h, marker)
    await Vue.nextTick()
    const cameraCalls = [...h.cameraCalls]
    await h.click(h.closeButton())
    assert.equal(h.dock(), undefined)
    assert.equal(h.selected(), null)
    assert.equal(h.focused(), h.placesButton())
    assert.deepEqual(h.cameraCalls, cameraCalls)
    if (id === 'kokolo') assert.equal(marker.isConnected, false)
  })
})

test('another place replaces the window and keeps the map trigger when selected from inside it', async t => {
  const h = await mountPage(t)
  await h.click(h.marker('omasla'))
  h.assertDetail('omasla')
  const previous = h.dock()
  const trigger = h.marker('zikak')
  await h.click(trigger)
  h.assertDetail('zikak')
  assert.equal(previous.isConnected, false)
  assert.doesNotMatch(h.text(h.dock()), /tambours rangés/)
  const closedPlace = h.byClass('closed-place')[0]
  await h.click(closedPlace)
  h.assertDetail('quilivreou')
  assert.equal(closedPlace.isConnected, false)
  assert.equal(h.navigations.length, 0)
  const cameraCalls = [...h.cameraCalls]
  await h.keydown()
  assert.equal(h.dock(), undefined)
  assert.equal(h.focused(), trigger, 'An action inside the detail does not replace its external trigger')
  assert.deepEqual(h.cameraCalls, cameraCalls)
})

test('places and help replace the detail, and Escape closes only the active exterior window', async t => {
  const h = await mountPage(t)
  for (const [button, title] of [[h.placesButton, 'places-title'], [h.helpButton, 'help-title']]) {
    await h.click(h.marker('maggma-studio'))
    h.assertDetail('maggma-studio')
    await h.click(button())
    assert.equal(h.selected(), null)
    assert.equal(h.dock(), undefined)
    assert.equal(h.byClass('map-panel').length, 1)
    assert.equal(h.focused().props.id, title)
    const cameraCalls = [...h.cameraCalls]
    const event = await h.keydown()
    assert.equal(event.prevented, true)
    assert.equal(event.stopped, true)
    assert.equal(h.byClass('map-panel').length, 0)
    assert.equal(h.dock(), undefined, 'Closing a panel does not resurrect a previous detail')
    assert.equal(h.focused(), button())
    assert.deepEqual(h.cameraCalls, cameraCalls)
  }
  await h.click(h.helpButton())
  await h.click(h.placesButton())
  assert.equal(h.byClass('map-panel').length, 1)
  assert.equal(h.focused().props.id, 'places-title')
  await h.click(h.placesButton())
  assert.equal(h.byClass('map-panel').length, 0)
  assert.equal(h.focused(), h.placesButton())
  assert.equal((await h.keydown()).prevented, false)

  await h.click(h.marker('quilivreou'))
  h.assertDetail('quilivreou')
  assert.equal((await h.keydown('Enter')).prevented, false)
  assert.ok(h.dock())
  await h.click(h.byClass('enter-depot')[0])
  assert.equal(h.route.query.lieu, 'depot-q')
  assert.equal(h.all(node => node.props['data-interior'] === 'depot-q').length, 1)
  assert.equal(h.byClass('world-layer')[0].style.display, 'none')
  assert.equal(h.focused(), h.byClass('world-back')[0])
  const calls = [...h.cameraCalls]
  const navigations = [...h.navigations]
  const event = await h.keydown()
  assert.equal(event.prevented, false)
  assert.equal(event.stopped, false)
  assert.equal(h.route.query.lieu, 'depot-q')
  assert.equal(h.selected(), 'quilivreou')
  assert.deepEqual(h.cameraCalls, calls)
  assert.deepEqual(h.navigations, navigations)
})

test('the attribution timeout is suspended by a place and resumes with six fresh seconds', async t => {
  const h = await mountPage(t)
  assert.equal(h.byClass('map-attribution').length, 1)
  await h.clock.frame()
  await h.clock.frame()
  await h.clock.advance(3000)
  await h.mapSelect('omasla')
  assert.equal(h.byClass('map-attribution').length, 0)
  await h.clock.advance(10000)
  await h.click(h.closeButton())
  assert.equal(h.byClass('map-attribution').length, 1, 'The hidden credit was not dismissed by its old timer')
  await h.clock.frame()
  await h.clock.frame()
  await h.clock.advance(5999)
  assert.equal(h.byClass('map-attribution').length, 1)
  await h.clock.advance(1)
  assert.equal(h.byClass('map-attribution').length, 0)
})

test('discovery and external places stay usable without WebGL and do not enter missions', async t => {
  const h = await mountPage(t)
  const { openList, select, dock, cameraCalls, navigations } = h
  const actions = () => h.walk(dock()).filter(node => (node.tag === 'button' || node.tag === 'a') && node !== h.closeButton())

  await openList()
  assert.equal(h.byClass('place-row').length, 7)
  for (const name of ['La voiture à l’écart', 'MAGGMA Studio', 'La cour du mas']) {
    const row = h.byClass('place-row').find(node => h.text(node).includes(name))
    assert.doesNotMatch(h.text(row), /fermé|porte/i)
    assert.equal(h.walk(row).filter(node => node.props['data-icon'] === 'lock').length, 0)
  }
  await h.click(h.byClass('place-row').find(node => h.text(node).includes('La voiture à l’écart')))
  assert.match(h.text(dock()), /Une voiture garée à l’écart/)
  assert.equal(actions().length, 0)
  h.assertDetail('kokolo')
  assert.doesNotMatch(h.text(h.byClass('game-live')[0]), /fermé|entrer|mission|quota/i)
  assert.deepEqual(cameraCalls, [['focusProject', 'kokolo']])

  await select('MAGGMA Studio')
  h.assertDetail('maggma-studio')
  const link = h.walk(dock()).find(node => node.tag === 'a')
  assert.equal(h.text(link), 'Visiter le site du studio')
  assert.equal(link.props.href, 'https://maggma.studio/')
  assert.equal(link.props.target, '_blank')
  assert.equal(link.props.rel, 'noopener noreferrer')
  assert.equal(link.props['aria-label'], 'Visiter le site du studio (nouvel onglet)')
  assert.doesNotMatch(h.text(dock()), /fermé|simulée|quota/)
  assert.equal(navigations.length, 0)
  assert.match(h.text(h.byClass('game-live')[0]), /nouvel onglet/)

  await select('La cour du mas')
  assert.match(h.text(dock()), /tambours rangés, des costumes et des fanions/)
  assert.equal(actions().length, 0)
  assert.doesNotMatch(h.text(h.byClass('game-live')[0]), /fermé|entrer|mission|quota/i)

  h.callbacks.onError(Error('WebGL unavailable'))
  await Vue.nextTick()
  const callsBeforeFailure = cameraCalls.length
  await select('La voiture à l’écart')
  await select('La cour du mas')
  await select('MAGGMA Studio')
  assert.equal(cameraCalls.length, callsBeforeFailure)
  assert.equal(h.walk(dock()).find(node => node.tag === 'a').props.href, 'https://maggma.studio/')

  await select('La banque')
  assert.match(h.text(dock()), new RegExp(`Curiosité · 0 / ${bankModule.BANK_GOALS.curiosity} visites simulées`))
  assert.match(h.text(dock()), /Simuler une visite/)
  assert.match(h.text(h.byClass('game-live')[0]), /encore fermé/)
  await select('Le hangar')
  assert.match(h.text(dock()), /Entrer au dépôt/)
  await select('L’atelier fermé')
  assert.match(h.text(dock()), /Lieu fermé/)
  assert.equal(navigations.length, 0)
})

test('bank curiosity still unlocks the existing entrance and Escape leaves its interior alone', async t => {
  const h = await mountPage(t)
  await h.select('La banque')
  h.assertDetail('memebank')
  assert.match(h.text(h.dock()), new RegExp(`Curiosité · 0 / ${bankModule.BANK_GOALS.curiosity} visites simulées`))
  const cameraCalls = [...h.cameraCalls]
  for (let count = 1; count <= bankModule.BANK_GOALS.curiosity; count++) {
    await h.click(h.byClass('enter-depot')[0])
    assert.equal(h.navigations.length, 0, 'Simulating curiosity never enters the bank directly')
    assert.equal(h.byClass('place-detail').length, 1)
    if (count < bankModule.BANK_GOALS.curiosity) assert.match(h.text(h.dock()), new RegExp(`Curiosité · ${count} /`))
  }
  assert.deepEqual(h.cameraCalls, cameraCalls)
  assert.equal(h.byClass('bank-curiosity').length, 0)
  const enter = h.byClass('enter-depot')[0]
  assert.match(h.text(enter), /Entrer dans la banque/)
  assert.equal(h.focused(), enter)
  assert.match(h.text(h.byClass('game-live')[0]), /Palier simulé atteint/)
  await h.click(enter)
  assert.deepEqual(h.navigations, [{ path: '/macomisyon', query: { lieu: 'bank' } }])
  assert.equal(h.all(node => node.props['data-interior'] === 'bank').length, 1)
  const event = await h.keydown()
  assert.equal(event.prevented, false)
  assert.equal(event.stopped, false)
  assert.equal(h.route.query.lieu, 'bank')
  assert.equal(h.selected(), 'memebank')
})

test('the car marker only appears while selected, including selection before world startup', async t => {
  const h = harness()
  let callbacks
  let worldSelected
  const map = h.compile('../../components/macomisyon/JarryMap.client.vue', {
    './GameIcon.vue': { default: icon },
    '../../lib/macomisyon/places.js': placesModule,
    '../../lib/macomisyon/jarry-world.js': {
      createJarryWorld(_surface, next) {
        callbacks = next
        return { setPaused() {}, setActive() {}, setRepaired() {}, setBankState() {}, setSelected(id) { worldSelected = id }, dispose() {} }
      },
    },
  })
  const selected = Vue.ref('kokolo')
  const selections = []
  const app = h.renderer.createApp({ setup: () => () => Vue.h(map, { selected: selected.value, onSelect: id => selections.push(id) }) })
  app.mount(h.root)
  t.after(() => app.unmount())
  await new Promise(resolve => setImmediate(resolve))
  await Vue.nextTick()
  assert.equal(worldSelected, 'kokolo')
  callbacks.onLabels(placesModule.places.map((place, index) => ({ id: place.id, x: 80 * index, y: 80, visible: true })))
  await Vue.nextTick()
  const marker = id => h.all(node => node.props['data-project'] === id)[0]
  assert.ok(marker('kokolo'))
  await h.click(marker('kokolo'))
  assert.deepEqual(selections, ['kokolo'])
  selected.value = 'maggma-studio'
  await Vue.nextTick()
  assert.equal(marker('kokolo'), undefined)
  assert.ok(marker('maggma-studio'))
  assert.ok(marker('omasla'))
  assert.equal(h.byClass('jarry-marker').length, 6)
  callbacks.onSelect('kokolo')
  assert.deepEqual(selections, ['kokolo', 'kokolo'])
})
