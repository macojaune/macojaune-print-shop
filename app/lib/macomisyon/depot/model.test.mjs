import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, statusFor, STORAGE_KEY } from './model.js';

test('new sites do not also increment the separate review counter', () => {
  const store = createStore({ storage: null });
  store.contribute('boutiques', 'shop-1');
  assert.equal(store.getState().counts.boutiques, 1);
  assert.equal(store.getState().counts.retours, 0);
  assert.equal(store.contribute('boutiques', 'shop-1').reason, 'duplicate');
  assert.equal(store.getState().counts.boutiques, 1);
});

test('locked progress is retained and validates when its dependency is completed', () => {
  const store = createStore({ storage: null });
  store.preset('ahead');
  assert.equal(statusFor('retours', store.getState()), 'blocked');
  assert.equal(store.getState().counts.retours, 5);
  for (let i = 0; i < 3; i++) store.contribute('boutiques', `site-${i}`);
  assert.equal(statusFor('retours', store.getState()), 'completed');
  assert.equal(store.getState().repaired, false);
  for (let i = 0; i < 6; i++) store.contribute('inscrits', `user-${i}`);
  assert.equal(store.getState().repaired, true);
  assert.equal(store.getState().counts.bonus, 0);
});

test('reaching registrations alone never repairs the Fenwick; completed targets keep counting', () => {
  const store = createStore({ storage: null });
  store.preset('progress');
  assert.equal(store.getState().repaired, false);
  store.preset('repaired');
  assert.equal(store.contribute('boutiques', 'extra-shop').ok, true);
  assert.equal(store.getState().counts.boutiques, 6);
  assert.equal(store.getState().repaired, true);
});

test('storage is optional and a saved repaired flag cannot invent completed goals', () => {
  const storage = { getItem: () => JSON.stringify({ schema: 1, counts: { inscrits: 2 }, repaired: true, completed: ['inscrits', 'retours', 'boutiques'] }), setItem() {} };
  const store = createStore({ storage });
  assert.equal(store.getState().repaired, false);
  const broken = createStore({ storage: { getItem() { throw Error('Denied'); } } });
  assert.equal(broken.contribute('boutiques', 'shop').ok, true);
  assert.equal(broken.persistence, false);
});

test('saved progress and event deduplication survive a reload; unsubscribed consumers stay detached', () => {
  const records = new Map();
  const storage = { getItem: key => records.get(key), setItem: (key, value) => records.set(key, value) };
  const store = createStore({ storage });
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  store.preset('repaired');
  unsubscribe();
  store.contribute('boutiques', 'extra-shop');
  assert.equal(updates, 1);
  assert.ok(records.has(STORAGE_KEY));
  const restored = createStore({ storage });
  assert.equal(restored.getState().repaired, true);
  assert.equal(restored.getState().counts.boutiques, 6);
  assert.equal(restored.contribute('boutiques', 'extra-shop').reason, 'duplicate');
});
