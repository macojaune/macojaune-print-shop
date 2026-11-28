import test from 'node:test';
import assert from 'node:assert/strict';
import { BANK_STORAGE_KEY, BANK_GOALS, bankMissions, createBankStore } from './model.js';

const missionIds = ['curiosity', 'newsletter', 'applications'];
const countIds = [...missionIds, 'qualified', 'admitted'];
const freshStore = () => createBankStore({ storage: null });
const emptyState = () => ({
  version: 1,
  counts: { curiosity: 0, newsletter: 0, applications: 0, qualified: 0, admitted: 0 },
  completed: [],
  betaOpen: false,
});

function memoryStorage(saved) {
  const records = new Map(saved === undefined ? [] : [[BANK_STORAGE_KEY, saved]]);
  const reads = [];
  const writes = [];
  return {
    records, reads, writes,
    getItem(key) { reads.push(key); return records.get(key) ?? null; },
    setItem(key, value) { writes.push({ key, value }); records.set(key, value); },
  };
}

function savedStore(value) {
  return createBankStore({ storage: memoryStorage(JSON.stringify(value)) });
}

function contribute(store, id, count) {
  for (let index = 0; index < count; index++) store.contribute(id);
}

function mockWindow(t, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
}

function corruptSnapshot(snapshot) {
  snapshot.version = 99;
  snapshot.counts.curiosity = -100;
  snapshot.counts.qualified = 999;
  snapshot.counts.zikak = 1000;
  snapshot.completed.push('invented');
  snapshot.betaOpen = !snapshot.betaOpen;
}

test('exports the stable storage key, goals and three immutable French missions', () => {
  assert.equal(BANK_STORAGE_KEY, 'macomisyon-bank-demo-v1');
  assert.deepEqual(BANK_GOALS, { curiosity: 10, newsletter: 8, applications: 5 });
  assert.deepEqual(bankMissions.map(mission => mission.id), missionIds);
  assert.ok(Object.isFrozen(BANK_GOALS));
  assert.ok(Object.isFrozen(bankMissions));
  for (const mission of bankMissions) {
    assert.deepEqual(Object.keys(mission).sort(), ['description', 'goal', 'id', 'label', 'success', 'title']);
    assert.equal(mission.goal, BANK_GOALS[mission.id]);
    assert.ok(Object.isFrozen(mission));
    for (const field of ['title', 'label', 'description', 'success']) {
      assert.equal(typeof mission[field], 'string');
      assert.ok(mission[field].trim().length > 0);
    }
  }
  assert.equal(bankMissions[0].title, 'Le casse du sérieux');
  assert.equal(bankMissions[1].title, 'Le guichet déborde');
  assert.equal(bankMissions[2].title, 'Les dossiers s’emballent');
  assert.throws(() => { BANK_GOALS.curiosity = 1; }, TypeError);
  assert.throws(() => { bankMissions[0].goal = 1; }, TypeError);
});

test('starts with exactly five zero counters and no rewards or automatic admissions', () => {
  assert.deepEqual(freshStore().getState(), emptyState());
});

for (const id of missionIds) {
  test('contribute increments only the ' + id + ' counter by one', () => {
    const store = freshStore();
    const expected = emptyState();
    expected.counts[id] = 1;
    assert.deepEqual(store.contribute(id), expected);
    assert.deepEqual(store.getState(), expected);
    expected.counts[id] = 2;
    assert.deepEqual(store.contribute(id), expected);
  });
}

test('contribute rejects non-mission and prototype-like identifiers without side effects', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  let updates = 0;
  store.subscribe(() => updates++);
  for (const id of ['qualified', 'admitted', 'betaOpen', 'completed', 'unknown', '__proto__', 'constructor', 'toString', '', null, undefined, 1, {}, ['curiosity']]) {
    assert.deepEqual(store.contribute(id), emptyState());
  }
  assert.equal(updates, 0);
  assert.equal(storage.writes.length, 0);
});

