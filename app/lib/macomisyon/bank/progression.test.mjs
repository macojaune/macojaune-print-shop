import test from 'node:test';
import assert from 'node:assert/strict';
import { getBankLoad } from './progression.js';

const zeroLoad = {
  count: 0, ratio: 0, progress: 0, excess: 0, overflow: 0,
  paperCount: 0, bulkHeight: 0, waitingCount: 1,
};

test('zero count has no papers or bulk and keeps the baseline waiting figure', () => {
  assert.deepEqual(getBankLoad(0, 8), zeroLoad);
  assert.deepEqual(getBankLoad(-0, 5), zeroLoad);
  assert.deepEqual(getBankLoad(), zeroLoad);
});

test('returns exactly the load fields before, at and beyond a goal', () => {
  assert.deepEqual(getBankLoad(4, 8), {
    count: 4, ratio: 0.5, progress: 0.5, excess: 0, overflow: 0,
    paperCount: 4, bulkHeight: 0, waitingCount: 2,
  });
  assert.deepEqual(getBankLoad(8, 8), {
    count: 8, ratio: 1, progress: 1, excess: 0, overflow: 0,
    paperCount: 8, bulkHeight: 0, waitingCount: 3,
  });
  for (const [count, goal] of [[32, 8], [20, 5]]) {
    assert.deepEqual(getBankLoad(count, goal), {
      count, ratio: 4, progress: 1, excess: count - goal, overflow: 2,
      paperCount: count, bulkHeight: 0.24, waitingCount: 5,
    });
  }
});

for (const goal of [5, 8, 10]) {
  test('load grows monotonically beyond the goal of ' + goal, () => {
    let previous = getBankLoad(goal, goal);
    for (let count = goal + 1; count <= goal * 100; count++) {
      const next = getBankLoad(count, goal);
      assert.equal(next.count, count);
      assert.equal(next.progress, 1);
      for (const key of ['ratio', 'excess', 'overflow', 'bulkHeight']) {
        assert.ok(next[key] > previous[key], key + ' at ' + count);
      }
      assert.ok(next.paperCount >= previous.paperCount);
      assert.ok(next.waitingCount >= previous.waitingCount);
      previous = next;
    }
  });
}

test('GPU paper and waiting limits never cap the growing accumulated bulk', () => {
  assert.equal(getBankLoad(47, 8).paperCount, 47);
  let previous = getBankLoad(48, 8);
  assert.equal(previous.paperCount, 48);
  for (const count of [49, 96, 192, 384, 10000, 1000000, Number.MAX_SAFE_INTEGER]) {
    const next = getBankLoad(count, 8);
    assert.equal(next.count, count);
    assert.equal(next.paperCount, 48);
    assert.ok(next.bulkHeight > previous.bulkHeight);
    assert.ok(next.overflow > previous.overflow);
    assert.ok(next.waitingCount <= 8);
    previous = next;
  }
  assert.equal(previous.waitingCount, 8);
});

test('waiting figures follow the square-root steps rather than a quota cap', () => {
  for (const [count, expected] of [[0, 1], [1, 1], [2, 2], [8, 3], [18, 4], [32, 5], [50, 6], [72, 7], [98, 8], [1000, 8]]) {
    assert.equal(getBankLoad(count, 8).waitingCount, expected);
  }
});

test('MAX_SAFE_INTEGER totals remain exact with finite derived values', () => {
  const count = Number.MAX_SAFE_INTEGER;
  for (const goal of [1, 5, 8, 10, count]) {
    const load = getBankLoad(count, goal);
    assert.equal(load.count, count);
    assert.equal(load.ratio, count / goal);
    assert.equal(load.progress, 1);
    assert.equal(load.excess, count - goal);
    assert.equal(load.overflow, Math.log2(1 + (count - goal) / goal));
    assert.equal(load.bulkHeight, 0.12 * load.overflow);
    assert.equal(load.paperCount, 48);
    for (const value of Object.values(load)) assert.ok(Number.isFinite(value));
  }
  assert.equal(getBankLoad(count, count).waitingCount, 3);
  assert.equal(getBankLoad(count, count).bulkHeight, 0);
});

test('normalizes finite counts to nonnegative safe integers', () => {
  for (const [input, expected] of [[-12, 0], [-0.5, 0], [Number.MIN_VALUE, 0], [0.9, 0], [7.9, 7], [Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER], [Number.MAX_VALUE, Number.MAX_SAFE_INTEGER]]) {
    const load = getBankLoad(input, 8);
    assert.deepEqual(load, getBankLoad(expected, 8));
    assert.ok(Number.isSafeInteger(load.count));
    assert.ok(load.count >= 0);
  }
});

test('normalizes goals to positive safe integers and defaults to one', () => {
  assert.deepEqual(getBankLoad(8), getBankLoad(8, 1));
  for (const goal of [0, -0, -8, -0.5, Number.MIN_VALUE, 0.9]) {
    assert.deepEqual(getBankLoad(8, goal), getBankLoad(8, 1));
  }
  assert.deepEqual(getBankLoad(32.9, 8.9), getBankLoad(32, 8));
  for (const goal of [Number.MAX_SAFE_INTEGER + 1, Number.MAX_VALUE]) {
    assert.deepEqual(getBankLoad(32, goal), getBankLoad(32, Number.MAX_SAFE_INTEGER));
  }
});

test('bad inputs never coerce values, produce NaN or throw', () => {
  const coercionTrap = Object.freeze({ [Symbol.toPrimitive]() { throw Error('Do not coerce'); } });
  const invalid = [undefined, null, NaN, Infinity, -Infinity, '', '32', true, false, 32n, Symbol('count'), [], [32], {}, new Number(32), coercionTrap];
  for (const value of invalid) {
    assert.deepEqual(getBankLoad(value, 8), zeroLoad);
    assert.deepEqual(getBankLoad(32, value), getBankLoad(32, 1));
    assert.deepEqual(getBankLoad(value, value), zeroLoad);
  }
});

test('calls are deterministic and return independent load snapshots', () => {
  const first = getBankLoad(32, 8);
  const second = getBankLoad(32, 8);
  assert.deepEqual(first, second);
  assert.notStrictEqual(first, second);
  first.count = 0;
  first.bulkHeight = -100;
  assert.deepEqual(getBankLoad(32, 8), second);
});
