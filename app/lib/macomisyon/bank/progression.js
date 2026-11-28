// Rendering load is independent of mission completion and never caps totals at a goal.
function normalizeInteger(value, minimum) {
  return Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(minimum, Math.floor(value)))
    : minimum;
}

export function getBankLoad(count, goal = 1) {
  // Accept finite numbers only: no coercion of stored strings, objects or booleans.
  count = normalizeInteger(count, 0);
  goal = normalizeInteger(goal, 1);
  const ratio = count / goal;
  const excess = Math.max(0, count - goal);
  const overflow = Math.log2(1 + excess / goal);

  return {
    count,
    ratio,
    progress: Math.min(1, ratio),
    excess,
    overflow,
    paperCount: Math.min(48, count),
    // Individual GPU objects are bounded; the accumulated bulk keeps growing.
    bulkHeight: 0.12 * overflow,
    waitingCount: Math.min(8, 1 + Math.floor(Math.sqrt(ratio) * 2)),
  };
}
