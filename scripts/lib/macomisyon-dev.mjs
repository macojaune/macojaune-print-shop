// Drives the Maco'misyon development panel from browser checks.
// Simulations only exist there: the product UI never offers them.
import assert from 'node:assert/strict'

const toggle = page => page.locator('.maco-dev-toggle')

/** Fails early with a clear reason when the target does not expose the dev panel. */
export async function expectDevPanel(page) {
  await toggle(page).waitFor({ state: 'attached', timeout: 15000 }).catch(() => {})
  assert.equal(await toggle(page).count(), 1, 'Le panneau Dev est absent. Lance le site en local (nuxi dev) ou active NUXT_PUBLIC_MACOMISYON_DEV_TOOLS=true.')
}

/**
 * Runs one dev action, e.g. `memebank:visit` or `bank-scenarios:beta`, `times` times.
 * The panel is closed afterwards so the product UI is checked as visitors see it.
 */
export async function devAction(page, id, times = 1) {
  await expectDevPanel(page)
  if (await toggle(page).getAttribute('aria-expanded') !== 'true') await toggle(page).click()
  const action = page.locator(`[data-dev-action="${id}"]`)
  for (let index = 0; index < times; index++) {
    await action.waitFor()
    assert.equal(await action.isDisabled(), false, `L’action Dev ${id} est désactivée`)
    await action.click()
  }
  if (await toggle(page).count() && await toggle(page).getAttribute('aria-expanded') === 'true') await toggle(page).click()
}

/** Whether a dev action is currently disabled, read from the open panel. */
export async function devActionDisabled(page, id) {
  await expectDevPanel(page)
  const wasOpen = await toggle(page).getAttribute('aria-expanded') === 'true'
  if (!wasOpen) await toggle(page).click()
  const disabled = await page.locator(`[data-dev-action="${id}"]`).isDisabled()
  if (!wasOpen) await toggle(page).click()
  return disabled
}

/** The visible product UI must never offer a simulation. */
export async function expectNoSimulationInProduct(page, scope = 'main') {
  const offers = await page.locator(scope).getByRole('button', { name: /simul/i }).count()
  assert.equal(offers, 0, 'Un bouton de simulation est visible dans l’interface réelle')
  const strip = await page.locator('.depot-demo-strip, .depot-simulation').count()
  assert.equal(strip, 0, 'Le bandeau « Démo locale » est encore affiché')
}

/**
 * Some checks read component state through Vue's development handles, which a
 * production build (DEV included) strips. Fail with the reason instead of a misleading assertion.
 */
export async function expectVueInspection(page, selector) {
  await page.locator(selector).first().waitFor()
  const available = await page.locator(selector).first().evaluate(element => !!element.__vueParentComponent)
  assert.equal(available, true, 'Ce script lit l’état interne de Vue : lance-le contre `nuxi dev` (build de développement), pas contre DEV ou la production.')
}
