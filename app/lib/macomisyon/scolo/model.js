// « Trop de scolos », acte I. A weapon is validated by a real kill with it, and that
// kill releases its mini-game. Weapons can be validated in any order.
// Until the Scolo API feeds this store, progress is local to the device and only
// the development panel changes it.
export const weapons = Object.freeze([
  Object.freeze({ id: 'sandale', label: 'Sandale', with: 'à la Sandale', room: 'Le salon' }),
  Object.freeze({ id: 'coutelas', label: 'Coutelas', with: 'au Coutelas', room: 'La cuisine' }),
  Object.freeze({ id: 'digrain', label: 'Digrain', with: 'au Digrain', room: 'La galerie' }),
]);

const storageKey = id => `macomisyon-scolo-v2:${id}`;
const ids = new Set(weapons.map(weapon => weapon.id));

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function createScoloStore({ storage = browserStorage() } = {}) {
  const used = new Set();
  function restore() {
    try {
      for (const weapon of weapons) if (storage?.getItem(storageKey(weapon.id)) === '1') used.add(weapon.id);
    } catch { /* Local progress also works when storage is unavailable. */ }
  }
  function persist() {
    try {
      for (const weapon of weapons) {
        if (used.has(weapon.id)) storage?.setItem(storageKey(weapon.id), '1');
        else storage?.removeItem?.(storageKey(weapon.id));
      }
    } catch { /* Keep the state in memory. */ }
  }
  function snapshot() {
    const completed = weapons.filter(weapon => used.has(weapon.id)).map(weapon => weapon.id);
    return { completed, ready: completed.length === weapons.length };
  }
  return {
    getState() { restore(); return snapshot(); },
    /** Records a real kill with this weapon. Repeated kills change nothing. */
    validate(id) {
      restore();
      if (!ids.has(id)) return snapshot();
      used.add(id);
      persist();
      return snapshot();
    },
    // Development tools only: forget every validated weapon on this device.
    reset() {
      used.clear();
      persist();
      return snapshot();
    },
  };
}
