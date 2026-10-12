import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

// Real touch events exercise OrbitControls and the map's own selection handler.
// No target coordinates, geographic dimensions or numerical zoom are prescribed.
const baseURL = process.env.DEMO_URL || 'http://127.0.0.1:3096/macomisyon'
const output = '.impeccable/review/jarry-navigation'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const results = [], errors = []
let page

const debug = () => page.locator('.jarry-map').evaluate(element => {
  let owner = element.__vueParentComponent
  while (owner && !owner.exposed?.getDebug) owner = owner.parent
  return owner?.exposed?.getDebug()
})
const settled = async () => {
  await page.waitForFunction(() => {
    let owner = document.querySelector('.jarry-map')?.__vueParentComponent
    while (owner && !owner.exposed?.getDebug) owner = owner.parent
    const value = owner?.exposed?.getDebug()
    return value?.active && value.renderCount > 0 && !value.frameScheduled
  }, undefined, { timeout: 15000 })
  return debug()
}
const view = async () => (await settled()).view
const selected = () => page.locator('.jarry-marker.is-selected').evaluateAll(elements => elements.map(element => element.dataset.project))
const reset = async () => {
  await page.getByRole('button', { name: 'Recentrer la carte', exact: true }).click()
  return view()
}
const capture = name => page.screenshot({ path: `${output}/${name}.png`, timeout: 15000 })
const sameView = (actual, expected, message) => {
  assert.ok(Math.abs(actual.zoom - expected.zoom) < 1e-6, `${message}: zoom ${actual.zoom} / ${expected.zoom}`)
  actual.target.forEach((value, index) => assert.ok(Math.abs(value - expected.target[index]) < 1e-6, `${message}: cible[${index}] ${value} / ${expected.target[index]}`))
}
const test = async (name, action) => {
  try {
    const evidence = await action()
    results.push({ name, passed: true, evidence })
    console.log(`PASS ${name}`)
  } catch (error) {
    results.push({ name, passed: false, error: error.message })
    console.error(`FAIL ${name}: ${error.message}`)
    await capture(`failure-${results.length}`).catch(() => {})
  }
}

async function noMarkerOverlap() {
  const markers = await page.locator('.jarry-marker:not(.is-offscreen)').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { id: element.dataset.project, x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
  }))
  assert.ok(markers.length > 0, 'La carte doit présenter au moins un repère visible')
  for (const marker of markers) assert.ok(marker.width >= 44 && marker.height >= 44, `Cible tactile trop petite: ${marker.id}`)
  for (let first = 0; first < markers.length; first++) {
    for (let second = first + 1; second < markers.length; second++) {
      const a = markers[first], b = markers[second]
      const overlapX = Math.min(a.right, b.right) - Math.max(a.x, b.x)
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y)
      assert.ok(overlapX <= 0 || overlapY <= 0, `Repères superposés: ${a.id} / ${b.id} (${overlapX.toFixed(1)} × ${overlapY.toFixed(1)} px)`)
    }
  }
  return markers
}

async function canvasPoint({ horizontalRoom = 0, preferredX = .5, preferredY = .62 } = {}) {
  const point = await page.locator('[data-jarry-canvas]').evaluate((canvas, options) => {
    const rect = canvas.getBoundingClientRect()
    const ys = [options.preferredY, .24, .4, .56, .72, .86]
    const xs = [options.preferredX, .24, .5, .76]
    for (const fractionY of ys) for (const fractionX of xs) {
      const x = rect.x + rect.width * fractionX, y = rect.y + rect.height * fractionY
      if (x - options.horizontalRoom <= rect.x + 8 || x + options.horizontalRoom >= rect.right - 8) continue
      if ([-options.horizontalRoom, 0, options.horizontalRoom].every(offset => document.elementFromPoint(x + offset, y) === canvas)) return { x, y, width: rect.width, height: rect.height, left: rect.x, top: rect.y }
    }
    return null
  }, { horizontalRoom, preferredX, preferredY })
  assert.ok(point, 'Une zone de la carte doit recevoir directement le geste tactile')
  return point
}

async function markerPoint(id) {
  const marker = page.locator(`.jarry-marker[data-project="${id}"]:not(.is-offscreen)`)
  await marker.waitFor({ state: 'visible', timeout: 10000 })
  return marker.evaluate(element => {
    const markerRect = element.getBoundingClientRect()
    const canvasRect = document.querySelector('[data-jarry-canvas]').getBoundingClientRect()
    const x = markerRect.x + markerRect.width / 2, y = markerRect.y + markerRect.height / 2
    if (document.elementFromPoint(x, y)?.closest('.jarry-marker') !== element) throw new Error('Le centre du repère doit recevoir directement le geste tactile')
    return { x, y, width: canvasRect.width, height: canvasRect.height, left: canvasRect.x, top: canvasRect.y }
  })
}