test('curiosity completes at exactly ten and reveals no unfinished secondary mission', () => {
  const store = freshStore();
  contribute(store, 'curiosity', 9);
  assert.deepEqual(store.getState().completed, []);
  const discovered = store.contribute('curiosity');
  assert.deepEqual(discovered.completed, ['curiosity']);
  assert.equal(discovered.counts.curiosity, 10);
  assert.equal(discovered.betaOpen, false);
});

test('secondary counters accumulate ahead of discovery and validate together only at discovery', () => {
  const store = freshStore();
  contribute(store, 'newsletter', 11);
  contribute(store, 'applications', 7);
  contribute(store, 'curiosity', 9);
  assert.deepEqual(store.getState().counts, { curiosity: 9, newsletter: 11, applications: 7, qualified: 0, admitted: 0 });
  assert.deepEqual(store.getState().completed, []);
  const discovered = store.contribute('curiosity');
  assert.deepEqual(discovered.completed, missionIds);
  assert.deepEqual(discovered.counts, { curiosity: 10, newsletter: 11, applications: 7, qualified: 0, admitted: 0 });
  assert.equal(discovered.betaOpen, false);
});

for (const id of ['newsletter', 'applications']) {
  test(id + ' completes independently without the other secondary mission', () => {
    const store = freshStore();
    store.loadScenario('discovered');
    contribute(store, id, BANK_GOALS[id] - 1);
    assert.deepEqual(store.getState().completed, ['curiosity']);
    const state = store.contribute(id);
    assert.deepEqual(state.completed, ['curiosity', id]);
    assert.equal(state.counts[id === 'newsletter' ? 'applications' : 'newsletter'], 0);
    assert.equal(state.counts.qualified, 0);
    assert.equal(state.counts.admitted, 0);
    assert.equal(state.betaOpen, false);
  });
}

test('completed missions keep all contributions above their goals', () => {
  const store = freshStore();
  contribute(store, 'curiosity', 17);
  contribute(store, 'newsletter', 12);
  contribute(store, 'applications', 9);
  assert.deepEqual(store.getState(), {
    version: 1,
    counts: { curiosity: 17, newsletter: 12, applications: 9, qualified: 0, admitted: 0 },
    completed: missionIds,
    betaOpen: false,
  });
});

test('overflow contributions keep notifying and persisting without duplicating completion or auto-opening beta', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  store.loadScenario('ready');
  const expectedCounts = { ...store.getState().counts };
  const updates = [];
  store.subscribe(snapshot => updates.push(snapshot));
  for (const id of missionIds) {
    for (let index = 0; index < 64; index++) {
      expectedCounts[id]++;
      const state = store.contribute(id);
      assert.deepEqual(state.counts, expectedCounts);
      assert.deepEqual(state.completed, missionIds);
      assert.equal(new Set(state.completed).size, missionIds.length);
      assert.equal(state.betaOpen, false);
    }
  }
  assert.equal(updates.length, missionIds.length * 64);
  assert.equal(storage.writes.length, 1 + updates.length);
  assert.deepEqual(updates.at(-1), store.getState());
  assert.deepEqual(JSON.parse(storage.records.get(BANK_STORAGE_KEY)), store.getState());
  assert.deepEqual(createBankStore({ storage }).getState(), store.getState());
});

test('overflowing mail and dossiers still require every qualification, invitation and beta opening', () => {
  const store = freshStore();
  contribute(store, 'curiosity', 10);
  contribute(store, 'newsletter', 32);
  contribute(store, 'applications', 20);
  assert.deepEqual(store.getState().counts, { curiosity: 10, newsletter: 32, applications: 20, qualified: 0, admitted: 0 });
  for (let qualified = 1; qualified <= 20; qualified++) {
    const state = store.qualify();
    assert.equal(state.counts.qualified, qualified);
    assert.equal(state.counts.admitted, 0);
    assert.equal(state.betaOpen, false);
  }
  for (let admitted = 1; admitted <= 20; admitted++) {
    const state = store.invite();
    assert.equal(state.counts.admitted, admitted);
    assert.equal(state.betaOpen, false);
  }
  const beforeOpening = store.getState();
  assert.deepEqual(store.qualify(), beforeOpening);
  assert.deepEqual(store.invite(), beforeOpening);
  assert.deepEqual(store.openBeta(), { ...beforeOpening, betaOpen: true });
});

