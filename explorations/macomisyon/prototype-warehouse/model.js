// All counters and contributions belong to this local, simulated demonstration.
export const STORAGE_KEY = 'macomisyon-warehouse-v3';

export const project = Object.freeze({
  name: 'QuiLivreOù',
  tagline: 'Les bonnes boutiques, jusqu’à chez nous.',
  description: 'Un annuaire pour trouver les sites qui livrent vers les Antilles et la Guyane. On y découvre les boutiques et leurs destinations de livraison.',
  site: 'https://quilivreou.marvinl.com',
  image: 'assets/quilivreou-ui.png',
  video: null,
});

export const missions = Object.freeze([
  Object.freeze({
    id: 'inscrits', title: 'Les 10 premiers inscrits', short: 'Inscriptions',
    description: 'Dans cette démo, réunir dix personnes autour de l’annuaire. Le compteur commence à sept inscriptions fictives.',
    goal: 10, unit: 'inscriptions', start: 7, requires: null, role: 'main',
    effect: 'L’alimentation du Fenwick est rétablie. La collecte des retours devient accessible.',
    action: 'Simuler une inscription',
  }),
  Object.freeze({
    id: 'retours', title: '3 retours pour avancer', short: 'Retours',
    description: 'Simuler trois retours sur la recherche de boutiques et les informations de livraison. Aucun avis n’est envoyé.',
    goal: 3, unit: 'retours', start: 0, requires: 'inscrits', role: 'main',
    effect: 'Le système hydraulique reprend vie. La mission des boutiques s’ouvre.',
    action: 'Simuler un retour',
  }),
  Object.freeze({
    id: 'boutiques', title: '5 boutiques à repérer', short: 'Boutiques',
    description: 'Simuler cinq propositions de boutiques pour enrichir l’annuaire. Aucune boutique réelle n’est ajoutée.',
    goal: 5, unit: 'boutiques', start: 0, requires: 'retours', role: 'main',
    effect: 'Les fourches soulèvent la palette. Le chariot est réparé et le dépôt s’illumine.',
    action: 'Simuler une boutique',
  }),
  Object.freeze({
    id: 'bonus', title: '3 idées de destinations', short: 'Destinations',
    description: 'Imaginer trois destinations à mieux documenter dans l’annuaire. Cette mission bonus est ouverte dès le départ.',
    goal: 3, unit: 'idées', start: 0, requires: null, role: 'bonus',
    effect: 'Des étiquettes de destinations colorent le dépôt. Ce bonus est indépendant de la réparation.',
    action: 'Simuler une idée',
  }),
]);

const missionById = new Map(missions.map(mission => [mission.id, mission]));
const mainMissions = missions.filter(mission => mission.role === 'main');
const clone = value => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isEventId = value => typeof value === 'string' && value.trim().length > 0;

function initialState() {
  return {
    schema: 1,
    counts: Object.fromEntries(missions.map(mission => [mission.id, mission.start])),
    completed: [],
    repaired: false,
    seenEvents: [],
    updatedAt: now(),
  };
}

function rememberReachedGoals(state) {
  const completed = new Set(state.completed);
  // Missions are declared in dependency order. Existing accomplishments are
  // retained even when a later configuration raises an objective.
  for (const mission of missions) {
    if (state.counts[mission.id] >= mission.goal && (!mission.requires || completed.has(mission.requires))) {
      completed.add(mission.id);
    }
  }
  state.completed = missions.filter(mission => completed.has(mission.id)).map(mission => mission.id);
  state.repaired = state.repaired || mainMissions.every(mission => completed.has(mission.id));
  return state;
}

function restoreState(value) {
  const restored = initialState();
  if (!isRecord(value) || value.schema !== 1 || !isRecord(value.counts)) return restored;

  for (const mission of missions) {
    const count = value.counts[mission.id];
    // Keep genuine counts above an objective; presentation may clamp a gauge.
    if (Number.isSafeInteger(count) && count >= 0) restored.counts[mission.id] = count;
  }
  if (Array.isArray(value.completed)) {
    restored.completed = [...new Set(value.completed.filter(id => missionById.has(id)))];
  }
  if (Array.isArray(value.seenEvents)) {
    restored.seenEvents = [...new Set(value.seenEvents.filter(isEventId))];
  }
  restored.repaired = value.repaired === true;
  if (typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))) {
    restored.updatedAt = value.updatedAt;
  }
  return rememberReachedGoals(restored);
}

export function statusFor(id, state) {
  const mission = missionById.get(id);
  if (!mission) return 'blocked';
  if (state.completed.includes(id)) return 'completed';
  return !mission.requires || state.completed.includes(mission.requires) ? 'open' : 'blocked';
}

export function completedMainCount(state) {
  return mainMissions.filter(mission => state.completed.includes(mission.id)).length;
}

export function deriveWorldState(state, selected = null) {
  return { completed: [...state.completed], repaired: state.repaired, selected };
}

function browserStorage() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage ?? null; } catch { return null; }
}

export function createStore({ storage = browserStorage() } = {}) {
  let state = initialState();
  let persistence = false;
  const listeners = new Set();

  try {
    if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function') {
      const saved = storage.getItem(STORAGE_KEY);
      persistence = true;
      if (saved !== null && saved !== undefined) {
        try { state = restoreState(JSON.parse(saved)); } catch { /* Start safely if a saved value is corrupt. */ }
      }
    }
  } catch { persistence = false; }

  const getState = () => clone(state);
  const result = (ok, reason = null) => ({ ok, reason, state: getState() });

  function commit(next) {
    state = rememberReachedGoals(next);
    state.updatedAt = now();
    if (persistence) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { persistence = false; }
    }
    for (const listener of listeners) listener(getState());
    return result(true);
  }

  function contribute(id, eventId) {
    if (!missionById.has(id)) return result(false, 'invalid-mission');
    if (!isEventId(eventId)) return result(false, 'invalid-event');
    if (state.seenEvents.includes(eventId)) return result(false, 'duplicate');
    const status = statusFor(id, state);
    if (status !== 'open') return result(false, status);
    const next = getState();
    next.counts[id] += 1;
    next.seenEvents.push(eventId);
    return commit(next);
  }

  function preset(name) {
    const next = initialState();
    switch (name) {
      case 'start': break;
      case 'progress': next.counts.inscrits = 10; next.counts.retours = 1; break;
      case 'repaired': next.counts.inscrits = 10; next.counts.retours = 3; next.counts.boutiques = 5; break;
      case 'bonus': next.counts.bonus = 3; break;
      default: return result(false, 'unknown-preset');
    }
    // Presets explicitly replace the demo, including its repair latch and events.
    return commit(next);
  }

  return {
    getState,
    get persistence() { return persistence; },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('A subscriber must be a function.');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    contribute,
    preset,
    reset: () => preset('start'),
  };
}
