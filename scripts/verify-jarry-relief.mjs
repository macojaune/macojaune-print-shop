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
    await page.getByRole('button', { name: 'Explorer la carte', exact: true }).click()
    await settle(page)
    assert.equal(await page.locator('.world-fallback').count(), 0)
    assert.equal(await page.locator('.jarry-street').count(), 0, 'The overview stays free of street labels')
    await page.getByRole('button', { name: /À propos.*Comment explorer la carte/ }).click()
    const sources = page.getByRole('button', { name: 'La carte et ses sources' })
    assert.equal(await sources.getAttribute('aria-expanded'), 'false')
    await sources.click()
    const links = await page.locator('#map-sources').getByRole('link').allTextContents()
    assert.ok(links.some(text => text.includes('IGN')) && links.some(text => text.includes('Terrain Tiles')))
    await page.getByRole('button', { name: 'Fermer l’aide' }).click()
    await page.locator('#help-panel').waitFor({ state: 'hidden' })
    const layout = await page.evaluate(() => {
      const footer = document.querySelector('.game-footer').getBoundingClientRect()
      const stage = document.querySelector('.game-stage').getBoundingClientRect()
      return { overflow: document.documentElement.scrollWidth > innerWidth, footer: { left: footer.left, right: footer.right, top: footer.top }, stageBottom: stage.bottom, width: innerWidth }
    })
    assert.equal(layout.overflow, false)
    assert.ok(layout.footer.left >= 0 && layout.footer.right <= layout.width)
    assert.ok(layout.footer.top >= layout.stageBottom - 1, 'The footer is below the map')
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