test('beyond remains playable with detached snapshots and persistent over-goal totals', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  const initial = store.loadScenario('beyond');
  store.contribute('newsletter');
  store.contribute('applications');
  store.qualify();
  const advanced = store.invite();
  assert.deepEqual(advanced, {
    version: 1,
    counts: { curiosity: 10, newsletter: 33, applications: 21, qualified: 6, admitted: 4 },
    completed: missionIds,
    betaOpen: true,
  });
  assert.deepEqual(initial.counts, { curiosity: 10, newsletter: 32, applications: 20, qualified: 5, admitted: 3 });
  assert.deepEqual(initial.completed, missionIds);
  assert.notStrictEqual(initial.counts, advanced.counts);
  assert.notStrictEqual(initial.completed, advanced.completed);
  assert.deepEqual(createBankStore({ storage }).getState(), advanced);
  corruptSnapshot(initial);
  corruptSnapshot(advanced);
  assert.deepEqual(createBankStore({ storage }).getState(), store.getState());
});

test('qualification is explicit, increments one at a time and never exceeds applications', () => {
  const store = freshStore();
  assert.deepEqual(store.qualify(), emptyState());
  contribute(store, 'applications', 3);
  for (let qualified = 1; qualified <= 3; qualified++) {
    assert.deepEqual(store.qualify().counts, { curiosity: 0, newsletter: 0, applications: 3, qualified, admitted: 0 });
  }
  assert.equal(store.qualify().counts.qualified, 3);
  store.contribute('applications');
  assert.equal(store.qualify().counts.qualified, 4);
  assert.deepEqual(store.getState().completed, []);
});

test('invitation is explicit, increments one at a time and never exceeds qualified candidates', () => {
  const store = freshStore();
  assert.deepEqual(store.invite(), emptyState());
  contribute(store, 'applications', 3);
  assert.equal(store.invite().counts.admitted, 0);
  store.qualify();
  store.qualify();
  for (let admitted = 1; admitted <= 2; admitted++) {
    assert.deepEqual(store.invite().counts, { curiosity: 0, newsletter: 0, applications: 3, qualified: 2, admitted });
  }
  assert.equal(store.invite().counts.admitted, 2);
  store.qualify();
  assert.equal(store.invite().counts.admitted, 3);
  assert.equal(store.getState().betaOpen, false);
});

test('all quotas, qualifications and admissions together still do not auto-open beta', () => {
  const store = freshStore();
  for (const id of missionIds) contribute(store, id, BANK_GOALS[id]);
  for (let index = 0; index < 5; index++) { store.qualify(); store.invite(); }
  assert.deepEqual(store.getState().completed, missionIds);
  assert.equal(store.getState().counts.admitted, 5);
  assert.equal(store.getState().betaOpen, false);
  assert.equal(store.openBeta().betaOpen, true);
});

test('beta cannot open with discovery alone, qualifications alone or admissions before discovery', () => {
  const store = freshStore();
  assert.equal(store.openBeta().betaOpen, false);
  store.loadScenario('discovered');
  assert.equal(store.openBeta().betaOpen, false);
  store.loadScenario('ready');
  assert.equal(store.openBeta().betaOpen, false);
  store.loadScenario('new');
  store.contribute('applications');
  store.qualify();
  store.invite();
  contribute(store, 'curiosity', 9);
  assert.equal(store.openBeta().betaOpen, false);
});

