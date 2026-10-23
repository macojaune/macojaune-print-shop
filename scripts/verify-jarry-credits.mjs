import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

// Run against a server already started by the caller, including a compiled app:
// DEMO_URL=http://127.0.0.1:3096/macomisyon node scripts/verify-jarry-credits.mjs
// Uses only rendered DOM and keyboard interactions, never Vue internals.
const url = process.env.DEMO_URL || 'http://127.0.0.1:3096/macomisyon'
const output = process.env.REVIEW_DIR || '.impeccable/review/jarry-credits'
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = [], results = []
await mkdir(output, { recursive: true })

const sourceLinks = [
  'https://www.openstreetmap.org/copyright',
  'https://opendatacommons.org/licenses/odbl/1-0/',
  'https://geoservices.ign.fr/rgealti',
  'https://github.com/etalab/licence-ouverte/blob/master/LO.md',
  'https://registry.opendata.aws/terrain-tiles/',
  'https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
]

async function waitForCredits(page) {
  await page.waitForFunction(() => document.querySelector('button[aria-label="Zoomer"]')?.disabled === false && document.querySelector('.map-attribution')?.getClientRects().length > 0, undefined, { timeout: 30000 })
}

async function checkCollapse(page) {
  await page.locator('.map-attribution').waitFor({ state: 'detached', timeout: 15000 })
  const evidence = await page.evaluate(() => window.__creditsEvidence)
  const appearance = evidence.events.find(event => event.visible)
  const disappearance = evidence.events.find(event => !event.visible && event.time > appearance.time)
  assert.ok(appearance.loaded, 'Credits must first appear after the map is ready')
  assert.ok(disappearance.time - appearance.time >= 5000, `Credits visible for only ${disappearance.time - appearance.time} ms`)
  return evidence
}

async function checkLayout(page, selector) {
  const layout = await page.locator(selector).evaluate(element => {
    const rect = element.getBoundingClientRect()
    const stage = document.querySelector('.game-stage').getBoundingClientRect()
    const controls = [...document.querySelectorAll('.map-tabs button, .map-tools button')].map(button => {
      const other = button.getBoundingClientRect()
      return { label: button.getAttribute('aria-label') || button.textContent, overlap: Math.min(rect.right, other.right) > Math.max(rect.left, other.left) && Math.min(rect.bottom, other.bottom) > Math.max(rect.top, other.top) }
    })
    return {
      overflow: document.documentElement.scrollWidth > innerWidth || element.scrollWidth > element.clientWidth,
      insideStage: rect.left >= stage.left && rect.right <= stage.right && rect.top >= stage.top && rect.bottom <= stage.bottom,
      controls,
    }
  })
  assert.equal(layout.overflow, false, `${selector}: no horizontal overflow`)
  assert.equal(layout.insideStage, true, `${selector}: fits within the map`)
  if (selector === '.map-attribution') assert.deepEqual(layout.controls.filter(control => control.overlap), [], 'Visible credits must not overlap map controls')
  return layout
}

