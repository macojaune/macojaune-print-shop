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

async function checkFooter(page) {
  const footer = page.locator('.game-footer')
  const feedback = footer.getByRole('link', { name: 'Signaler un bug ou une amélioration' })
  assert.equal(await feedback.getAttribute('href'), 'https://tally.so/r/WJzDrJ')
  const rect = await feedback.boundingBox()
  const { width, height } = page.viewportSize()
  assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width + 1 && rect.y + rect.height <= height + 1, 'The feedback link fits within the viewport')
  assert.equal(await feedback.evaluate(link => {
    const box = link.getBoundingClientRect()
    return link.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
  }), true, 'The feedback link can be activated')
  for (const href of sourceLinks) assert.equal(await footer.locator(`a[href="${href}"]`).count(), 0)
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
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 568 }], ['landscape', { width: 667, height: 375 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', isMobile: device !== 'desktop', hasTouch: device !== 'desktop' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push({ device, message: error.message }))
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.locator('.map-tools button[aria-label="Zoomer"]:enabled').waitFor()
    assert.equal(await page.locator('.world-fallback').count(), 0)
    const guide = page.locator('#map-guide')
    const about = page.getByRole('button', { name: /À propos.*Comment explorer la carte/ })
    const help = page.locator('#help-panel')
    const toggle = help.getByRole('button', { name: 'La carte et ses sources' })
    const sources = help.locator('#map-sources')
    const openHelp = async () => {
      await about.focus()
      await page.keyboard.press('Enter')
      await help.waitFor()
      assert.equal(await help.locator('#help-title').evaluate(element => element === document.activeElement), true)
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
      assert.equal(await sources.isVisible(), false, 'Detailed sources are collapsed on opening About')
    }
    await guide.waitFor()
    assert.equal(await guide.locator(`a[href="${sourceLinks[0]}"]`).isVisible(), true, 'The guide credits OpenStreetMap')
    await checkFooter(page)
    await page.screenshot({ path: `${output}/${device}-guide.png` })
    await guide.getByRole('button', { name: 'Explorer la carte', exact: true }).click()
    await guide.waitFor({ state: 'hidden' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.map-tools button[aria-label="Zoomer"]:enabled').waitFor()
    assert.equal(await guide.isVisible(), false, 'The guide stays dismissed after reloading')
    await checkFooter(page)

    await openHelp()
    await checkHelpLayout(page)
    const helpText = await help.innerText()
    assert.doesNotMatch(helpText, /compteurs fictifs|aucune contribution réelle/i)
    await page.screenshot({ path: `${output}/${device}-about.png` })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await sources.waitFor()
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
    assert.equal(await toggle.getAttribute('aria-controls'), 'map-sources')
    for (const phrase of ['22 octobre 2026', 'Licence Ouverte 2.0', 'SRTM', 'GMTED2010', 'U.S. Geological Survey']) assert.ok((await sources.innerText()).includes(phrase), `Missing attribution: ${phrase}`)
    const links = sources.getByRole('link')
    assert.deepEqual(await links.evaluateAll(list => list.map(link => link.href)), sourceLinks)
    for (let index = 0; index < sourceLinks.length; index++) {
      await page.keyboard.press('Tab')
      const reachable = await links.nth(index).evaluate(link => {
        const panel = link.closest('#help-panel').getBoundingClientRect()
        return link === document.activeElement && [...link.getClientRects()].some(rect => {
          const x = (rect.left + rect.right) / 2
          const y = (rect.top + rect.bottom) / 2
          return y > panel.top && y < panel.bottom && link.contains(document.elementFromPoint(x, y))
        })
      })
      assert.equal(reachable, true, `Source ${index + 1} is reachable by keyboard in the scrolling panel`)
    }
    await checkHelpLayout(page)
    await page.screenshot({ path: `${output}/${device}-sources.png` })
    await toggle.click()
    await sources.waitFor({ state: 'hidden' })
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
    await page.keyboard.press('Escape')
    await help.waitFor({ state: 'hidden' })
    assert.equal(await about.evaluate(element => element === document.activeElement), true, 'Escape restores focus to About')
    await openHelp()
    await help.getByRole('button', { name: 'Revoir le guide' }).click()
    await guide.waitFor()
    await guide.getByRole('button', { name: 'Passer le guide' }).click()
    await guide.waitFor({ state: 'hidden' })
    await help.waitFor()
    assert.equal(await help.getByRole('button', { name: 'Revoir le guide' }).evaluate(button => button === document.activeElement), true, 'Closing a replay returns to its trigger')
    await help.getByRole('button', { name: 'Fermer l’aide' }).click()
    await help.waitFor({ state: 'hidden' })
    assert.equal(await about.evaluate(element => element === document.activeElement), true, 'Closing restores focus to About')

    results.push({ device, viewport, sources: sourceLinks })
    await context.close()
    console.log(`PASS ${device}: first visit, feedback link, source disclosure, keyboard and guide replay`)
  }
  assert.deepEqual(errors, [])
  await writeFile(`${output}/report.json`, JSON.stringify({ url, errors, results }, null, 2))
} finally {
  await browser.close()
}
