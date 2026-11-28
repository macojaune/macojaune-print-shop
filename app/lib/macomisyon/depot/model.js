// This local demonstration never writes to QuiLivreOù or awards real Zikak.
export const STORAGE_KEY = 'macomisyon-nuxt-depot-demo-v1';

export const missions = Object.freeze([
  Object.freeze({
    id: 'inscrits', code: '01', title: 'Les premiers inscrits', short: 'Inscriptions', icon: 'people',
    description: 'Des personnes rejoignent QuiLivreOù pour partager leurs expériences de livraison.',
    goal: 10, unit: 'inscriptions', requires: null, role: 'main',
    effect: 'Les postes de travail se rallument. Le dépôt retrouve son équipe.',
    action: 'Simuler une inscription', hint: 'Le dépôt attend son équipe.',
  }),
  Object.freeze({
    id: 'boutiques', code: '02', title: 'De nouvelles boutiques', short: 'Boutiques', icon: 'crate',
    description: 'Ajouter un site e-commerce absent du catalogue avec sa première expérience personnelle. La base existante ne compte pas.',
    goal: 5, unit: 'nouveaux sites', requires: null, role: 'main',
    effect: 'Le quai se prépare. De nouvelles adresses rejoignent le catalogue.',
    action: 'Simuler un nouveau site', hint: 'De nouvelles adresses sont attendues au quai.',
  }),
  Object.freeze({
    id: 'retours', code: '03', title: 'De nouveaux avis', short: 'Avis', icon: 'chat',
    description: 'Raconter une commande sur un site déjà présent. Le premier avis joint à un nouveau site est compté avec ce site, jamais une deuxième fois ici.',
    goal: 5, unit: 'nouveaux avis', requires: 'boutiques', role: 'main',
    effect: 'Les colis sont triés et rassemblés. Chaque expérience précise ce qui arrive vraiment à destination.',
    action: 'Simuler un nouvel avis', hint: 'Les colis attendent des nouvelles de leur voyage. Le quai doit être prêt pour valider cette étape.',
  }),
  Object.freeze({
    id: 'bonus', code: '+', title: 'Le coin de la honte', short: 'Bonus', icon: 'flag',
    description: 'Une piste bonus autour des sites qui ne livrent pas encore chez nous. Son objectif définitif reste à choisir.',
    goal: 3, unit: 'signalements', requires: null, role: 'bonus',
    effect: 'Des étiquettes de destinations apparaissent. Ce bonus ne conditionne jamais la réparation.',
    action: 'Simuler un signalement', hint: '',
  }),
]);

const byId = new Map(missions.map(mission => [mission.id, mission]));
const mainMissions = missions.filter(mission => mission.role === 'main');
const clone = value => JSON.parse(JSON.stringify(value));

export function initialState() {
  return { schema: 1, counts: { inscrits: 2, boutiques: 0, retours: 0, bonus: 0 }, completed: [], repaired: false, seenEvents: [] };
}

function resolve(state) {
  const completed = new Set();
  let previousSize;
  do {
    previousSize = completed.size;
    for (const mission of missions) {
      if (state.counts[mission.id] >= mission.goal && (!mission.requires || completed.has(mission.requires))) completed.add(mission.id);
    }
  } while (previousSize !== completed.size);
  state.completed = missions.filter(mission => completed.has(mission.id)).map(mission => mission.id);
  state.repaired = mainMissions.every(mission => completed.has(mission.id));
  return state;
}

export function statusFor(id, state) {
  const mission = byId.get(id);
  if (!mission) return 'blocked';
  if (state.completed.includes(id)) return 'completed';
  return !mission.requires || state.completed.includes(mission.requires) ? 'open' : 'blocked';
}

export const completedMainCount = state => mainMissions.filter(mission => state.completed.includes(mission.id)).length;

export function deriveWorldState(state, selected = null) {
  return { ...clone(state), selected, statuses: Object.fromEntries(missions.map(mission => [mission.id, statusFor(mission.id, state)])) };
}

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

function restore(value) {
  const next = initialState();
  if (value?.schema !== 1 || !value.counts || typeof value.counts !== 'object') return next;
  for (const mission of missions) {
    const count = value.counts[mission.id];
    if (Number.isSafeInteger(count) && count >= 0) next.counts[mission.id] = count;
  }
  if (Array.isArray(value.seenEvents)) next.seenEvents = [...new Set(value.seenEvents.filter(id => typeof id === 'string' && id.trim()))];
  return resolve(next);
}

export function createStore({ storage = browserStorage() } = {}) {
  let state = initialState();
  let persistence = !!storage;
  const listeners = new Set();
  try { const saved = storage?.getItem(STORAGE_KEY); if (saved) state = restore(JSON.parse(saved)); } catch { persistence = false; }
  const getState = () => clone(state);
  const result = (ok, reason = null) => ({ ok, reason, state: getState() });
  function commit(next) {
    state = resolve(next);
    if (persistence) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { persistence = false; }
    }
    listeners.forEach(listener => listener(getState()));
    return result(true);
  }
  return {
    getState,
    get persistence() { return persistence; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    contribute(id, eventId) {
      if (!byId.has(id)) return result(false, 'invalid-mission');
      if (typeof eventId !== 'string' || !eventId.trim()) return result(false, 'invalid-event');
      if (state.seenEvents.includes(eventId)) return result(false, 'duplicate');
      if (state.counts[id] === Number.MAX_SAFE_INTEGER) return result(false, 'limit');
      const next = getState();
      next.counts[id] += 1;
      next.seenEvents.push(eventId);
      return commit(next);
    },
    preset(name) {
      const next = initialState();
      switch (name) {
        case 'start': break;
        case 'progress': Object.assign(next.counts, { inscrits: 10, boutiques: 3, retours: 2 }); break;
        case 'ahead': Object.assign(next.counts, { inscrits: 4, boutiques: 2, retours: 5 }); break;
        case 'repaired': Object.assign(next.counts, { inscrits: 10, boutiques: 5, retours: 5 }); break;
        case 'beyond': Object.assign(next.counts, { inscrits: 18, boutiques: 12, retours: 8, bonus: 3 }); break;
        default: return result(false, 'unknown-preset');
      }
      return commit(next);
    },
  };
}
