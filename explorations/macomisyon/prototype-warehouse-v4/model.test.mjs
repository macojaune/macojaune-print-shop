import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, missions, project, STORAGE_KEY, statusFor, completedMainCount, progressFor, deriveWorldState } from './model.js';

function memoryStorage(value) {
  const values = new Map(value === undefined ? [] : [[STORAGE_KEY, value]]);
  return {
    writes: 0,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, next) { this.writes += 1; values.set(key, next); },
  };
}

function contributeTimes(store, id, count) {
  for (let index = 0; index < count; index += 1) {
    assert.equal(store.contribute(id, `${id}-${index}`).ok, true);
  }
}

test('the project describes an actual directory while mission data describes a simulation', () => {
  assert.match(project.description, /annuaire/);
  assert.equal(project.site, 'https://quilivreou.marvinl.com');
  assert.equal(project.image, 'assets/quilivreou-ui.png');
  assert.equal(project.video, null);
  assert.equal(missions.filter(mission => mission.role === 'main').length, 3);
  assert.ok(missions.every(mission => mission.action.startsWith('Simuler')));
});

test('new state opens inscriptions and the bonus, with two missions behind inscriptions', () => {
  const state = createStore({ storage: null }).getState();
  assert.equal(state.schema, 1);
  assert.deepEqual(state.counts, { inscrits: 2, retours: 0, boutiques: 0, bonus: 0 });
  assert.deepEqual(missions.map(mission => statusFor(mission.id, state)), ['open', 'blocked', 'blocked', 'open']);
  assert.equal(completedMainCount(state), 0);
  assert.equal(state.repaired, false);
});

test('blocked contributions accumulate and persist without completing or changing the world', () => {
  const storage = memoryStorage();
  const store = createStore({ storage });
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  assert.equal(store.contribute('retours', 'early-return').ok, true);
  assert.equal(store.getState().counts.retours, 1);
  assert.equal(statusFor('retours', store.getState()), 'blocked');
  assert.deepEqual(deriveWorldState(store.getState()).completed, []);
  assert.equal(deriveWorldState(store.getState()).repaired, false);
  assert.equal(storage.writes, 1);
  assert.equal(notifications, 1);
  assert.equal(store.contribute('retours', 'early-return').reason, 'duplicate');
  assert.equal(createStore({ storage }).getState().counts.retours, 1);
  contributeTimes(store, 'inscrits', 8);
  assert.equal(statusFor('retours', store.getState()), 'open');
  assert.equal(statusFor('boutiques', store.getState()), 'open');
});

test('five early recommendations wait at 2 inscriptions and automatically complete at 10', () => {
  const storage = memoryStorage();
  let store = createStore({ storage });
  contributeTimes(store, 'retours', 5);
  assert.deepEqual(progressFor('retours', store.getState()), { count: 5, goal: 5, ready: true, waiting: true });
  assert.deepEqual(store.getState().completed, []);
  assert.equal(statusFor('retours', store.getState()), 'blocked');
  store = createStore({ storage });
  assert.equal(progressFor('retours', store.getState()).waiting, true);
  contributeTimes(store, 'inscrits', 7);
  assert.deepEqual(store.getState().completed, []);
  assert.equal(store.getState().counts.inscrits, 9);
  assert.equal(store.contribute('inscrits', 'tenth-inscription').ok, true);
  assert.deepEqual(store.getState().completed, ['inscrits', 'retours']);
  assert.deepEqual(progressFor('retours', store.getState()), { count: 5, goal: 5, ready: true, waiting: false });
  assert.equal(statusFor('boutiques', store.getState()), 'open');
  assert.equal(store.getState().repaired, false);
});

test('parallel missions can finish in either order, including a cascade from early counts', () => {
  const store = createStore({ storage: null });
  contributeTimes(store, 'inscrits', 8);
  assert.equal(statusFor('retours', store.getState()), 'open');
  assert.equal(statusFor('boutiques', store.getState()), 'open');
  contributeTimes(store, 'boutiques', 5);
  assert.deepEqual(store.getState().completed, ['inscrits', 'boutiques']);
  assert.equal(statusFor('retours', store.getState()), 'open');
  assert.equal(store.getState().repaired, false);
  contributeTimes(store, 'retours', 5);
  assert.equal(store.getState().repaired, true);

  const ahead = createStore({ storage: null });
  contributeTimes(ahead, 'retours', 6);
  contributeTimes(ahead, 'boutiques', 5);
  assert.equal(ahead.getState().counts.retours, 6);
  assert.deepEqual(ahead.getState().completed, []);
  assert.equal(ahead.getState().repaired, false);
  contributeTimes(ahead, 'inscrits', 8);
  assert.deepEqual(ahead.getState().completed, ['inscrits', 'retours', 'boutiques']);
  assert.equal(ahead.getState().counts.retours, 6);
  assert.equal(ahead.getState().repaired, true);
});