test('one admitted candidate and discovery suffice without either secondary quota', () => {
  const store = freshStore();
  store.loadScenario('discovered');
  store.contribute('applications');
  store.qualify();
  store.invite();
  const before = store.getState();
  assert.deepEqual(before.completed, ['curiosity']);
  assert.equal(before.counts.newsletter, 0);
  assert.equal(before.counts.applications, 1);
  assert.equal(before.betaOpen, false);
  assert.deepEqual(store.openBeta(), { ...before, betaOpen: true });
});

test('a premature openBeta call is never queued for a later discovery or admission', () => {
  const store = freshStore();
  store.contribute('applications');
  store.qualify();
  store.invite();
  store.openBeta();
  contribute(store, 'curiosity', 10);
  assert.equal(store.getState().betaOpen, false);
  assert.equal(store.openBeta().betaOpen, true);
  store.loadScenario('ready');
  store.openBeta();
  assert.equal(store.invite().betaOpen, false);
  assert.equal(store.openBeta().betaOpen, true);
});

test('opening is idempotent and later contributions do not close an opened beta', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  store.loadScenario('ready');
  store.invite();
  const opened = store.openBeta();
  const writeCount = storage.writes.length;
  assert.deepEqual(store.openBeta(), opened);
  assert.equal(storage.writes.length, writeCount);
  for (const id of missionIds) assert.equal(store.contribute(id).betaOpen, true);
  assert.equal(store.qualify().betaOpen, true);
  assert.equal(store.invite().betaOpen, true);
});

const scenarios = [
  ['new', emptyState()],
  ['discovered', { version: 1, counts: { curiosity: 10, newsletter: 0, applications: 0, qualified: 0, admitted: 0 }, completed: ['curiosity'], betaOpen: false }],
  ['ready', { version: 1, counts: { curiosity: 10, newsletter: 8, applications: 5, qualified: 3, admitted: 0 }, completed: missionIds, betaOpen: false }],
  ['beta', { version: 1, counts: { curiosity: 10, newsletter: 8, applications: 5, qualified: 3, admitted: 3 }, completed: missionIds, betaOpen: true }],
  ['beyond', { version: 1, counts: { curiosity: 10, newsletter: 32, applications: 20, qualified: 5, admitted: 3 }, completed: missionIds, betaOpen: true }],
];

for (const [id, expected] of scenarios) {
  test('scenario ' + id + ' replaces prior progress, persists and notifies', () => {
    const storage = memoryStorage();
    const store = createBankStore({ storage });
    store.loadScenario('beta');
    for (const missionId of missionIds) contribute(store, missionId, 3);
    store.qualify();
    store.invite();
    const updates = [];
    store.subscribe(state => updates.push(state));
    assert.deepEqual(store.loadScenario(id), expected);
    assert.deepEqual(store.getState(), expected);
    assert.deepEqual(updates, [expected]);
    assert.deepEqual(JSON.parse(storage.records.get(BANK_STORAGE_KEY)), expected);
    assert.deepEqual(createBankStore({ storage }).getState(), expected);
  });
}

test('unknown scenarios preserve progress, do not notify and do not write storage', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  const before = store.loadScenario('beta');
  const writeCount = storage.writes.length;
  let updates = 0;
  store.subscribe(() => updates++);
  for (const id of ['unknown', 'constructor', '__proto__', '', null, undefined, 1, {}]) {
    assert.deepEqual(store.loadScenario(id), before);
  }
  assert.equal(updates, 0);
  assert.equal(storage.writes.length, writeCount);
});

test('subscribe observes each committed action and unsubscribe is safe to repeat', () => {
  const store = freshStore();
  const updates = [];
  const unsubscribe = store.subscribe(state => updates.push(state));
  assert.equal(typeof unsubscribe, 'function');
  assert.deepEqual(updates, []);
  store.loadScenario('ready');
  store.contribute('curiosity');
  store.qualify();
  store.invite();
  store.openBeta();
  assert.equal(updates.length, 5);
  assert.equal(updates[0].counts.curiosity, 10);
  assert.equal(updates[0].counts.qualified, 3);
  assert.equal(updates[0].counts.admitted, 0);
  assert.equal(updates[0].betaOpen, false);
  assert.deepEqual(updates[4], store.getState());
  unsubscribe();
  unsubscribe();
  store.contribute('curiosity');
  assert.equal(updates.length, 5);
});

