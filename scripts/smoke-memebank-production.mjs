// Read-only production smoke test. Production has no simulations: progress is
// seeded in this browser's storage only, and the dev panel must stay absent.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { expectNoSimulationInProduct } from './lib/macomisyon-dev.mjs'

const url = process.env.DEMO_URL || 'http://127.0.0.1:3000/macomisyon'
const key = 'macomisyon-bank-demo-v1'
const locked = { version: 1, counts: { curiosity: 0, newsletter: 0, applications: 0, qualified: 0, admitted: 0 }, completed: [], betaOpen: false }
const open = { version: 1, counts: { curiosity: 10, newsletter: 32, applications: 20, qualified: 5, admitted: 3 }, completed: ['curiosity', 'newsletter', 'applications'], betaOpen: true }
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = []
const listen = page => {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /hydration|mismatch/i.test(message.text())) errors.push(message.text()) })
}
const seeded = async (options, saved) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', ...options })
  await context.addInitScript(({ key, saved }) => {
    localStorage.setItem('macomisyon-guide-v1', 'seen')
    localStorage.setItem(key, JSON.stringify(saved))
  }, { key, saved })
  const page = await context.newPage()
  listen(page)
  return { context, page }
}
const choose = async (page, id) => {
  await page.getByRole('button', { name: 'Les Komisyon', exact: true }).click()
  await page.locator('.bank-inventory button[data-mission="' + id + '"]').click()
  await page.locator('.depot-goal').waitFor()
}
try {
  const first = await seeded({ viewport: { width: 1440, height: 1000 } }, locked)
  const response = await first.page.goto(url + '?lieu=bank', { waitUntil: 'domcontentloaded' })
  assert.equal(response.status(), 200)
  await first.page.locator('.bank-curiosity').waitFor()
  assert.doesNotMatch(first.page.url(), /lieu=bank/, 'A closed bank cannot be entered by deep link')
  assert.match(await first.page.locator('.bank-curiosity').innerText(), /0 \/ 10 visites/)
  assert.equal(await first.page.locator('.maco-dev-toggle').count(), 0, 'The dev panel never ships to production')
  await expectNoSimulationInProduct(first.page)
  await first.context.close()

  const desktop = await seeded({ viewport: { width: 1440, height: 1000 } }, open)
  const page = desktop.page
  await page.goto(url + '?lieu=bank', { waitUntil: 'domcontentloaded' })
  await page.locator('.meme-bank[data-world-error="false"] .world-label').first().waitFor()
  assert.equal(await page.locator('.bank-labels .world-label').count(), 3)
  await choose(page, 'newsletter')
  assert.match(await page.locator('.bank-over-goal').innerText(), /24 au-delà/)
  await expectNoSimulationInProduct(page)
  assert.equal(await page.locator('.maco-dev-toggle').count(), 0)
  await page.getByRole('button', { name: 'Fermer le panneau', exact: true }).click()
  await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
  await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
  await desktop.context.close()

  const mobile = await seeded({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, open)
  const phone = mobile.page
  await phone.goto(url + '?lieu=bank', { waitUntil: 'domcontentloaded' })
  await phone.locator('.meme-bank[data-world-error="false"] .world-label').first().waitFor()
  await choose(phone, 'beta')
  await phone.locator('.depot-panel .depot-waiting').filter({ hasText: 'Bêta ouverte.' }).scrollIntoViewIfNeeded()
  await expectNoSimulationInProduct(phone)
  await phone.getByRole('button', { name: 'Fermer le panneau', exact: true }).tap()
  await phone.getByRole('button', { name: 'Zoomer dans la banque', exact: true }).tap()
  await phone.getByRole('button', { name: 'Recentrer la banque', exact: true }).tap()
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await phone.getByRole('button', { name: 'Retour au monde', exact: true }).tap()
  await phone.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
  await mobile.context.close()
  assert.deepEqual(errors, [])
  console.log('PASS Production: HTTP 200, closed bank gate, no dev panel, no simulation in the product UI')
  console.log('PASS Production desktop and mobile: stored open state, 3 steps, over-quota display, shared panels, map return')
  console.log('PASS No JavaScript or hydration errors')
} finally { await browser.close() }