async function drag(session, { dx, dy, preferredX, preferredY, start: suppliedStart, steps = 12 }) {
  const start = suppliedStart || await canvasPoint({ preferredX, preferredY })
  const destination = {
    x: Math.max(start.left + 12, Math.min(start.left + start.width - 12, start.x + dx)),
    y: Math.max(start.top + 12, Math.min(start.top + start.height - 12, start.y + dy)),
  }
  const point = (x, y) => [{ id: 1, x, y, radiusX: 2, radiusY: 2, force: 1 }]
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(start.x, start.y) })
  for (let step = 1; step <= steps; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(start.x + (destination.x - start.x) * step / steps, start.y + (destination.y - start.y) * step / steps) })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  return view()
}

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /hydration|mismatch/i.test(message.text())) errors.push(message.text()) })
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-jarry-canvas]').waitFor()
  await page.addStyleTag({ content: 'nuxt-devtools-frame, #nuxt-devtools-container { display: none !important; }' })
  const initial = await view()
  const touch = await context.newCDPSession(page)
  await capture('mobile-overview')

  await test('Les repères visibles ne se chevauchent pas sur téléphone', async () => {
    await reset()
    return { markers: await noMarkerOverlap() }
  })
  await test('Dézoomer élargit la vue et conserve des repères tactiles distincts', async () => {
    const before = await reset()
    await page.getByRole('button', { name: 'Dézoomer', exact: true }).click()
    const after = await view()
    assert.ok(after.zoom < before.zoom, 'Le bouton − doit réellement dézoomer depuis la vue initiale')
    await capture('mobile-zoomed-out')
    return { before, after, markers: await noMarkerOverlap() }
  })
  await test('Glisser déplace le terrain en X/Z sans changer sa hauteur ni sélectionner', async () => {
    const before = await reset()
    const after = await drag(touch, { dx: 72, dy: 85 })
    assert.ok(Math.hypot(after.target[0] - before.target[0], after.target[2] - before.target[2]) > .1, 'Le geste doit déplacer la cible sur le terrain')
    assert.ok(Math.abs(after.target[1] - before.target[1]) < 1e-6, `Hauteur de cible modifiée par le glisser: ${before.target[1]} → ${after.target[1]}`)
    assert.deepEqual(await selected(), [], 'Un glisser ne sélectionne aucun lieu')
    await capture('mobile-panned')
    return { before, after }
  })
  await test('Un glisser commencé sur un repère déplace la carte sans activer ce lieu', async () => {
    const before = await reset()
    const start = await markerPoint('quilivreou')
    const after = await drag(touch, { start, dx: 75, dy: 70 })
    assert.ok(Math.hypot(after.target[0] - before.target[0], after.target[2] - before.target[2]) > .1, 'Le repère ne doit pas bloquer le déplacement tactile de la carte')
    assert.ok(Math.abs(after.target[1] - before.target[1]) < 1e-6, `Le glisser sur un repère garde la hauteur: ${before.target[1]} → ${after.target[1]}`)
    assert.deepEqual(await selected(), [], 'Relâcher après un glisser sur le repère ne sélectionne aucun lieu')
    assert.equal(await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).count(), 0, 'Le dock ne doit pas ouvrir le lieu lors du glisser')
    await capture('mobile-marker-drag')
    return { before, after }
  })
  await test('Un tap natif sur un repère sélectionne le lieu et en rapproche la vue', async () => {
    const before = await reset()
    const point = await markerPoint('quilivreou')
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: point.x, y: point.y, radiusX: 2, radiusY: 2, force: 1 }] })
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.locator('.jarry-marker[data-project="quilivreou"].is-selected').waitFor({ timeout: 10000 })
    const after = await view()
    assert.deepEqual(await selected(), ['quilivreou'])
    assert.match(await page.locator('.dock-copy').innerText(), /Le hangar/)
    assert.equal(await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).isVisible(), true)
    assert.ok(after.zoom > before.zoom, 'Sélectionner depuis la vue générale doit agrandir le lieu')
    await markerPoint('quilivreou')
    await capture('mobile-marker-tap')
    return { before, after }
  })
  await test('Un pincement tactile natif zoome sans sélectionner de lieu', async () => {
    const before = await reset()
    const center = await canvasPoint({ horizontalRoom: 86 })
    const points = distance => [
      { id: 1, x: center.x - distance, y: center.y, radiusX: 2, radiusY: 2, force: 1 },
      { id: 2, x: center.x + distance, y: center.y, radiusX: 2, radiusY: 2, force: 1 },
    ]
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(24) })
    for (let step = 1; step <= 12; step++) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(24 + step * 5) })
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    const after = await view()
    assert.ok(after.zoom > before.zoom + .05, `Le pincement doit agrandir la carte: ${before.zoom} → ${after.zoom}`)
    assert.deepEqual(await selected(), [], 'Un pincement ne sélectionne aucun lieu')
    return { before, after }
  })
  await test('Les boutons +/− et Recentrer conservent une vue de référence fiable', async () => {
    await reset()
    await page.getByRole('button', { name: 'Zoomer', exact: true }).click()
    const enlarged = await view()
    assert.ok(enlarged.zoom > initial.zoom, 'Le bouton + doit réellement zoomer')
    await page.getByRole('button', { name: 'Dézoomer', exact: true }).click()
    sameView(await view(), initial, 'Les opérations + puis − se compensent')
    await drag(touch, { dx: -70, dy: -65 })
    sameView(await reset(), initial, 'Recentrer retrouve la vue initiale')
    assert.deepEqual(await selected(), [])
    return { initial, enlarged }
  })
  await test('Le retour du dépôt restaure le cadrage déplacé par le visiteur', async () => {
    await reset()
    await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
    await page.locator('.place-row').filter({ hasText: 'Le hangar' }).click()
    await settled()
    await page.getByRole('button', { name: 'Zoomer', exact: true }).click()
    await drag(touch, { dx: 38, dy: 34 })
    const before = await view()
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
    await page.locator('.depot-q[data-world-error="false"]').waitFor()
    assert.equal((await debug()).active, false, 'La carte masquée suspend son rendu')
    await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
    const after = await view()
    sameView(after, before, 'Le retour doit restituer le cadrage précédant l’entrée')
    return { before, after }
  })
  await test('Les déplacements extrêmes sont bornés dans les quatre directions', async () => {
    const boundaries = []
    for (const direction of [{ dx: 320, dy: 0 }, { dx: -320, dy: 0 }, { dx: 0, dy: 390 }, { dx: 0, dy: -390 }]) {
      await reset()
      const gesture = { ...direction, preferredX: direction.dx > 0 ? .2 : direction.dx < 0 ? .8 : .5, preferredY: direction.dy > 0 ? .2 : direction.dy < 0 ? .82 : .6, steps: 6 }
      let previous = await view(), stopped = false
      for (let attempt = 0; attempt < 10; attempt++) {
        const next = await drag(touch, gesture)
        assert.ok(next.target.every(Number.isFinite), 'La cible reste finie')
        if (attempt > 0 && next.target.every((value, index) => Math.abs(value - previous.target[index]) < 1e-6)) { stopped = true; previous = next; break }
        previous = next
      }
      assert.ok(stopped, `Le déplacement doit atteindre une limite: ${JSON.stringify(direction)}`)
      assert.deepEqual(await selected(), [], 'Un déplacement jusqu’au bord ne sélectionne aucun lieu')
      boundaries.push({ direction, view: previous })
    }
    await capture('mobile-navigation-boundary')
    await reset()
    return { boundaries }
  })
  await test('Mouvement réduit arrête les frames ambiantes tout en gardant les interactions', async () => {
    await reset()
    const before = await settled()
    assert.equal(before.reducedMotion, true)
    await page.waitForTimeout(300)
    assert.equal((await debug()).renderCount, before.renderCount, 'Aucune boucle de rendu ambiante en mouvement réduit')
    await page.getByRole('button', { name: 'Zoomer', exact: true }).click()
    const after = await settled()
    assert.ok(after.view.zoom > before.view.zoom)
    assert.ok(after.renderCount > before.renderCount, 'Une interaction doit produire un nouveau rendu')
    await page.waitForTimeout(300)
    assert.equal((await debug()).renderCount, after.renderCount, 'La boucle reste arrêtée après interaction')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    return { before: before.renderCount, after: after.renderCount }
  })
  await test('Aucune erreur JavaScript ni hydratation pendant la navigation', async () => { assert.deepEqual(errors, []) })
  await context.close()
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), results, errors }, null, 2))
  await browser.close()
}
const failures = results.filter(result => !result.passed)
console.log(`${results.length - failures.length}/${results.length} contrôles réussis. Rapport: ${output}/report.json`)
if (failures.length) process.exitCode = 1
