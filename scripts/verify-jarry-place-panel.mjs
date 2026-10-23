import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { BANK_GOALS } from '../app/lib/macomisyon/bank/model.js'

const url = process.env.DEMO_URL || 'http://127.0.0.1:3096/macomisyon'
const output = process.env.REVIEW_DIR || '.impeccable/review/jarry-place-panel-20261023'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = [], results = []
const ready = page => page.waitForFunction(() => document.querySelector('[data-jarry-canvas]') && !document.querySelector('[aria-label="Zoomer"]')?.disabled)
const select = async (page, name) => {
  await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
  await page.locator('.place-row').filter({ hasText: name }).click()
  await page.locator('.place-detail h2').filter({ hasText: name }).waitFor()
}
const hit = async (page, locator) => {
  await locator.scrollIntoViewIfNeeded()
  return locator.evaluate(element => {
    const r = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
  })
}
try {
  for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['narrow', 320, 740], ['tablet', 820, 900], ['landscape', 844, 500]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
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
    if (device === 'desktop') assert.ok(panel.x > stage.x + stage.width / 2, 'Desktop window is on the right')
    const controls = [page.getByRole('button', { name: 'Fermer la fiche du lieu', exact: true }), page.getByRole('button', { name: 'Les lieux', exact: true }), ...['Zoomer', 'Dézoomer', 'Recentrer la carte'].map(name => page.getByRole('button', { name, exact: true })), page.locator('[data-project="memebank"]')]
    for (const control of controls) assert.ok(await hit(page, control), `${device}: ${await control.getAttribute('aria-label') || await control.innerText()} is not covered`)
    if (width <= 700) {
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
    assert.equal(page.url(), url)
    await page.screenshot({ path: `${output}/studio-${device}.png` })
    await select(page, 'La maison sur l’eau')
    assert.deepEqual(await page.locator('.map-tools').boundingBox(), initialTools, 'Long place names do not move the map controls')
    for (const name of ['Zoomer', 'Dézoomer', 'Recentrer la carte']) assert.ok(await hit(page, page.getByRole('button', { name, exact: true })))
    await page.screenshot({ path: `${output}/house-${device}.png` })
    await page.getByRole('button', { name: 'À propos — Comment explorer la carte', exact: true }).click()
    assert.equal(await page.locator('.place-detail').count(), 0, 'No stacked windows')
    await page.keyboard.press('Escape')
    await select(page, 'La voiture à l’écart')
    assert.equal(await page.locator('.place-detail .enter-depot, .place-detail .closed-place').count(), 0)
    await page.getByRole('button', { name: 'Fermer la fiche du lieu' }).click()
    assert.equal(await page.locator('[data-project="kokolo"]').count(), 0)
    assert.equal(await page.evaluate(() => document.activeElement.id), 'project-access')
    await select(page, 'Le hangar')
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
    await page.waitForURL('**/macomisyon?lieu=depot-q')
    await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
    await page.waitForURL(url)
    await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('Entrer au dépôt')), true)
    if (device === 'desktop' || device === 'mobile') {
      await select(page, 'La banque')
      for (let i = 0; i < BANK_GOALS.curiosity; i++) await page.getByRole('button', { name: 'Simuler une visite', exact: true }).click()
      assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('Entrer dans la banque')), true)
      await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).click()
      await page.waitForURL('**/macomisyon?lieu=bank')
      await page.keyboard.press('Escape')
      assert.ok(page.url().endsWith('?lieu=bank'), 'Exterior Escape handler leaves the interior alone')
      await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
      await page.waitForURL(url)
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