test('blocked actions are true no-ops for subscribers and persistence', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  let updates = 0;
  store.subscribe(() => updates++);
  store.qualify();
  store.invite();
  store.openBeta();
  assert.equal(updates, 0);
  assert.equal(storage.writes.length, 0);
  store.loadScenario('beta');
  const writeCount = storage.writes.length;
  store.invite();
  store.openBeta();
  assert.equal(updates, 1);
  assert.equal(storage.writes.length, writeCount);
});

test('getState and every action return detached snapshots, including no-op actions', () => {
  const store = freshStore();
  const actions = [
    () => store.getState(),
    () => store.qualify(),
    () => store.invite(),
    () => store.openBeta(),
    () => store.contribute('unknown'),
    () => store.loadScenario('unknown'),
    () => store.contribute('applications'),
    () => store.qualify(),
    () => store.invite(),
    () => store.loadScenario('ready'),
    () => store.invite(),
    () => store.openBeta(),
    () => store.openBeta(),
    () => store.loadScenario('beyond'),
    () => store.contribute('newsletter'),
    () => store.contribute('applications'),
    () => store.qualify(),
    () => store.invite(),
  ];
  for (const action of actions) {
    const snapshot = action();
    const expected = store.getState();
    assert.deepEqual(snapshot, expected);
    assert.notStrictEqual(snapshot, expected);
    assert.notStrictEqual(snapshot.counts, expected.counts);
    assert.notStrictEqual(snapshot.completed, expected.completed);
    corruptSnapshot(snapshot);
    assert.deepEqual(store.getState(), expected);
  }
});

test('each subscriber owns a detached snapshot and cannot mutate another subscriber or storage', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  const stopMutating = store.subscribe(corruptSnapshot);
  const observed = [];
  store.subscribe(snapshot => observed.push(snapshot));
  const result = store.loadScenario('ready');
  assert.deepEqual(observed, [result]);
  assert.notStrictEqual(observed[0].counts, result.counts);
  assert.notStrictEqual(observed[0].completed, result.completed);
  assert.deepEqual(JSON.parse(storage.records.get(BANK_STORAGE_KEY)), result);
  corruptSnapshot(observed[0]);
  assert.deepEqual(store.getState(), result);
  stopMutating();
  assert.equal(store.invite().counts.admitted, 1);
  assert.equal(observed.length, 2);
});

test('stores and previously returned snapshots never share mutable state', () => {
  const first = freshStore();
  const second = freshStore();
  const before = first.getState();
  first.loadScenario('beta');
  assert.deepEqual(before, emptyState());
  assert.deepEqual(second.getState(), emptyState());
  second.loadScenario('new');
  assert.equal(first.getState().betaOpen, true);
});

test('all counters, over-goal progress and explicit beta opening survive a reload', () => {
  const storage = memoryStorage();
  const store = createBankStore({ storage });
  store.loadScenario('ready');
  for (const id of missionIds) contribute(store, id, 4);
  store.qualify();
  store.invite();
  const closed = createBankStore({ storage });
  assert.deepEqual(closed.getState(), store.getState());
  assert.equal(closed.getState().betaOpen, false);
  const opened = closed.openBeta();
  assert.deepEqual(createBankStore({ storage }).getState(), opened);
  assert.deepEqual([...storage.records.keys()], [BANK_STORAGE_KEY]);
  assert.ok(storage.reads.every(key => key === BANK_STORAGE_KEY));
  assert.ok(storage.writes.every(write => write.key === BANK_STORAGE_KEY));
});

