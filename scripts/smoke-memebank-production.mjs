import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const url = process.env.DEMO_URL || 'http://127.0.0.1:3000/macomisyon'
const key = 'macomisyon-bank-demo-v1'
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = []
const listen = page => {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /hydration|mismatch/i.test(message.text())) errors.push(message.text()) })
}
const choose = async (page, id) => {
  await page.getByRole('button', { name: 'Les Komisyon', exact: true }).click()
  await page.locator('.bank-inventory button[data-mission="' + id + '"]').click()
  await page.locator('.depot-goal').waitFor()
}
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const page = await desktop.newPage()
  listen(page)
  const response = await page.goto(url + '?lieu=bank', { waitUntil: 'domcontentloaded' })
  assert.equal(response.status(), 200)
  for (let i = 0; i < 10; i++) await page.getByRole('button', { name: 'Simuler une visite', exact: true }).click()
  await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).click()
  await page.locator('.meme-bank[data-world-error="false"] .world-label').first().waitFor()
  assert.equal(await page.locator('.bank-labels .world-label').count(), 3)
  await choose(page, 'newsletter')
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Simuler cinq contributions pour l’étape 1', exact: true }).click()
  assert.match(await page.locator('.depot-goal').innerText(), /10/)
  assert.match(await page.locator('.bank-over-goal').innerText(), /2 au-delà/)
  await page.getByRole('button', { name: 'Choisir un scénario de démonstration de la banque', exact: true }).click()
  await page.locator('.bank-scenarios button').filter({ hasText: 'Objectifs dépassés' }).click()
  await page.locator('.depot-panel').waitFor({ state: 'detached' })
  const saved = await page.evaluate(name => JSON.parse(localStorage.getItem(name)), key)
  assert.equal(saved.counts.newsletter, 32)
  assert.equal(saved.counts.applications, 20)
  assert.equal(saved.betaOpen, true)
  await page.getByRole('button', { name: 'Retour au monde', exact: true }).click()
  await page.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  await mobile.addInitScript(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key, saved })
  const phone = await mobile.newPage()
  listen(phone)
  await phone.goto(url + '?lieu=bank', { waitUntil: 'domcontentloaded' })
  await phone.locator('.meme-bank[data-world-error="false"] .world-label').first().waitFor()
  await choose(phone, 'beta')
  await phone.getByRole('button', { name: 'Bêta ouverte · simulation', exact: true }).scrollIntoViewIfNeeded()
  await phone.getByRole('button', { name: 'Zoomer dans la banque', exact: true }).tap()
  await phone.getByRole('button', { name: 'Recentrer la banque', exact: true }).tap()
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await phone.getByRole('button', { name: 'Retour au monde', exact: true }).tap()
  await phone.getByRole('button', { name: 'Entrer dans la banque', exact: true }).waitFor()
  await mobile.close()
  assert.deepEqual(errors, [])
  console.log('PASS Production desktop: HTTP 200, curiosity gate, 3 steps, over-quota actions, scenarios, map return')
  console.log('PASS Production mobile: saved VHS state, shared panels, accessible zoom, map return')
  console.log('PASS No JavaScript or hydration errors; no Vue development inspection used')
} finally { await browser.close() }
