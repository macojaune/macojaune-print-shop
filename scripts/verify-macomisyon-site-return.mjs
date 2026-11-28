import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const site = process.env.SITE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))

  async function checkHome() {
    await page.waitForURL(url => url.pathname === '/')
    await page.locator('#main-content #home-map-title').first().waitFor()
    await page.waitForFunction(() => !document.querySelector('.page-enter-active, .page-leave-active'))
    assert.equal(await page.locator('#home-map-title').count(), 1, 'An extra homepage was rendered outside the layout')
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('header').count(), 1)
    assert.equal(await page.locator('footer').count(), 1)
    assert.equal(await page.locator('.maco-game').count(), 0)
    assert.ok(await page.locator('script[src="https://static.axept.io/sdk.js"]').count() <= 1, 'The consent SDK was inserted more than once')
  }
  async function checkMap() {
    await page.locator('.site-return').waitFor()
    assert.equal(await page.locator('#main-content, #home-map-title').count(), 0)
  }

  await page.goto(site, { waitUntil: 'domcontentloaded' })
  await checkHome()
  for (const waitForMap of [false, true]) {
    await page.locator('.home-map').tap()
    await checkMap()
    if (waitForMap) await page.locator('.map-tools button[aria-label="Zoomer"]:enabled').waitFor()
    await page.locator('.site-return').tap()
    await checkHome()
  }
  await page.goBack({ waitUntil: 'domcontentloaded' })
  await checkMap()
  await page.goForward({ waitUntil: 'domcontentloaded' })
  await checkHome()
  assert.deepEqual(pageErrors, [])
  console.log('PASS Two map visits, return link, Back and Forward each render one page.')
} finally {
  await browser.close()
}
