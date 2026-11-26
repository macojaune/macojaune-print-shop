import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const url = process.env.DEMO_URL || 'http://127.0.0.1:3096/macomisyon'
const output = process.env.REVIEW_DIR || '.impeccable/review/jarry-relief'
const source = JSON.parse(await readFile('app/lib/macomisyon/data/jarry-osm.json', 'utf8'))
const names = new Set(source.roads.map(road => road.name).filter(Boolean))
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = [], remoteGeography = [], views = []
await mkdir(output, { recursive: true })

// DOM controls and reduced-motion rendering also work in the compiled app;
// these checks do not depend on Vue's development-only component inspection.
const settle = async page => {
  await page.waitForFunction(() => document.querySelector('[data-jarry-canvas]') && document.querySelector('button[aria-label="Zoomer"]')?.disabled === false)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

try {
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', isMobile: device === 'mobile', hasTouch: device === 'mobile' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => { if (/overpass-api|data\.geopf|elevation-tiles/.test(request.url())) remoteGeography.push(request.url()) })
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await settle(page)
    assert.equal(await page.locator('.world-fallback').count(), 0)
    assert.equal(await page.locator('.jarry-street').count(), 0, 'The overview stays free of street labels')
    const links = await page.locator('.map-attribution a').allTextContents()
    assert.ok(links.some(text => text.includes('IGN')) && links.some(text => text.includes('Terrain Tiles')))
    const layout = await page.evaluate(() => {
      const attribution = document.querySelector('.map-attribution').getBoundingClientRect()
      const controls = document.querySelector('.map-tabs').getBoundingClientRect()
      return { overflow: document.documentElement.scrollWidth > innerWidth, attribution: { left: attribution.left, right: attribution.right, bottom: attribution.bottom }, controls: { right: controls.right, top: controls.top }, width: innerWidth }
    })
    assert.equal(layout.overflow, false)
    assert.ok(layout.attribution.left >= 0 && layout.attribution.right <= layout.width)
    assert.ok(layout.attribution.left >= layout.controls.right || layout.attribution.bottom <= layout.controls.top, 'Attribution must not cover the map controls')
    // Startup credits collapse after a readable interval; the full source
    // notices remain in About (covered by verify-jarry-credits.mjs).
    await page.locator('.map-attribution').waitFor({ state: 'hidden', timeout: 20000 })
    await page.screenshot({ path: `${output}/after-${device}.png` })
    views.push({ device, state: 'overview', layout })
    for (const [id, title] of [['memebank', 'La banque'], ['quilivreou', 'Le hangar'], ['shootareas', 'La maison sur l’eau'], ['zikak', 'L’atelier']]) {
      await page.getByRole('button', { name: 'Les lieux', exact: true }).click()
      await page.locator('.place-row').filter({ hasText: title }).click()
      await settle(page)
      assert.equal(await page.locator(`.jarry-marker[data-project="${id}"]`).getAttribute('aria-pressed'), 'true')
      const labels = await page.locator('.jarry-street').allTextContents()
      labels.forEach(name => assert.ok(names.has(name), `Street name absent from OSM: ${name}`))
      views.push({ device, state: id, labels })
      if (device === 'desktop' || id === 'quilivreou') await page.screenshot({ path: `${output}/${device}-${id}.png` })
    }
    await context.close()
    console.log(`PASS ${device}: overview, attribution, four project views and OSM street names`)
  }
  assert.ok(views.some(view => view.labels?.length), 'Street names must actually appear in the close views')
  assert.deepEqual(errors, [])
  assert.deepEqual(remoteGeography, [], 'Geography must be embedded, with no live data API request')
  await writeFile(`${output}/report.json`, JSON.stringify({ url, errors, remoteGeography, views }, null, 2))
} finally {
  await browser.close()
}
