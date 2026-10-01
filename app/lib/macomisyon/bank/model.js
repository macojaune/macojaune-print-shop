// Memebank — Le casse du sérieux. Local demo only: no backend or Zikak rewards.
export const BANK_STORAGE_KEY = 'macomisyon-bank-demo-v1';
export const BANK_GOALS = Object.freeze({ curiosity: 10, newsletter: 8, applications: 5 });

export const bankMissions = Object.freeze([
  Object.freeze({
    id: 'curiosity',
    title: 'Le casse du sérieux',
    label: 'Visites attribuées',
    goal: BANK_GOALS.curiosity,
    description: 'Dix visites attribuées au teaser ouvrent le hall dans cette démo. Ce ne sont pas dix personnes uniques identifiées.',
    success: 'La façade du sérieux tombe. La newsletter et les candidatures se dévoilent.',
  }),
  Object.freeze({
    id: 'newsletter',
    title: 'Le guichet déborde',
    label: 'Inscriptions newsletter',
    goal: BANK_GOALS.newsletter,
    description: 'Recevoir les nouvelles du casse, sans ouvrir de compte ni candidater à la bêta.',
    success: 'Le réseau des curieux est branché. Aucune admission ne part automatiquement.',
  }),
  Object.freeze({
    id: 'applications',
    title: 'Les dossiers s’emballent',
    label: 'Formulaires reçus',
    goal: BANK_GOALS.applications,
    description: 'Se porter volontaire pour la bêta. Chaque candidature attend sa qualification puis son invitation.',
    success: 'Le vivier de candidatures est constitué. Les invitations et l’ouverture de la bêta restent explicites.',
  }),
]);

const missionIds = bankMissions.map(mission => mission.id);
const countIds = [...missionIds, 'qualified', 'admitted'];

function initialState() {
  return {
    version: 1,
    counts: { curiosity: 0, newsletter: 0, applications: 0, qualified: 0, admitted: 0 },
    completed: [],
    betaOpen: false,
  };
}

function copyState(state) {
  return { ...state, counts: { ...state.counts }, completed: [...state.completed] };
}

function resolve(state) {
  const discovered = state.counts.curiosity >= BANK_GOALS.curiosity;
  // Secondary counters accumulate independently, even while their missions are hidden.
  state.completed = discovered
    ? missionIds.filter(id => state.counts[id] >= BANK_GOALS[id])
    : [];
  // Resolution may close an invalid flag, but never opens the beta automatically.
  state.betaOpen = state.betaOpen === true && discovered && state.counts.admitted > 0;
  return state;
}

function restore(value) {
  const next = initialState();
  if (value?.version !== 1 || !value.counts || typeof value.counts !== 'object' || Array.isArray(value.counts)) return next;

  for (const id of countIds) {
    const count = value.counts[id];
    // Only actual, nonnegative integer counts are accepted; unrelated fields are discarded.
    if (Number.isSafeInteger(count) && count >= 0) next.counts[id] = count === 0 ? 0 : count;
  }
  next.counts.qualified = Math.min(next.counts.qualified, next.counts.applications);
  next.counts.admitted = Math.min(next.counts.admitted, next.counts.qualified);
  next.betaOpen = value.betaOpen === true;
  return resolve(next);
}

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function createBankStore({ storage = browserStorage() } = {}) {
  let state = initialState();
  const listeners = new Set();
  try {
    const saved = storage?.getItem(BANK_STORAGE_KEY);
    if (saved) state = restore(JSON.parse(saved));
  } catch { /* Private browsing or corrupted data must not prevent the local demo. */ }

  const getState = () => copyState(state);

  function commit(next) {
    state = resolve(next);
    try { storage?.setItem(BANK_STORAGE_KEY, JSON.stringify(state)); } catch { /* Keep playing in memory. */ }
    listeners.forEach(listener => listener(getState()));
    return getState();
  }

  return {
    getState,
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    contribute(id) {
      if (!missionIds.includes(id) || state.counts[id] === Number.MAX_SAFE_INTEGER) return getState();
      const next = getState();
      next.counts[id] += 1;
      return commit(next);
    },
    qualify() {
      if (state.counts.qualified >= state.counts.applications) return getState();
      const next = getState();
      next.counts.qualified += 1;
      return commit(next);
    },
    invite() {
      if (state.counts.admitted >= state.counts.qualified) return getState();
      const next = getState();
      next.counts.admitted += 1;
      return commit(next);
    },
    openBeta() {
      if (state.betaOpen || !state.completed.includes('curiosity') || state.counts.admitted === 0) return getState();
      const next = getState();
      next.betaOpen = true;
      return commit(next);
    },
    loadScenario(id) {
      const next = initialState();
      switch (id) {
        case 'new': break;
        case 'discovered': next.counts.curiosity = BANK_GOALS.curiosity; break;
        case 'ready':
        case 'beta':
          Object.assign(next.counts, BANK_GOALS, { qualified: 3, admitted: id === 'beta' ? 3 : 0 });
          next.betaOpen = id === 'beta';
          break;
        case 'beyond':
          Object.assign(next.counts, { curiosity: 10, newsletter: 32, applications: 20, qualified: 5, admitted: 3 });
          next.betaOpen = true;
          break;
        default: return getState();
      }
      return commit(next);
    },
  };
}
