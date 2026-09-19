import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseURL = process.env.DEMO_URL || 'http://127.0.0.1:3000/macomisyon'
const screenshotDir = '.impeccable/review'
await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const results = []
const errors = []
const test = async (name, action) => { await action(); results.push(name); console.log(`PASS ${name}`) }
const observeErrors = page => {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /hydration|mismatch/i.test(message.text())) errors.push(message.text()) })
}
const debug = (page, selector) => page.locator(selector).evaluate(element => {
  let owner = element.__vueParentComponent
  while (owner && !owner.exposed?.getDebug) owner = owner.parent
  return owner?.exposed?.getDebug()
})
const state = page => page.locator('.depot-q').evaluate(element => {
  let owner = element.__vueParentComponent
  while (owner && !owner.exposed?.getState) owner = owner.parent
  return owner?.exposed?.getState()
})
const settle = async (page, selector, predicate) => {
  const until = Date.now() + 15000
  while (Date.now() < until) {
    if (predicate(await debug(page, selector))) return
    await page.waitForTimeout(100)
  }
  throw new Error(`Scene did not settle: ${selector}`)
}
const capture = async (page, name) => {
  await page.waitForTimeout(300)
  await page.addStyleTag({ content: 'nuxt-devtools-frame, #nuxt-devtools-container { display: none !important; }' })
  await page.screenshot({ path: `${screenshotDir}/${name}.png`, timeout: 10000 })
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  observeErrors(page)
  await test('Jarry loads with no hydration error and responsive canvas', async () => {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
    await page.locator('[data-jarry-canvas]').waitFor()
    await settle(page, '.jarry-map', value => value?.renderCount > 2)
    assert.equal(await page.getByRole('button', { name: 'Zoomer', exact: true }).isEnabled(), true)
    assert.equal((await debug(page, '.jarry-map')).contextIsLost, false)
    await capture(page, 'desktop')
  })
  await test('Pause, keyboard pan and zoom operate independently', async () => {
    await page.getByRole('button', { name: 'Mettre les animations en pause', exact: true }).click()
    await settle(page, '.jarry-map', value => value?.paused && !value.frameScheduled)
    const before = await debug(page, '.jarry-map')
    await page.waitForTimeout(250)
    assert.equal((await debug(page, '.jarry-map')).renderCount, before.renderCount)
    await page.locator('.jarry-map__surface').focus()
    await page.keyboard.press('ArrowRight')
    assert.notDeepEqual((await debug(page, '.jarry-map')).view.target, before.view.target)
    await page.getByRole('button', { name: 'Zoomer', exact: true }).click()
    assert.ok((await debug(page, '.jarry-map')).view.zoom > before.view.zoom)
    await page.getByRole('button', { name: 'Recentrer la carte' }).click()
    await page.getByRole('button', { name: 'Reprendre les animations', exact: true }).click()
  })
  await test('Locked project gives a clue without opening an interior', async () => {
    await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
    await page.locator('.place-row').filter({ hasText: 'Shootareas' }).click()
    await settle(page, '.jarry-map', value => !value?.view || Math.abs(value.view.zoom - 2) < 0.01)
    assert.match(await page.locator('.dock-copy').innerText(), /studio/)
    assert.equal(await page.locator('.depot-q').count(), 0)
    await page.getByRole('button', { name: 'Recentrer la carte' }).click()
    await settle(page, '.jarry-map', value => Math.abs(value.view.zoom - 1) < 0.01)
  })
  const originalView = (await debug(page, '.jarry-map')).view
  await test('Depot opens; hidden Jarry pauses its renderer', async () => {
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
    await page.locator('.depot-q[data-world-error="false"][data-completed-count="0"]').waitFor()
    await settle(page, '.depot-q', value => value?.renderCount > 0)
    assert.equal((await debug(page, '.jarry-map')).active, false)
    assert.ok(page.url().includes('lieu=depot-q'))
    await capture(page, 'depot-desktop')
  })
  await test('Locked contributions validate with prerequisite; registrations alone cannot repair', async () => {
    await page.getByRole('button', { name: 'Choisir un scénario de démonstration du dépôt' }).click()
    await page.getByRole('button', { name: /Une longueur d’avance/ }).click()
    await page.getByRole('button', { name: 'Les Komisyon', exact: true }).click()
    await page.locator('.depot-inventory button[data-state="blocked"]').click()
    await page.locator('#depot-panel-title').filter({ hasText: 'Étape verrouillée' }).waitFor()
    assert.match(await page.locator('.depot-waiting').innerText(), /compteur est prêt/)
    await capture(page, 'locked-hint')
    await page.getByRole('button', { name: 'Toutes les Komisyon', exact: true }).click()
    await page.locator('.depot-inventory button').filter({ hasText: 'Boutiques' }).click()
    const credit = page.getByRole('button', { name: 'Simuler un nouveau site', exact: true })
    await credit.click({ clickCount: 1 }); await credit.click(); await credit.click()
    const current = await state(page)
    assert.equal(current.counts.boutiques, 5)
    assert.equal(current.counts.retours, 5)
    assert.equal(current.repaired, false)
    assert.ok(current.completed.includes('retours'))
    await page.getByRole('button', { name: 'Toutes les Komisyon', exact: true }).click()
    await page.locator('.depot-inventory button').filter({ hasText: 'Inscriptions' }).click()
    for (let index = 0; index < 6; index++) await page.getByRole('button', { name: 'Simuler une inscription', exact: true }).click()
    assert.equal((await state(page)).repaired, true)
    await page.locator('.depot-panel').waitFor({ state: 'detached' })
    await settle(page, '.depot-q', value => value?.repaired && value.transitionProgress === null)
    assert.ok((await debug(page, '.depot-q')).zoom < 1.3, 'Completion reframes the full depot, including the departing forklift')
    await capture(page, 'depot-final')
  })
  await test('Final loop persists on reload, with an arrival animation', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.depot-q[data-repaired="true"]').waitFor()
    const arrived = await debug(page, '.depot-q')
    assert.ok(arrived.arrivalAnimation || arrived.tourTime > 0)
    assert.equal((await state(page)).counts.inscrits, 10)
    await page.getByRole('button', { name: 'Mettre les animations en pause', exact: true }).click()
    await settle(page, '.depot-q', value => value?.motionPaused)
    const before = (await debug(page, '.depot-q')).ambientTime
    await page.waitForTimeout(250)
    assert.equal((await debug(page, '.depot-q')).ambientTime, before)
    await page.getByRole('button', { name: 'Reprendre les animations', exact: true }).click()
  })
  await test('Returning to Jarry preserves camera; exterior reflects repair', async () => {
    await page.getByRole('button', { name: 'Retour à Jarry', exact: true }).click()
    await page.locator('.project-dock').waitFor({ state: 'visible' })
    await settle(page, '.jarry-map', value => value.active && value.repaired)
    assert.equal(await page.locator('.depot-q').count(), 0)
    assert.match(await page.locator('[data-project="quilivreou"]').innerText(), /opérationnel/i)
    // A page reload naturally starts at the map's default view. Verify preservation on a same-page round trip.
    await page.getByRole('button', { name: 'Zoomer', exact: true }).click()
    const before = (await debug(page, '.jarry-map')).view
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
    await page.locator('.depot-q[data-repaired="true"]').waitFor()
    await page.getByRole('button', { name: 'Retour à Jarry', exact: true }).click()
    await settle(page, '.jarry-map', value => Math.abs(value.view.zoom - before.zoom) < 0.001 && before.target.every((v, i) => Math.abs(v - value.view.target[i]) < 0.001))
    const after = (await debug(page, '.jarry-map')).view
    before.target.forEach((v, i) => assert.ok(Math.abs(v - after.target[i]) < 0.001))
    assert.ok(originalView.zoom > 0)
  })
  await test('WebGL interruption shows fallback and restoration resumes Jarry', async () => {
    await page.locator('[data-jarry-canvas]').evaluate(canvas => {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const extension = gl.getExtension('WEBGL_lose_context')
      extension.loseContext()
      setTimeout(() => extension.restoreContext(), 1000)
    })
    await page.locator('.world-fallback').waitFor()
    assert.equal((await debug(page, '.jarry-map')).active, false)
    await page.locator('.world-fallback').waitFor({ state: 'detached' })
    await settle(page, '.jarry-map', value => value.active && !value.contextIsLost)
  })
  await context.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const phone = await mobile.newPage(); observeErrors(phone)
  await test('Phone layout, touch selection and reduced-motion still work', async () => {
    await phone.goto(baseURL, { waitUntil: 'domcontentloaded' })
    await phone.locator('[data-jarry-canvas]').waitFor()
    await settle(phone, '.jarry-map', value => value?.renderCount > 0)
    assert.equal((await debug(phone, '.jarry-map')).reducedMotion, true)
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await capture(phone, 'mobile')
    await phone.locator('[data-project="quilivreou"]').tap()
    assert.match(await phone.locator('.dock-copy').innerText(), /QuiLivreOù/)
    await phone.getByRole('button', { name: 'Entrer au dépôt', exact: true }).tap()
    await phone.locator('.depot-q[data-world-error="false"]').waitFor()
    assert.equal((await debug(phone, '.depot-q')).reducedMotion, true)
    await capture(phone, 'depot-mobile')
    await phone.getByRole('button', { name: 'Les Komisyon', exact: true }).tap()
    await capture(phone, 'inventory-mobile')
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  })
  await mobile.close()

  const fallback = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return ['webgl', 'webgl2', 'experimental-webgl'].includes(kind) ? null : original.call(this, kind, ...args)
    }
  })
  const withoutGL = await fallback.newPage(); observeErrors(withoutGL)
  await test('No WebGL still exposes project and all mission panels', async () => {
    await withoutGL.goto(baseURL, { waitUntil: 'domcontentloaded' })
    await withoutGL.locator('.world-fallback').waitFor()
    await withoutGL.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
    await withoutGL.locator('.depot-q[data-world-error="true"]').waitFor()
    await withoutGL.getByRole('button', { name: 'Découvrir QuiLivreOù', exact: true }).click()
    assert.match(await withoutGL.locator('.depot-panel').innerText(), /Guadeloupe et en Martinique/)
    await withoutGL.getByRole('button', { name: 'Voir les Komisyon du dépôt', exact: true }).click()
    assert.equal(await withoutGL.locator('.depot-inventory button').count(), 4)
  })
  await fallback.close()
  assert.deepEqual(errors, [], 'No page or hydration errors')
  await writeFile(`${screenshotDir}/verification.json`, JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), passed: results, errors }, null, 2))
  console.log(`${results.length} browser checks passed; screenshots in ${screenshotDir}.`)
} finally { await browser.close() }
