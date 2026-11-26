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

const footerLinks = [sourceLinks[0], sourceLinks[2], sourceLinks[5]]

async function checkFooter(page) {
  const footer = page.locator('footer .map-attribution, footer.map-attribution')
  await footer.waitFor()
  const links = footer.getByRole('link')
  assert.deepEqual(await links.evaluateAll(list => list.map(link => link.href)), footerLinks)
  for (const link of await links.all()) {
    const rect = await link.boundingBox()
    const { width, height } = page.viewportSize()
    assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width + 1 && rect.y + rect.height <= height + 1, 'Every credit is visible within the viewport')
    assert.equal(await link.evaluate(el => {
      const box = el.getBoundingClientRect()
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('a') === el
    }), true, 'Each visible source link can be activated')
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
}

async function checkHelpLayout(page) {
  const panel = page.locator('#help-panel')
  const box = await panel.boundingBox()
  const stage = await page.locator('.game-stage').boundingBox()
  assert.ok(box && stage && box.x >= stage.x - 1 && box.y >= stage.y - 1 && box.x + box.width <= stage.x + stage.width + 1 && box.y + box.height <= stage.y + stage.height + 1)
  assert.equal(await panel.evaluate(el => el.scrollWidth > el.clientWidth), false)
}

try {
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 568 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', isMobile: device !== 'desktop', hasTouch: device !== 'desktop' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push({ device, message: error.message }))
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.locator('.map-tools button[aria-label="Zoomer"]:enabled').waitFor()
    assert.equal(await page.locator('.world-fallback').count(), 0)
    await checkFooter(page)
    await page.screenshot({ path: `${output}/${device}-credits.png` })

    const about = page.getByRole('button', { name: /À propos.*Comment explorer la carte/ })
    await about.focus()
    await page.keyboard.press('Enter')
    await page.locator('#help-title').waitFor()
    assert.equal(await page.locator('#help-title').evaluate(element => element === document.activeElement), true, 'Opening the panel focuses its heading')
    await checkHelpLayout(page)
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
    await checkHelpLayout(page)
    await page.screenshot({ path: `${output}/${device}-sources.png` })
    await page.keyboard.press('Escape')
    await page.locator('#help-panel').waitFor({ state: 'detached' })
    assert.equal(await about.evaluate(element => element === document.activeElement), true, 'Escape restores focus to About')
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Fermer l’aide', exact: true }).click()
    assert.equal(await about.evaluate(element => element === document.activeElement), true, 'The close button restores focus to About')

    // The former overlay disappeared after six seconds. The links must still
    // work after that interval without hovering, focusing or reopening anything.
    if (device === 'desktop') await page.waitForTimeout(6500)
    await checkFooter(page)
    results.push({ device, viewport, sources: footerLinks })
    await context.close()
    console.log(`PASS ${device}: permanent footer, detailed sources, keyboard and layout`)
  }
  assert.deepEqual(errors, [])
  await writeFile(`${output}/report.json`, JSON.stringify({ url, errors, results }, null, 2))
} finally {
  await browser.close()
}
