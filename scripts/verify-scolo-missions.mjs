import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const site = process.env.SITE_URL || 'http://127.0.0.1:32190'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  for (const webgl of [true, false]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
    if (!webgl) await context.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (name, ...args) {
        return name.includes('webgl') ? null : getContext.call(this, name, ...args)
      }
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const button = name => page.getByRole('button', { name, exact: true })
    await page.goto(site, { waitUntil: 'domcontentloaded' })
    const entry = page.locator('a[href="/macomisyon"]').first()
    await entry.tap()
    await page.getByRole('button', { name: 'Explorer la carte', exact: true }).click()
    if (webgl) await page.locator('.map-tools button[aria-label="Zoomer"]:enabled').waitFor()
    await button(webgl ? 'Les lieux' : 'Voir les lieux').tap()
    await page.locator('.place-row').filter({ hasText: 'La maison aux cartons' }).tap()
    await button('Entrer dans la maison').tap()
    const house = page.locator('.scolo-house')
    if (webgl) await house.locator('[data-station="sandale"]').waitFor()
    else await house.getByText('La vue 3D est indisponible.', { exact: false }).first().waitFor()
    assert.equal(await house.getAttribute('data-completed'), '0')

    await button('Les Komisyon').tap()
    await house.locator('[data-mission="digrain"]').tap()
    assert.equal(await button('Simuler une partie terminée').count(), 0)
    await button('Fermer le panneau').tap()
    for (const [index, game] of ['sandale', 'coutelas', 'digrain'].entries()) {
      if (webgl && index === 0) await house.locator('[data-station="sandale"]').tap()
      else {
        await button('Les Komisyon').tap()
        await house.locator('[data-mission="' + game + '"]').tap()
      }
      await button('Simuler une partie terminée').tap()
      assert.equal(await house.getAttribute('data-completed'), String(index + 1))
    }
    assert.equal(await house.getAttribute('data-moved'), 'true')
    await button('Retour au monde').tap()
    await page.locator('.place-detail-content').getByText(/Le camion a emporté/).waitFor()
    await button('Entrer dans la maison').tap()
    await page.waitForURL(url => url.searchParams.get('lieu') === 'scolo')
    await house.waitFor()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.scolo-house[data-moved="true"]').waitFor()
    assert.equal(await house.getAttribute('data-completed'), '3')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.deepEqual(errors, [])
    await context.close()
    console.log('PASS mobile, ' + (webgl ? 'scène 3D' : 'repli sans WebGL') + ' : accueil, trois Komisyon, déménagement, retour et rechargement')
  }
} finally { await browser.close() }
