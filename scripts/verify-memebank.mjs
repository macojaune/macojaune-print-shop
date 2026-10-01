import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseURL = process.env.DEMO_URL || 'http://127.0.0.1:3000/macomisyon'
const output = '.impeccable/review/bank'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const results = [], errors = []
const test = async (name, action) => { await action(); results.push(name); console.log('PASS ' + name) }
const watchErrors = page => {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /hydration|mismatch/i.test(message.text())) errors.push(message.text()) })
}
const inspect = (page, selector, method = 'getDebug') => page.locator(selector).evaluate((element, name) => {
  let owner = element.__vueParentComponent
  while (owner && !owner.exposed?.[name]) owner = owner.parent
  return owner?.exposed?.[name]()
}, method)
const state = page => inspect(page, '.meme-bank', 'getState')
const debug = page => inspect(page, '.meme-bank')
const settled = (page, selector, predicate) => page.waitForFunction(({ selector, source }) => {
  let owner = document.querySelector(selector)?.__vueParentComponent
  while (owner && !owner.exposed?.getDebug) owner = owner.parent
  const value = owner?.exposed?.getDebug()
  return value && new Function('v', 'return (' + source + ')(v)')(value)
}, { selector, source: predicate.toString() }, { timeout: 20000 })
const finish = page => settled(page, '.meme-bank', value => value.renderCount > 0 && value.transitionProgress === 1 && !value.cameraFlying)
const capture = async (page, name) => {
  await page.waitForFunction(() => !document.querySelector('.depot-panel-enter-active, .depot-panel-leave-active'))
  await page.addStyleTag({ content: 'nuxt-devtools-frame, #nuxt-devtools-container { display: none !important; }' })
  await page.screenshot({ path: output + '/' + name + '.png', timeout: 15000 })
}
const close = async page => {
  const button = page.getByRole('button', { name: 'Fermer le panneau', exact: true })
  if (await button.count()) { await button.click(); await page.locator('.depot-panel').waitFor({ state: 'detached' }) }
}
const choose = async (page, id) => {
  await page.getByRole('button', { name: 'Les Komisyon', exact: true }).click()
  await page.locator('.bank-inventory button[data-mission="' + id + '"]').click()
  await settled(page, '.meme-bank', value => value.panel === 'mission')
}
const chooseScenario = async (page, id) => {
  await page.getByRole('button', { name: 'Choisir un scénario de démonstration de la banque', exact: true }).click()
  await page.locator('.bank-scenarios button').filter({ has: page.locator('strong', { hasText: id }) }).click()
  await finish(page)
}
const enter = async page => {
  await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).click()
  await page.locator('.meme-bank[data-world-error="false"]').waitFor()
  await finish(page)
}
const cameraZoom = value => value.view?.zoom ?? value.zoom
async function visibleToolbar(page) {
  for (const button of await page.locator('.depot-scene-tools button').all()) {
    assert.equal(await button.evaluate(el => { const box = el.getBoundingClientRect(); return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('button') === el }), true, 'Zoom et recentrage accessibles avec la fiche ouverte')
  }
}
async function visibleInspection(page) {
  const compact = await page.evaluate(() => innerWidth < 700)
  const view = await debug(page)
  const canvas = await page.locator('.bank-viewport').boundingBox()
  const sheet = await page.locator('.depot-panel').boundingBox()
  assert.ok(view.inspection && canvas && sheet)
  for (const point of view.inspection.corners) {
    assert.ok(point.x >= 10 && point.x <= canvas.width - 10, 'Poste cadré horizontalement')
    assert.ok(point.y >= 64, 'Le poste reste sous les commandes hautes')
    if (compact) assert.ok(point.y + canvas.y <= sheet.y - 6, 'Pile ou VHS visible au-dessus de la fiche')
    else assert.ok(point.x + canvas.x <= sheet.x - 6, 'Poste visible à gauche du panneau latéral')
  }
  for (const button of await page.locator('.depot-scene-tools button').all()) {
    assert.equal(await button.evaluate(el => { const box = el.getBoundingClientRect(); return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('button') === el }), true, 'Zoom et recentrage accessibles avec la fiche ouverte')
  }
}
const saved = { version: 1, counts: { curiosity: 10, newsletter: 32, applications: 20, qualified: 5, admitted: 3 }, completed: ['curiosity','newsletter','applications'], betaOpen: true }

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  watchErrors(page)
  await test('Exterior stays anonymous and gates deep links without counting real visits', async () => {
    await page.goto(baseURL + '?lieu=bank', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Simuler une visite', exact: true }).waitFor()
    await settled(page, '.jarry-map', value => value.renderCount > 0)
    assert.doesNotMatch(await page.locator('.maco-game').innerText(), /Memebank|VHS|QuiLivreOù/)
    assert.doesNotMatch(page.url(), /lieu=bank/)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
    await page.locator('.place-row').filter({ hasText: 'La banque' }).click()
    await settled(page, '.jarry-map', value => Math.abs(value.view.zoom - 3.6) < .01)
    assert.ok((await page.locator('.bank-curiosity').innerText()).includes('0 / 10'))
    await capture(page, 'exterior-locked')
  })
  await test('Ten simulated visits reveal three numbered physical steps and the shared dock', async () => {
    const visit = page.getByRole('button', { name: 'Simuler une visite', exact: true })
    for (let i = 0; i < 9; i++) await visit.click()
    assert.equal(await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).count(), 0)
    await visit.click()
    await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).evaluate(el => el === document.activeElement), true)
    await page.keyboard.press('Enter')
    await finish(page)
    assert.equal((await inspect(page, '.jarry-map')).active, false)
    assert.equal(await page.locator('.bank-labels .world-label').count(), 3)
    assert.match(await page.locator('.depot-status').innerText(), /0.*3/s)
    await capture(page, 'interior-start')
    await page.locator('.bank-labels [data-step="1"]').click()
    await page.getByRole('heading', { name: 'Submerger le guichet', exact: true }).waitFor()
    assert.equal((await debug(page)).selected, 'newsletter')
    const colors = await page.locator('.depot-panel p').first().evaluate(el => ({ text: getComputedStyle(el).color, background: getComputedStyle(el.closest('.depot-panel')).backgroundColor }))
    assert.deepEqual(colors, { text: 'rgb(240, 233, 206)', background: 'rgb(26, 48, 42)' })
    await page.keyboard.press('Escape')
    await page.locator('.depot-panel').waitFor({ state: 'detached' })
    assert.equal(await page.locator('.depot-panel').count(), 0)
  })
  await test('Stage 2 progresses independently and five forms do not admit anyone', async () => {
    await choose(page, 'applications')
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Simuler un formulaire reçu', exact: true }).click()
    const current = await state(page)
    assert.deepEqual(current.completed, ['curiosity', 'applications'])
    assert.equal(current.counts.newsletter, 0)
    assert.equal(current.counts.qualified, 0)
    assert.equal(current.counts.admitted, 0)
    assert.equal(current.betaOpen, false)
    await finish(page)
    await visibleToolbar(page)
    await capture(page, 'stage-two')
  })
  await test('Stage 1 continues past its quota and actual paper bulk grows', async () => {
    await choose(page, 'newsletter')
    for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Simuler une inscription newsletter', exact: true }).click()
    await finish(page)
    const atGoal = await debug(page)
    await page.getByRole('button', { name: 'Simuler cinq contributions pour l’étape 1', exact: true }).click()
    await finish(page)
    const beyond = await debug(page)
    assert.equal((await state(page)).counts.newsletter, 13)
    assert.ok(beyond.mailOverflow > atGoal.mailOverflow)
    assert.ok(beyond.paperHeights.mail > atGoal.paperHeights.mail)
    assert.match(await page.locator('.bank-over-goal').innerText(), /5/)
    assert.equal((await state(page)).betaOpen, false)
    await capture(page, 'stage-one-overflow')
    await close(page)
    await page.getByRole('button', { name: 'Recentrer la banque', exact: true }).click()
    await finish(page)
    await capture(page, 'objectives-complete')
  })
  await test('Stage 3 keeps qualification, invitations and beta opening explicit', async () => {
    await choose(page, 'beta')
    assert.equal(await page.getByRole('button', { name: 'Simuler l’ouverture bêta', exact: true }).isDisabled(), true)
    await page.getByRole('button', { name: 'Simuler une candidature qualifiée', exact: true }).click()
    assert.equal((await state(page)).counts.admitted, 0)
    await page.getByRole('button', { name: 'Simuler une invitation bêta', exact: true }).click()
    assert.equal((await state(page)).betaOpen, false)
    await page.getByRole('button', { name: 'Simuler l’ouverture bêta', exact: true }).click()
    await finish(page)
    assert.equal((await debug(page)).panel, null)
    assert.ok(Math.abs((await debug(page)).vaultAngle) > 1)
    assert.match(await page.locator('.depot-status').innerText(), /VHS|coffre/)
    await capture(page, 'vault-vhs-open')
  })
  await test('Zoom and keyboard pan work in pause; memory survives a reload', async () => {
    await page.getByRole('button', { name: 'Mettre les animations en pause', exact: true }).click()
    await settled(page, '.meme-bank', value => value.motionPaused && !value.frameScheduled)
    const before = cameraZoom(await debug(page))
    assert.ok(Number.isFinite(before))
    await page.getByRole('button', { name: 'Zoomer dans la banque', exact: true }).click()
    assert.ok(cameraZoom(await debug(page)) > before)
    await page.locator('.bank-viewport').focus()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('-')
    await settled(page, '.meme-bank', value => !value.frameScheduled)
    const count = (await debug(page)).renderCount
    await page.waitForTimeout(250)
    assert.equal((await debug(page)).renderCount, count)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await finish(page)
    assert.equal((await state(page)).counts.newsletter, 13)
    assert.equal((await state(page)).betaOpen, true)
    assert.match(await page.locator('.depot-status').innerText(), /VHS|coffre/)
  })
  await test('Beyond scenario produces more chaos, people and continuing overflow', async () => {
    await chooseScenario(page, 'Objectifs dépassés')
    assert.equal((await state(page)).counts.newsletter, 32)
    assert.equal((await state(page)).counts.applications, 20)
    const before = await debug(page)
    assert.ok(before.mailOverflow > 0 && before.dossierOverflow > 0)
    await capture(page, 'beyond-goals')
    await choose(page, 'applications')
    await page.getByRole('button', { name: 'Simuler cinq contributions pour l’étape 2', exact: true }).click()
    await finish(page)
    assert.ok((await debug(page)).dossierOverflow > before.dossierOverflow)
    assert.ok((await debug(page)).paperHeights.dossiers > before.paperHeights.dossiers)
    assert.equal((await state(page)).counts.applications, 25)
    await capture(page, 'dossier-closeup')
    await close(page)
  })
  await test('Return restores map framing, final exterior and disposes the interior', async () => {
    await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
    await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
    await settled(page, '.jarry-map', value => value.active && value.bank.betaOpen)
    assert.equal(await page.locator('[data-bank-canvas]').count(), 0)
    await page.locator('[data-project="memebank"]').click()
    const before = (await inspect(page, '.jarry-map')).view
    await enter(page)
    await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
    await settled(page, '.jarry-map', value => value.active)
    const after = (await inspect(page, '.jarry-map')).view
    assert.ok(Math.abs(after.zoom - before.zoom) < 1e-8)
    after.target.forEach((value, index) => assert.ok(Math.abs(value - before.target[index]) < 1e-8))
    await capture(page, 'exterior-open')
  })
  await test('WebGL restoration preserves controls; reset returns focus to discovery', async () => {
    await enter(page)
    await page.locator('[data-bank-canvas]').evaluate(canvas => {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const extension = gl.getExtension('WEBGL_lose_context')
      window.__bankRestoreContext = () => extension.restoreContext()
      extension.loseContext()
    })
    await page.locator('.meme-bank[data-world-error="true"]').waitFor()
    await choose(page, 'newsletter')
    assert.equal(await page.getByRole('button', { name: 'Simuler une inscription newsletter', exact: true }).isEnabled(), true)
    await page.evaluate(() => window.__bankRestoreContext())
    await page.locator('.meme-bank[data-world-error="false"]').waitFor()
    await finish(page)
    await page.getByRole('button', { name: 'Choisir un scénario de démonstration de la banque', exact: true }).click()
    await page.locator('.bank-scenarios button').filter({ hasText: 'Réinitialiser la banque et revenir au monde' }).click()
    await page.getByRole('button', { name: 'Simuler une visite', exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Simuler une visite', exact: true }).evaluate(el => el === document.activeElement), true)
  })
  await context.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  await mobile.addInitScript(value => { localStorage.setItem('macomisyon-bank-demo-v1', JSON.stringify(value)) }, saved)
  const phone = await mobile.newPage()
  watchErrors(phone)
  await test('Mobile fits three steps, shared panels and a truthful restored open state', async () => {
    await phone.goto(baseURL + '?lieu=bank', { waitUntil: 'domcontentloaded' })
    await settled(phone, '.meme-bank', value => value.renderCount > 0 && value.reducedMotion && !value.frameScheduled)
    assert.equal(await phone.locator('.bank-labels .world-label').count(), 3)
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.match(await phone.locator('.depot-status').innerText(), /coffre/)
    await capture(phone, 'mobile-vault')
    await phone.locator('.bank-labels [data-step="1"]').tap()
    await phone.getByRole('heading', { name: 'Submerger le guichet', exact: true }).waitFor()
    await phone.getByRole('button', { name: 'Simuler une inscription newsletter', exact: true }).scrollIntoViewIfNeeded()
    await visibleInspection(phone)
    await capture(phone, 'mobile-mission')
    await phone.getByRole('button', { name: 'Simuler une inscription newsletter', exact: true }).tap()
    assert.equal((await state(phone)).counts.newsletter, 33)
    await finish(phone)
    assert.equal((await debug(phone)).frameScheduled, false)
    await choose(phone, 'beta')
    await phone.getByRole('button', { name: 'Bêta ouverte · simulation', exact: true }).scrollIntoViewIfNeeded()
    await visibleInspection(phone)
    await capture(phone, 'mobile-ledger')
    await close(phone)
    await phone.getByRole('button', { name: 'Zoomer dans la banque', exact: true }).tap()
    assert.ok(cameraZoom(await debug(phone)) > 1)
    await phone.getByRole('button', { name: 'Recentrer la banque', exact: true }).tap()
  })
  await mobile.close()
  const narrow = await browser.newContext({ viewport: { width: 740, height: 900 }, reducedMotion: 'reduce' })
  await narrow.addInitScript(value => localStorage.setItem('macomisyon-bank-demo-v1', JSON.stringify(value)), saved)
  const tablet = await narrow.newPage()
  watchErrors(tablet)
  await test('Intermediate widths reserve the actual sidebar, not a mobile sheet', async () => {
    await tablet.goto(baseURL + '?lieu=bank', { waitUntil: 'domcontentloaded' })
    await finish(tablet)
    for (const id of ['newsletter', 'applications', 'beta']) {
      await choose(tablet, id)
      await visibleInspection(tablet)
    }
  })
  await narrow.close()

  const fallback = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await fallback.addInitScript(value => {
    localStorage.setItem('macomisyon-bank-demo-v1', JSON.stringify(value))
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/i.test(type) ? null : original.call(this, type, ...args) }
  }, saved)
  const plain = await fallback.newPage()
  watchErrors(plain)
  await test('Without WebGL the same three Komisyon remain fully usable', async () => {
    await plain.goto(baseURL + '?lieu=bank', { waitUntil: 'domcontentloaded' })
    await plain.locator('.meme-bank[data-world-error="true"]').waitFor()
    await choose(plain, 'applications')
    await plain.getByRole('button', { name: 'Simuler un formulaire reçu', exact: true }).click()
    assert.equal((await state(plain)).counts.applications, 21)
    await plain.getByRole('button', { name: 'Retour au monde', exact: true }).click()
    await plain.getByRole('button', { name: 'Entrer dans la banque', exact: true }).click()
    await plain.locator('.meme-bank[data-world-error="true"]').waitFor()
    await choose(plain, 'beta')
    assert.equal((await state(plain)).betaOpen, true)
  })
  await fallback.close()
  assert.deepEqual(errors, [], 'No JavaScript or hydration errors')
  await writeFile(output + '/report.json', JSON.stringify({ results, errors }, null, 2))
  console.log(results.length + ' bank browser checks passed.')
} finally { await browser.close() }