test('saved completed data cannot invent, hide, reorder or duplicate completed missions', () => {
  assert.deepEqual(savedStore({ version: 1, counts: {}, completed: missionIds, betaOpen: true }).getState(), emptyState());
  for (const completed of [[], ['applications', 'newsletter'], ['curiosity', 'curiosity', 'unknown'], null, true, 'curiosity']) {
    const store = savedStore({ version: 1, counts: { ...BANK_GOALS }, completed });
    assert.deepEqual(store.getState().completed, missionIds);
    assert.equal(store.getState().betaOpen, false);
  }
  const ahead = savedStore({ version: 1, counts: { curiosity: 9, newsletter: 18, applications: 12 }, completed: missionIds });
  assert.deepEqual(ahead.getState().completed, []);
  assert.deepEqual(ahead.contribute('curiosity').completed, missionIds);
});

test('large restored overflow keeps totals while rebuilding a deduplicated completion list', () => {
  const counts = { curiosity: 1000000, newsletter: 9000000, applications: 6000000, qualified: 42, admitted: 21 };
  const storage = memoryStorage(JSON.stringify({
    version: 1, counts,
    completed: ['applications', 'applications', 'newsletter', 'curiosity', 'curiosity', 'unknown'],
    betaOpen: false,
  }));
  const store = createBankStore({ storage });
  assert.deepEqual(store.getState(), { version: 1, counts, completed: missionIds, betaOpen: false });
  const advanced = store.contribute('newsletter');
  assert.deepEqual(advanced.counts, { ...counts, newsletter: counts.newsletter + 1 });
  assert.deepEqual(advanced.completed, missionIds);
  assert.equal(advanced.betaOpen, false);
  assert.deepEqual(createBankStore({ storage }).getState(), advanced);
});

test('malformed JSON and invalid state shapes fall back to a clean playable state', () => {
  const invalid = [
    undefined, '', '{', 'not-json', 'NaN', 'null', 'true', '42', '"demo"', '[]', '{}',
    '{"version":2,"counts":{"curiosity":10}}',
    '{"version":"1","counts":{"curiosity":10}}',
    '{"schema":1,"counts":{"curiosity":10}}',
    '{"version":1}', '{"version":1,"counts":null}',
    '{"version":1,"counts":[]}', '{"version":1,"counts":5}',
    '{"version":1,"counts":"corrupt"}',
  ];
  for (const saved of invalid) {
    const storage = memoryStorage(saved);
    const store = createBankStore({ storage });
    assert.deepEqual(store.getState(), emptyState(), String(saved));
    assert.equal(store.contribute('curiosity').counts.curiosity, 1);
    assert.deepEqual(JSON.parse(storage.records.get(BANK_STORAGE_KEY)), store.getState());
  }
});

test('every counter discards negative, fractional, nonfinite, unsafe and non-number values', () => {
  const invalidTokens = ['-1', '0.5', '1e999', '-1e999', '9007199254740992', '"5"', '"NaN"', '"Infinity"', 'null', 'true', '[]', '{}'];
  for (const id of countIds) {
    for (const token of invalidTokens) {
      const counts = { ...BANK_GOALS, qualified: 3, admitted: 2, [id]: 'INVALID' };
      const saved = JSON.stringify({ version: 1, counts, betaOpen: true }).replace('"INVALID"', token);
      const state = createBankStore({ storage: memoryStorage(saved) }).getState();
      assert.equal(state.counts[id], 0, id + ': ' + token);
      assert.ok(state.counts.qualified <= state.counts.applications);
      assert.ok(state.counts.admitted <= state.counts.qualified);
      for (const count of Object.values(state.counts)) assert.ok(Number.isSafeInteger(count) && count >= 0);
      if (state.counts.curiosity < 10 || state.counts.admitted === 0) assert.equal(state.betaOpen, false);
    }
  }
});

