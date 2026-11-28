export const missions = Object.freeze([
  Object.freeze({ id: 'sandale', label: 'Sandale', stage: 1, effect: 'Le carton de vaisselle est fermé.' }),
  Object.freeze({ id: 'coutelas', label: 'Coutelas', stage: 2, effect: 'Les cartons de la cuisine sont dans le camion.' }),
  Object.freeze({ id: 'digrain', label: 'Digrain', stage: 3, effect: 'Le camion part pour la nouvelle maison.' }),
]);

const storageKey = id => `macomisyon-scolo-demo-v1:${id}`;

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function createScoloStore({ storage = browserStorage() } = {}) {
  let completedCount = 0;
  // One key per finished game keeps an older tab from overwriting a later stage.
  function restore() {
    try {
      while (completedCount < missions.length && storage?.getItem(storageKey(missions[completedCount].id)) === '1') {
        completedCount++;
      }
    } catch { /* Local progress also works when storage is unavailable. */ }
  }

  function snapshot() {
    return { completed: missions.slice(0, completedCount).map(mission => mission.id), moved: completedCount === missions.length };
  }

  return {
    getState() {
      restore();
      return snapshot();
    },
    contribute(id) {
      restore();
      const next = missions[completedCount];
      if (!next || next.id !== id) return snapshot();
      completedCount++;
      try {
        // Retry earlier writes if storage was temporarily full or inaccessible.
        for (const mission of missions.slice(0, completedCount)) storage?.setItem(storageKey(mission.id), '1');
      } catch { /* Keep the completed games in memory. */ }
      return snapshot();
    },
    // Development tools only: forget every finished game on this device.
    reset() {
      completedCount = 0;
      try { for (const mission of missions) storage?.removeItem(storageKey(mission.id)); } catch { /* Memory is reset anyway. */ }
      return snapshot();
    },
  };
}
