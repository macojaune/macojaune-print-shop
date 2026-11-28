import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { devAction, expectNoSimulationInProduct } from './lib/macomisyon-dev.mjs'
import { BANK_GOALS } from '../app/lib/macomisyon/bank/model.js'

const url = process.env.DEMO_URL || 'http://127.0.0.1:3096/macomisyon'
const output = process.env.REVIEW_DIR || '.impeccable/review/jarry-place-panel-20261023'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = [], results = []
const isOverview = location => location.origin === new URL(url).origin && location.pathname.replace(/\/$/, '') === '/macomisyon' && !location.search
const ready = page => page.waitForFunction(() => document.querySelector('[data-jarry-canvas]') && !document.querySelector('[aria-label="Zoomer"]')?.disabled)
const select = async (page, name) => {
  await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
  await page.locator('.place-row').filter({ hasText: name }).click()
  await page.locator('.place-detail h2').filter({ hasText: name }).waitFor()
  await page.locator('#places-panel').waitFor({ state: 'detached' })
}
const hit = async (page, locator) => {
  await locator.scrollIntoViewIfNeeded()
  return locator.evaluate(element => {
    const r = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
  })
}
try {
  for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['narrow', 320, 740], ['tablet', 820, 900], ['landscape', 844, 500], ['compact-landscape', 667, 375]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
    await page.getByRole('button', { name: 'Explorer la carte', exact: true }).click()
    await ready(page)
    const initialTools = await page.locator('.map-tools').boundingBox()
    assert.equal(await page.locator('.place-detail').count(), 0, 'No permanent strip before selection')
    assert.equal(await page.locator('.game-skip').getAttribute('href'), '#project-access')
    assert.equal(await page.locator('#project-access').count(), 1)
    await select(page, 'La banque')
    assert.equal(await page.evaluate(() => document.activeElement.id), 'place-detail-title')
    assert.equal(await page.locator('.map-panel').count(), 0)
    const panel = await page.locator('.place-detail').boundingBox()
    const stage = await page.locator('.game-stage').boundingBox()
    assert.deepEqual(await page.locator('.map-tools').boundingBox(), initialTools, 'Opening a place leaves the map controls in their original far-right position')
    assert.ok(panel.x >= stage.x && panel.y >= stage.y && panel.x + panel.width <= stage.x + stage.width + 1 && panel.y + panel.height <= stage.y + stage.height + 1)
    const stacked = width <= 700 && height > width
    if (stacked) {
      assert.ok(Math.abs(panel.x + panel.width / 2 - stage.x - stage.width / 2) <= 1)
      assert.ok(Math.abs(panel.y - stage.y - stage.height / 2) <= 1, 'The mobile card opens at the middle of the map')
    } else {
      const fromCentre = panel.x - stage.x - stage.width / 2
      assert.ok(fromCentre > 0 && fromCentre <= 60, 'The card starts next to the centred building')
      assert.ok(Math.abs(panel.y - stage.y - stage.height / 2) <= 80, 'The card starts near the vertical centre')
    }
    const controls = [page.getByRole('button', { name: 'Fermer la fiche du lieu', exact: true }), page.getByRole('button', { name: 'Les lieux', exact: true }), ...['Zoomer', 'Dézoomer', 'Recentrer la carte'].map(name => page.getByRole('button', { name, exact: true })), page.locator('[data-project="memebank"]')]
    for (const control of controls) assert.ok(await hit(page, control), `${device}: ${await control.getAttribute('aria-label') || await control.innerText()} is not covered`)
    if (width <= 700 && height > width) {
      const marker = await page.locator('[data-project="memebank"]').boundingBox()
      assert.ok(marker.y + marker.height + 60 < panel.y, 'Compact framing leaves room for the bank below its marker and above the window')
    }
    await page.screenshot({ path: `${output}/bank-${device}.png` })
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.place-detail').count(), 0)
    assert.equal(await page.evaluate(() => document.activeElement.id), 'project-access', 'List selection returns to list trigger')
    // A real map marker activates the same window and regains focus on close.
    await page.locator('[data-project="memebank"]').focus()
    await page.keyboard.press('Enter')
    await page.locator('.place-detail').waitFor()
    assert.equal(await page.evaluate(() => document.activeElement.id), 'place-detail-title')
    await page.getByRole('button', { name: 'Fermer la fiche du lieu' }).click()
    assert.equal(await page.locator('.place-detail').count(), 0)
    assert.equal(await page.evaluate(() => document.activeElement.dataset.project), 'memebank')
    await select(page, 'MAGGMA Studio')
    assert.ok(await hit(page, page.getByRole('link', { name: 'Visiter le site du studio (nouvel onglet)', exact: true })))
    assert.ok(isOverview(new URL(page.url())))
    await page.screenshot({ path: `${output}/studio-${device}.png` })
    await select(page, 'L’atelier')
    const workshop = await page.locator('.place-detail').boundingBox()
    assert.ok(Math.abs(panel.x - workshop.x) <= 1 && Math.abs(panel.y - workshop.y) <= 1, 'Closed and open places share the same card position')
    await select(page, 'La maison sur l’eau')
    assert.deepEqual(await page.locator('.map-tools').boundingBox(), initialTools, 'Long place names do not move the map controls')
    for (const name of ['Zoomer', 'Dézoomer', 'Recentrer la carte']) assert.ok(await hit(page, page.getByRole('button', { name, exact: true })))
    await page.screenshot({ path: `${output}/house-${device}.png` })
    await page.getByRole('button', { name: 'À propos — Comment explorer la carte', exact: true }).click()
    assert.equal(await page.locator('.place-detail').count(), 0, 'No stacked windows')
    await page.keyboard.press('Escape')
    if (device.endsWith('landscape')) {
      await select(page, 'La maison aux cartons')
      const marker = page.locator('[data-project="scolo"]')
      await page.waitForFunction(() => {
        const pin = document.querySelector('[data-project="scolo"]')?.getBoundingClientRect()
        const stage = document.querySelector('.game-stage')?.getBoundingClientRect()
        const card = document.querySelector('.place-detail')?.getBoundingClientRect()
        return pin && stage && card && pin.top >= stage.top && pin.bottom <= stage.bottom && pin.right < card.left
      })
      assert.ok(await hit(page, marker), 'The selected house stays visible beside the landscape panel')
      assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), false)
    }
    await select(page, 'La voiture à l’écart')
    assert.equal(await page.locator('.place-detail .enter-depot, .place-detail .closed-place').count(), 0)
    await page.getByRole('button', { name: 'Fermer la fiche du lieu' }).click()
    assert.equal(await page.locator('[data-project="kokolo"]').count(), 0)
    assert.equal(await page.evaluate(() => document.activeElement.id), 'project-access')
    await select(page, 'Le hangar')
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
    await page.waitForURL(location => location.searchParams.get('lieu') === 'depot-q')
    await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
    await page.waitForURL(isOverview)
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('Entrer au dépôt')), true)
    if (device === 'desktop' || device === 'mobile') {
      await select(page, 'La banque')
      assert.match(await page.locator('.bank-curiosity').innerText(), new RegExp(`0 / ${BANK_GOALS.curiosity} visites`))
      await expectNoSimulationInProduct(page)
      // Visits are counted outside the map; the dev panel stands in for them.
      await devAction(page, 'memebank:visit', BANK_GOALS.curiosity)
      await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).click()
      await page.waitForURL(location => location.searchParams.get('lieu') === 'bank')
      await page.keyboard.press('Escape')
      assert.ok(page.url().endsWith('?lieu=bank'), 'Exterior Escape handler leaves the interior alone')
      await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
      await page.waitForURL(isOverview)
      await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('Entrer dans la banque')), true)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    results.push({ device, window: panel, controlsUncovered: true, focusAndEscape: true, depotRoundTrip: true })
    console.log(`PASS ${device}: window, focus, map controls, external link, discovery and depot return`)
    await context.close()
  }
  assert.deepEqual(errors, [])
  await writeFile(`${output}/panel-report.json`, JSON.stringify({ url, results, errors }, null, 2))
} finally { await browser.close() }