test('unknown persisted fields and prototype-like keys cannot enter state or create rewards', () => {
  const saved = '{"version":1,"counts":{"curiosity":10,"newsletter":8,"applications":5,"qualified":2,"admitted":1,"zikak":999,"unknown":7,"__proto__":{"polluted":true}},"completed":["zikak"],"betaOpen":false,"balance":1000,"zikak":999,"__proto__":{"polluted":true}}';
  const store = createBankStore({ storage: memoryStorage(saved) });
  assert.deepEqual(store.getState(), {
    version: 1,
    counts: { curiosity: 10, newsletter: 8, applications: 5, qualified: 2, admitted: 1 },
    completed: missionIds,
    betaOpen: false,
  });
  assert.equal({}.polluted, undefined);
  assert.deepEqual(Object.keys(store.openBeta()).sort(), ['betaOpen', 'completed', 'counts', 'version']);
});

test('restoration clamps qualifications to applications and admissions to qualifications', () => {
  const cases = [
    [0, 9, 8, 0, 0], [2, 8, 7, 2, 2], [7, 2, 9, 2, 2],
    [7, 0, 4, 0, 0], [5, 4, 3, 4, 3],
  ];
  for (const [applications, qualified, admitted, expectedQualified, expectedAdmitted] of cases) {
    const state = savedStore({ version: 1, counts: { applications, qualified, admitted } }).getState();
    assert.equal(state.counts.applications, applications);
    assert.equal(state.counts.qualified, expectedQualified);
    assert.equal(state.counts.admitted, expectedAdmitted);
    assert.equal(state.betaOpen, false);
  }
});

test('restoration accepts betaOpen only as true with discovery and a valid admission', () => {
  for (const betaOpen of [false, undefined, null, 'true', 1, [], {}]) {
    const state = savedStore({ version: 1, counts: { ...BANK_GOALS, qualified: 3, admitted: 3 }, betaOpen }).getState();
    assert.equal(state.betaOpen, false);
  }
  const cases = [
    [{ curiosity: 10, applications: 1, qualified: 1, admitted: 1 }, true],
    [{ curiosity: 9, applications: 1, qualified: 1, admitted: 1 }, false],
    [{ ...BANK_GOALS, qualified: 3, admitted: 0 }, false],
    [{ ...BANK_GOALS, qualified: 0, admitted: 3 }, false],
    [{ curiosity: 10, applications: 0, qualified: 3, admitted: 3 }, false],
  ];
  for (const [counts, expected] of cases) {
    assert.equal(savedStore({ version: 1, counts, betaOpen: true }).getState().betaOpen, expected);
  }
});

test('safe integer limits preserve large totals without overflowing on contributions', () => {
  const counts = Object.fromEntries(countIds.map(id => [id, Number.MAX_SAFE_INTEGER]));
  const store = savedStore({ version: 1, counts, betaOpen: false });
  assert.deepEqual(store.getState().counts, counts);
  for (const id of missionIds) assert.deepEqual(store.contribute(id).counts, counts);
  assert.deepEqual(store.qualify().counts, counts);
  assert.deepEqual(store.invite().counts, counts);
  assert.equal(store.getState().betaOpen, false);
  const nearLimit = savedStore({ version: 1, counts: { curiosity: Number.MAX_SAFE_INTEGER - 1 } });
  assert.equal(nearLimit.contribute('curiosity').counts.curiosity, Number.MAX_SAFE_INTEGER);
});

test('all overflow actions reach the safe integer boundary once then become true no-ops', () => {
  const maximum = Number.MAX_SAFE_INTEGER;
  const counts = Object.fromEntries(countIds.map(id => [id, maximum - 1]));
  const storage = memoryStorage(JSON.stringify({ version: 1, counts, betaOpen: false }));
  const store = createBankStore({ storage });
  const updates = [];
  store.subscribe(snapshot => updates.push(snapshot));
  for (const id of missionIds) assert.equal(store.contribute(id).counts[id], maximum);
  assert.equal(store.qualify().counts.qualified, maximum);
  assert.equal(store.invite().counts.admitted, maximum);
  const atLimit = store.getState();
  assert.deepEqual(atLimit.counts, Object.fromEntries(countIds.map(id => [id, maximum])));
  assert.deepEqual(atLimit.completed, missionIds);
  assert.equal(atLimit.betaOpen, false);
  assert.equal(updates.length, countIds.length);
  assert.equal(storage.writes.length, countIds.length);
  for (const id of missionIds) assert.deepEqual(store.contribute(id), atLimit);
  assert.deepEqual(store.qualify(), atLimit);
  assert.deepEqual(store.invite(), atLimit);
  assert.equal(updates.length, countIds.length);
  assert.equal(storage.writes.length, countIds.length);
  assert.deepEqual(createBankStore({ storage }).getState(), atLimit);
});