test('a contribution event is idempotent globally, including after reload', () => {
  const storage = memoryStorage();
  const store = createStore({ storage });
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  assert.equal(store.contribute('inscrits', 'one-event').ok, true);
  assert.equal(store.contribute('inscrits', 'one-event').reason, 'duplicate');
  assert.equal(store.contribute('bonus', 'one-event').reason, 'duplicate');
  assert.equal(store.getState().counts.inscrits, 3);
  assert.equal(store.getState().counts.bonus, 0);
  assert.equal(notifications, 1);
  assert.equal(storage.writes, 1);
  const reloaded = createStore({ storage });
  assert.equal(reloaded.contribute('inscrits', 'one-event').reason, 'duplicate');
  assert.equal(storage.writes, 1);
});

test('only all three main missions repair the vehicle', () => {
  const store = createStore({ storage: null });
  contributeTimes(store, 'bonus', 3);
  assert.equal(statusFor('bonus', store.getState()), 'completed');
  assert.equal(completedMainCount(store.getState()), 0);
  assert.equal(store.getState().repaired, false);
  contributeTimes(store, 'inscrits', 8);
  assert.equal(completedMainCount(store.getState()), 1);
  assert.equal(store.getState().repaired, false);
  contributeTimes(store, 'retours', 5);
  assert.equal(completedMainCount(store.getState()), 2);
  assert.equal(statusFor('boutiques', store.getState()), 'open');
  assert.equal(store.getState().repaired, false);
  contributeTimes(store, 'boutiques', 5);
  assert.equal(completedMainCount(store.getState()), 3);
  assert.equal(store.getState().repaired, true);
});

test('completed missions ignore further clicks and complete only once', () => {
  const store = createStore({ storage: null });
  contributeTimes(store, 'inscrits', 8);
  const before = store.getState();
  assert.equal(store.contribute('inscrits', 'another-real-click').reason, 'completed');
  assert.deepEqual(store.getState(), before);
  assert.deepEqual(before.completed, ['inscrits']);
});

test('restoration keeps raw counts above the target and silently derives completion', () => {
  const saved = createStore({ storage: null }).getState();
  saved.counts = { inscrits: 19, retours: 6, boutiques: 11, bonus: 0 };
  saved.seenEvents = ['an-earlier-event'];
  const storage = memoryStorage(JSON.stringify(saved));
  const store = createStore({ storage });
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  assert.deepEqual(store.getState().counts, saved.counts);
  assert.deepEqual(store.getState().completed, ['inscrits', 'retours', 'boutiques']);
  assert.equal(store.getState().repaired, true);
  assert.deepEqual(store.getState().seenEvents, ['an-earlier-event']);
  assert.equal(notifications, 0);
  assert.equal(storage.writes, 0);
  assert.equal(store.contribute('inscrits', 'over-target').reason, 'completed');
  assert.equal(store.getState().counts.inscrits, 19);
});

test('restored future progress respects dependencies until its prerequisite opens', () => {
  const saved = createStore({ storage: null }).getState();
  saved.counts.retours = 6;
  const store = createStore({ storage: memoryStorage(JSON.stringify(saved)) });
  assert.equal(statusFor('retours', store.getState()), 'blocked');
  contributeTimes(store, 'inscrits', 8);
  assert.equal(statusFor('retours', store.getState()), 'completed');
  assert.equal(store.getState().counts.retours, 6);
  assert.equal(statusFor('boutiques', store.getState()), 'open');
});

test('saved accomplishments and repaired latch survive a raised objective', () => {
  const saved = createStore({ storage: null }).getState();
  saved.completed = ['inscrits', 'retours', 'boutiques'];
  saved.counts = { inscrits: 8, retours: 1, boutiques: 2, bonus: 0 };
  saved.repaired = true;
  const storage = memoryStorage(JSON.stringify(saved));
  const store = createStore({ storage });
  assert.equal(completedMainCount(store.getState()), 3);
  assert.equal(store.getState().repaired, true);
  assert.equal(store.contribute('bonus', 'later-bonus').ok, true);
  assert.equal(createStore({ storage }).getState().repaired, true);
  saved.completed = [];
  const legacyRepair = createStore({ storage: memoryStorage(JSON.stringify(saved)) });
  assert.equal(legacyRepair.getState().repaired, true);
});

test('presets deliberately replace progress, dedupe history and the repair latch', () => {
  const store = createStore({ storage: null });
  store.contribute('inscrits', 'before-preset');
  store.preset('progress');
  assert.deepEqual(store.getState().counts, { inscrits: 10, retours: 2, boutiques: 1, bonus: 0 });
  assert.deepEqual(store.getState().completed, ['inscrits']);
  assert.deepEqual(store.getState().seenEvents, []);
  store.preset('repaired');
  assert.deepEqual(store.getState().counts, { inscrits: 10, retours: 5, boutiques: 5, bonus: 0 });
  assert.equal(store.getState().repaired, true);
  store.preset('bonus');
  assert.deepEqual(store.getState().counts, { inscrits: 2, retours: 0, boutiques: 0, bonus: 3 });
  assert.deepEqual(store.getState().completed, ['bonus']);
  assert.equal(store.getState().repaired, false);
  store.preset('ahead');
  assert.deepEqual(store.getState().counts, { inscrits: 2, retours: 5, boutiques: 0, bonus: 0 });
  assert.deepEqual(store.getState().completed, []);
  assert.equal(progressFor('retours', store.getState()).waiting, true);
  assert.equal(store.getState().repaired, false);
  const before = store.getState();
  assert.equal(store.preset('unknown').reason, 'unknown-preset');
  assert.deepEqual(store.getState(), before);
  store.reset();
  assert.deepEqual(store.getState().counts, { inscrits: 2, retours: 0, boutiques: 0, bonus: 0 });
  assert.deepEqual(store.getState().completed, []);
});

