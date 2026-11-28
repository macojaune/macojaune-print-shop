import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { devAction, devActionDisabled, expectNoSimulationInProduct } from './lib/macomisyon-dev.mjs'

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

    await expectNoSimulationInProduct(page)
    // A weapon still to come says what will release its game; it offers no game link yet.
    await button('Les Komisyon').tap()
    await house.locator('[data-mission="digrain"]').tap()
    assert.match(await page.locator('.depot-panel .depot-waiting').innerText(), /prochaine élimination au Digrain/)
    assert.equal(await page.locator('.depot-panel a[href^="https://scolo.marvinl.com"]').count(), 0)
    await expectNoSimulationInProduct(page)
    await button('Fermer le panneau').tap()
    // Real kills validate weapons in any order; locally and on DEV the dev panel stands in for them.
    for (const [index, weapon] of ['digrain', 'sandale', 'coutelas'].entries()) {
      await devAction(page, 'scolo:' + weapon)
      assert.equal(await house.getAttribute('data-completed'), String(index + 1), weapon + ' utilisée')
      assert.equal(await devActionDisabled(page, 'scolo:' + weapon), true)
    }
    assert.equal(await house.getAttribute('data-ready'), 'true')
    assert.match(await house.locator('.depot-status h2').innerText(), /Ça suffit/i)
    if (webgl) await house.locator('[data-station="digrain"]').tap()
    else {
      await button('Les Komisyon').tap()
      await house.locator('[data-mission="digrain"]').tap()
    }
    assert.match(await page.locator('.depot-panel .depot-waiting').innerText(), /son mini-jeu est sorti/)
    assert.equal(await page.locator('.depot-panel').getByRole('link', { name: 'Jouer sur Scolo' }).getAttribute('href'), 'https://scolo.marvinl.com/#run')
    await button('Fermer le panneau').tap()
    await button('Retour au monde').tap()
    await page.locator('.place-detail-content').getByText(/À louer/).waitFor()
    await button('Entrer dans la maison').tap()
    await page.waitForURL(url => url.searchParams.get('lieu') === 'scolo')
    await house.waitFor()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.scolo-house[data-ready="true"]').waitFor()
    assert.equal(await house.getAttribute('data-completed'), '3')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.deepEqual(errors, [])
    await devAction(page, 'scolo:reset')
    assert.equal(await house.getAttribute('data-completed'), '0')
    await context.close()
    console.log('PASS mobile, ' + (webgl ? 'scène 3D' : 'repli sans WebGL') + ' : accueil, trois armes dans le désordre, final « Ça suffit » via le panneau Dev, retour, rechargement et remise à zéro')
  }
} finally { await browser.close() }