test('the default store works without browser globals', t => {
  mockWindow(t, undefined);
  assert.deepEqual(createBankStore().getState(), emptyState());
  assert.equal(createBankStore().contribute('curiosity').counts.curiosity, 1);
});

test('the browser defaults to localStorage while explicit null keeps the store in memory', t => {
  const storage = memoryStorage(JSON.stringify({ version: 1, counts: { curiosity: 10 } }));
  mockWindow(t, { localStorage: storage });
  const browserStore = createBankStore();
  assert.deepEqual(browserStore.getState().completed, ['curiosity']);
  browserStore.contribute('newsletter');
  assert.equal(JSON.parse(storage.records.get(BANK_STORAGE_KEY)).counts.newsletter, 1);
  const writeCount = storage.writes.length;
  const readCount = storage.reads.length;
  const memory = createBankStore({ storage: null });
  assert.deepEqual(memory.getState(), emptyState());
  memory.contribute('applications');
  assert.equal(storage.writes.length, writeCount);
  assert.equal(storage.reads.length, readCount);
});

test('an injected storage takes precedence over browser storage', t => {
  const browser = memoryStorage();
  const injected = memoryStorage();
  mockWindow(t, { localStorage: browser });
  createBankStore({ storage: injected }).contribute('newsletter');
  assert.equal(browser.reads.length, 0);
  assert.equal(browser.writes.length, 0);
  assert.equal(injected.reads.length, 1);
  assert.equal(injected.writes.length, 1);
});

test('a denied browser localStorage getter cannot stop the in-memory demo', t => {
  const window = Object.defineProperty({}, 'localStorage', { get() { throw Error('Denied'); } });
  mockWindow(t, window);
  const store = createBankStore();
  assert.deepEqual(store.getState(), emptyState());
  assert.equal(store.contribute('curiosity').counts.curiosity, 1);
});

test('storage read and write failures remain silent while actions and subscriptions keep working', () => {
  const storages = [
    {},
    { getItem() { throw Error('Denied'); }, setItem() { throw Error('Quota'); } },
    { getItem() { return '{'; }, setItem() { throw Error('Quota'); } },
    { get getItem() { throw Error('Read denied'); }, get setItem() { throw Error('Write denied'); } },
  ];
  for (const storage of storages) {
    const store = createBankStore({ storage });
    const updates = [];
    store.subscribe(state => updates.push(state));
    assert.deepEqual(store.getState(), emptyState());
    store.loadScenario('ready');
    store.contribute('applications');
    store.qualify();
    store.invite();
    assert.equal(store.openBeta().betaOpen, true);
    assert.equal(updates.length, 5);
    assert.deepEqual(updates[4], store.getState());
  }
});

test('write failures after a valid restoration do not erase progress or prevent later persistence', () => {
  const storage = memoryStorage(JSON.stringify(scenarios[3][1]));
  const originalSet = storage.setItem;
  storage.setItem = () => { throw Error('Quota'); };
  const store = createBankStore({ storage });
  assert.equal(store.contribute('curiosity').counts.curiosity, 11);
  assert.equal(store.getState().betaOpen, true);
  storage.setItem = originalSet;
  store.contribute('newsletter');
  assert.deepEqual(createBankStore({ storage }).getState(), store.getState());
});
