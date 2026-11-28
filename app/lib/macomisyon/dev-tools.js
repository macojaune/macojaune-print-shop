// Development-only simulation controls. The page and each interior declare
// what can be simulated where the visitor stands; the dev panel renders them
// outside the product UI, so the real layout stays identical to production.
import { reactive } from 'vue'

/**
 * @typedef {{ id: string, label: string, run: () => unknown, disabled?: boolean, tone?: 'reset' }} DevAction
 * @typedef {{ id: string, title: string, context: 'map' | 'interior' | 'global', focus?: boolean, status?: string, note?: string, actions: DevAction[] }} DevSection
 */

const sources = reactive(new Map())

/**
 * Registers a reactive getter of dev sections. Returns its unregister function.
 * @param {string} key
 * @param {() => DevSection | DevSection[] | null | undefined} getter
 */
export function registerDevSections(key, getter) {
  sources.set(key, getter)
  return () => { if (sources.get(key) === getter) sources.delete(key) }
}

/** Sections for the current context: an open interior hides the map controls. */
export function devSections() {
  const all = [...sources.values()].flatMap(getter => [].concat(getter() || []))
  const inInterior = all.some(section => section.context === 'interior')
  const visible = all.filter(section => section.context === 'global' || section.context === (inInterior ? 'interior' : 'map'))
  const rank = section => section.context === 'global' ? 2 : section.focus ? 0 : 1
  return visible.sort((a, b) => rank(a) - rank(b))
}

/** Accepts the boolean or string forms a runtime environment variable can take. */
export function devToolsFlag(value) {
  return value === true || value === 'true' || value === '1'
}