test('state snapshots, mutation results and subscriber snapshots cannot change store state', () => {
  const store = createStore({ storage: null });
  const exposed = store.getState();
  exposed.counts.inscrits = 300;
  exposed.completed.push('boutiques');
  const calls = [];
  const unsubscribe = store.subscribe(state => {
    state.counts.inscrits = 500;
    state.completed.push('retours');
  });
  store.subscribe(state => calls.push(state));
  const result = store.contribute('inscrits', 'first');
  result.state.counts.inscrits = 900;
  assert.equal(store.getState().counts.inscrits, 3);
  assert.deepEqual(store.getState().completed, []);
  assert.equal(calls[0].counts.inscrits, 3);
  unsubscribe();
  store.contribute('inscrits', 'second');
  assert.equal(calls[1].counts.inscrits, 4);
});

test('invalid storage data recovers without accepting nonnumeric counts or prototype ids', () => {
  for (const value of ['{broken', 'null', '[]', '{"schema":2,"counts":{}}']) {
    const store = createStore({ storage: memoryStorage(value) });
    assert.equal(store.getState().counts.inscrits, 2);
    assert.deepEqual(store.getState().completed, []);
  }
  const value = JSON.stringify({
    schema: 1,
    counts: { inscrits: '10', retours: -1, boutiques: 1.25, bonus: 2, constructor: 99 },
    completed: ['__proto__', 'constructor', 'unknown'],
    seenEvents: ['valid', 'valid', 2, null, '  '],
    repaired: 'true', updatedAt: 'invalid',
  });
  const store = createStore({ storage: memoryStorage(value) });
  assert.deepEqual(store.getState().counts, { inscrits: 2, retours: 0, boutiques: 0, bonus: 2 });
  assert.deepEqual(store.getState().completed, []);
  assert.deepEqual(store.getState().seenEvents, ['valid']);
  assert.equal(store.getState().repaired, false);
  assert.ok(Number.isFinite(Date.parse(store.getState().updatedAt)));
  for (const id of ['__proto__', 'constructor', 'unknown', null]) {
    assert.equal(statusFor(id, store.getState()), 'blocked');
    assert.equal(store.contribute(id, 'invalid-id-event').reason, 'invalid-mission');
  }
  for (const event of [undefined, null, 4, '', '   ']) {
    assert.equal(store.contribute('inscrits', event).reason, 'invalid-event');
  }
  assert.equal(store.getState().counts.inscrits, 2);
});

test('storage denial and quota failure leave an operational session store', () => {
  const denied = createStore({ storage: {
    getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); },
  } });
  assert.equal(denied.persistence, false);
  assert.equal(denied.contribute('inscrits', 'session-1').ok, true);
  const quota = createStore({ storage: {
    getItem() { return null; }, setItem() { throw new Error('quota'); },
  } });
  assert.equal(quota.persistence, true);
  assert.equal(quota.contribute('inscrits', 'session-2').ok, true);
  assert.equal(quota.persistence, false);
  assert.equal(quota.getState().counts.inscrits, 3);
  assert.doesNotThrow(() => createStore());
});

test('world projection includes independent counts and statuses without exposing store values', () => {
  const store = createStore({ storage: null });
  store.preset('repaired');
  const state = store.getState();
  const world = deriveWorldState(state, 'boutiques');
  assert.deepEqual(world, {
    completed: ['inscrits', 'retours', 'boutiques'], repaired: true, selected: 'boutiques',
    counts: { inscrits: 10, retours: 5, boutiques: 5, bonus: 0 },
    statuses: { inscrits: 'completed', retours: 'completed', boutiques: 'completed', bonus: 'open' },
  });
  world.completed.push('bonus');
  world.counts.bonus = 30;
  world.statuses.bonus = 'completed';
  assert.equal(state.completed.includes('bonus'), false);
  assert.equal(state.counts.bonus, 0);
  assert.equal(statusFor('bonus', state), 'open');
  assert.equal(deriveWorldState(state).selected, null);
});

test('v4 persistence never reads or replaces the v3 demonstration', () => {
  const values = new Map([['macomisyon-warehouse-v3', '{"schema":1,"counts":{"inscrits":10}}']]);
  const originalV3 = values.get('macomisyon-warehouse-v3');
  const store = createStore({ storage: {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  } });
  assert.equal(STORAGE_KEY, 'macomisyon-warehouse-v4');
  assert.equal(store.getState().counts.inscrits, 2);
  store.contribute('inscrits', 'v4-first');
  assert.equal(values.get('macomisyon-warehouse-v3'), originalV3);
  assert.equal(JSON.parse(values.get(STORAGE_KEY)).counts.inscrits, 3);
});
