import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const url = process.env.DEMO_URL || 'http://127.0.0.1:3096/macomisyon'
const output = process.env.REVIEW_DIR || '.impeccable/review/jarry-landmarks-20261023'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = [], results = []
const ready = page => page.waitForFunction(() => document.querySelector('[data-jarry-canvas]') && document.querySelector('[aria-label="Zoomer"]')?.disabled === false)
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const select = async (page, name) => {
  await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
  await page.locator('.place-row').filter({ hasText: name }).click()
  await settle(page)
  assert.equal(await page.locator('.project-dock h2').innerText(), name)
}
const pickModel = async (page, id, name) => {
  const marker = page.locator(`[data-project="${id}"]`)
  const canvas = await page.locator('[data-jarry-canvas]').boundingBox()
  const before = await marker.boundingBox()
  const centre = { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 - 3 }
  // Drag from the model itself: moving the map must not immediately refocus it.
  await page.mouse.move(centre.x, centre.y)
  await page.mouse.down()
  await page.mouse.move(centre.x + 60, centre.y, { steps: 8 })
  await page.mouse.up()
  await settle(page)
  const moved = await marker.boundingBox()
  assert.ok(Math.abs(moved.x - before.x) > 20, 'Dragging a model pans the map without selecting it again')
  const point = { x: centre.x + moved.x - before.x, y: centre.y + moved.y - before.y }
  assert.equal(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.hasAttribute('data-jarry-canvas'), point), true, 'The click reaches the 3D canvas, not its DOM marker')
  await page.mouse.click(point.x, point.y)
  await settle(page)
  const after = await marker.boundingBox()
  assert.ok(Math.abs(after.x - before.x) < 1 && Math.abs(after.y - before.y) < 1, `Clicking the ${id} model selects it and restores its focus`)
  assert.equal(await page.locator('.project-dock h2').innerText(), name)
}

try {
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 740 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', isMobile: device !== 'desktop', hasTouch: device !== 'desktop' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await ready(page)
    assert.equal(await page.locator('.world-fallback').count(), 0)
    assert.equal(await page.locator('[data-project="kokolo"]').count(), 0, 'The car has no permanent marker')
    for (const [id, name] of [['kokolo', 'La voiture à l’écart'], ['omasla', 'La cour du mas']]) {
      await select(page, name)
      assert.equal(await page.locator(`[data-project="${id}"]`).getAttribute('aria-pressed'), 'true')
      assert.equal(await page.locator('.project-dock .closed-place, .project-dock .enter-depot').count(), 0, 'Discovery does not invent an interior, a mission or a closed door')
      const selectedMarker = await page.locator(`[data-project="${id}"]`).boundingBox()
      assert.ok(selectedMarker && selectedMarker.x >= 0 && selectedMarker.x + selectedMarker.width <= viewport.width)
      assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.project-dock h2')), true, 'Focus follows the selection out of the closed list')
      if (device === 'desktop') await pickModel(page, id, name)
      await page.screenshot({ path: `${output}/${id}-${device}.png` })
    }
    assert.equal(await page.locator('[data-project="kokolo"]').count(), 0)
    await select(page, 'MAGGMA Studio')
    const studioMarker = page.locator('[data-project="maggma-studio"]')
    assert.equal(await studioMarker.getAttribute('aria-pressed'), 'true')
    const studioBox = await studioMarker.boundingBox()
    assert.ok(studioBox && studioBox.x >= 0 && studioBox.x + studioBox.width <= viewport.width, 'The volcano has a visible marker in its own map location')
    if (device === 'desktop') await pickModel(page, 'maggma-studio', 'MAGGMA Studio')
    const studioLink = page.getByRole('link', { name: 'Visiter le site du studio (nouvel onglet)', exact: true })
    assert.equal(await studioLink.getAttribute('href'), 'https://maggma.studio/')
    assert.equal(await studioLink.getAttribute('target'), '_blank')
    assert.match(await studioLink.getAttribute('rel'), /noopener/)
    assert.equal(page.url(), url, 'Selecting the studio does not navigate away')
    assert.equal(await page.locator('.project-dock .closed-place').count(), 0)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    const linkBox = await studioLink.boundingBox()
    assert.ok(linkBox && linkBox.x >= 0 && linkBox.x + linkBox.width <= viewport.width)
    await page.screenshot({ path: `${output}/studio-${device}.png` })
    if (device === 'desktop') {
      const popupPromise = page.waitForEvent('popup')
      await studioLink.click()
      const popup = await popupPromise
      await popup.waitForLoadState('domcontentloaded').catch(() => {})
      assert.equal(new URL(popup.url()).hostname, 'maggma.studio')
      await popup.close()
      await select(page, 'Le hangar')
      await page.getByRole('button', { name: 'Entrer au dépôt', exact: true }).click()
      await page.waitForURL('**/macomisyon?lieu=depot-q')
      await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
      await page.waitForURL(url)
      await ready(page)
      assert.equal(await page.locator('[data-project="quilivreou"]').getAttribute('aria-pressed'), 'true')
    }
    results.push({ device, discoveryPlaces: ['kokolo', 'omasla'], studioModel: true, studioLink: true, overflow: false })
    await context.close()
    console.log(`PASS ${device}: discoveries, focus, studio link and layout`)
  }
  const fallback = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (name, ...args) {
      if (/webgl/i.test(name)) return null
      return original.call(this, name, ...args)
    }
  })
  const page = await fallback.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.locator('.world-fallback').waitFor()
  await select(page, 'La voiture à l’écart')
  assert.equal(await page.locator('.project-dock .closed-place').count(), 0)
  await select(page, 'MAGGMA Studio')
  assert.equal(await page.getByRole('link', { name: 'Visiter le site du studio (nouvel onglet)', exact: true }).getAttribute('href'), 'https://maggma.studio/')
  results.push({ fallback: true, discoveriesAndStudioAccessible: true })
  await fallback.close()
  assert.deepEqual(errors, [])
  await writeFile(`${output}/report.json`, JSON.stringify({ url, results, errors }, null, 2))
  console.log('PASS WebGL fallback and no uncaught page errors')
} finally { await browser.close() }