try {
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 568 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', isMobile: device !== 'desktop', hasTouch: device !== 'desktop' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push({ device, message: error.message }))
    await page.addInitScript(() => {
      window.__creditsEvidence = { events: [] }
      let wasVisible = false
      new MutationObserver(() => {
        const visible = !!document.querySelector('.map-attribution')?.getClientRects().length
        if (visible === wasVisible) return
        wasVisible = visible
        window.__creditsEvidence.events.push({ visible, time: performance.now(), loaded: document.querySelector('button[aria-label="Zoomer"]')?.disabled === false })
      }).observe(document, { childList: true, subtree: true, attributes: true })
    })

    // A slow first load must not consume the credit's five seconds. Holding all
    // scripts works for both Nuxt dev modules and hashed production chunks.
    let releaseScripts
    let holdScripts = device === 'desktop'
    const scriptsReady = new Promise(resolve => { releaseScripts = resolve })
    await page.route('**/*', async route => {
      if (holdScripts && route.request().resourceType() === 'script') await scriptsReady
      await route.continue()
    })
    try {
      await page.goto(url, { waitUntil: 'commit' })
      if (holdScripts) {
        await page.locator('.world-loading').waitFor({ state: 'visible' })
        await page.waitForTimeout(6500)
        assert.equal(await page.locator('.map-attribution').count(), 0, 'No credits or countdown before the map is loaded')
      }
    } finally {
      holdScripts = false
      releaseScripts()
    }

    await waitForCredits(page)
    assert.equal(await page.locator('.world-fallback').count(), 0)
    const initialLinks = await page.locator('.map-attribution a').allTextContents()
    for (const name of ['OpenStreetMap', 'IGN', 'Terrain Tiles']) assert.ok(initialLinks.some(text => text.includes(name)))
    const layout = await checkLayout(page, '.map-attribution')
    await page.screenshot({ path: `${output}/${device}-credits.png` })
    const timing = await checkCollapse(page)

    const about = page.getByRole('button', { name: /À propos.*Comment explorer la carte/ })
    await about.focus()
    await page.keyboard.press('Enter')
    await page.locator('#help-title').waitFor()
    assert.equal(await page.locator('#help-title').evaluate(element => element === document.activeElement), true, 'Opening the panel focuses its heading')
    await checkLayout(page, '#help-panel')
    const text = await page.locator('#help-panel').innerText()
    for (const phrase of ['Déplace la carte avec un doigt', 'Pince avec deux doigts', 'Au clavier', 'compteurs fictifs', 'aucune contribution réelle', '22 octobre 2026', 'Licence Ouverte 2.0', 'SRTM', 'GMTED2010', 'U.S. Geological Survey']) assert.ok(text.includes(phrase), `Missing help or attribution: ${phrase}`)
    assert.deepEqual(await page.locator('.map-sources a').evaluateAll(links => links.map(link => link.href)), sourceLinks)
    await page.screenshot({ path: `${output}/${device}-about.png` })

    await page.keyboard.press('Tab')
    assert.equal(await page.getByRole('button', { name: 'Fermer l’aide', exact: true }).evaluate(element => element === document.activeElement), true)
    for (let index = 0; index < sourceLinks.length; index++) {
      await page.keyboard.press('Tab')
      const reachable = await page.locator('.map-sources a').nth(index).evaluate(link => {
        const panel = link.closest('.help-panel').getBoundingClientRect()
        const title = link.closest('.help-panel').querySelector('.panel-title').getBoundingClientRect()
        return link === document.activeElement && [...link.getClientRects()].some(rect => {
          const x = (rect.left + rect.right) / 2
          const y = (rect.top + rect.bottom) / 2
          return y >= title.bottom && y < panel.bottom && document.elementFromPoint(x, y)?.closest('a') === link
        })
      })
      assert.equal(reachable, true, `Source ${index + 1} must be reachable by keyboard within the scrolling panel`)
    }
    await checkLayout(page, '#help-panel')
    await page.screenshot({ path: `${output}/${device}-sources.png` })
    await page.keyboard.press('Escape')
    await page.locator('#help-panel').waitFor({ state: 'detached' })
    assert.equal(await about.evaluate(element => element === document.activeElement), true, 'Escape restores focus to About')
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Fermer l’aide', exact: true }).click()
    assert.equal(await about.evaluate(element => element === document.activeElement), true, 'The close button restores focus to About')

    if (device === 'desktop') {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await waitForCredits(page)
      const credit = page.locator('.map-attribution a').first()
      await credit.focus()
      await page.waitForTimeout(6500)
      assert.equal(await credit.isVisible(), true, 'A focused credit must not disappear')
      await about.focus()
      await checkCollapse(page)
      assert.equal(await about.evaluate(element => element === document.activeElement), true)
    }
    results.push({ device, viewport, layout, timing })
    await context.close()
    console.log(`PASS ${device}: credit duration, collapse, sources, keyboard, panel and layout`)
  }
  assert.deepEqual(errors, [])
  await writeFile(`${output}/report.json`, JSON.stringify({ url, errors, results }, null, 2))
} finally {
  await browser.close()
}
