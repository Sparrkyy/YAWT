import { describe, it, expect } from 'vitest';
import { getBestSet, getLastSet } from '../data/logUtils';

function makeSet(overrides = {}) {
  return {
    exercise: 'Bench Press',
    user: 'Ethan',
    reps: 8,
    weight: 135,
    createdAt: '2026-02-19T10:00:00.000Z',
    ...overrides,
  };
}

describe('getBestSet', () => {
  it('returns the highest-weight set with 5+ reps', () => {
    const sets = [
      makeSet({ weight: 135, reps: 8 }),
      makeSet({ weight: 155, reps: 5 }),
      makeSet({ weight: 145, reps: 6 }),
    ];
    expect(getBestSet(sets, 'Bench Press', 'Ethan').weight).toBe(155);
  });

  it('ignores sets with fewer than 5 reps even if heavier', () => {
    const sets = [
      makeSet({ weight: 225, reps: 1 }),
      makeSet({ weight: 185, reps: 3 }),
      makeSet({ weight: 155, reps: 5 }),
    ];
    expect(getBestSet(sets, 'Bench Press', 'Ethan').weight).toBe(155);
  });

  it('ignores sets from the wrong user', () => {
    const sets = [
      makeSet({ weight: 135, reps: 8, user: 'Ava' }),
    ];
    expect(getBestSet(sets, 'Bench Press', 'Ethan')).toBeNull();
  });

  it('returns null when no sets have 5+ reps', () => {
    const sets = [
      makeSet({ weight: 225, reps: 2 }),
      makeSet({ weight: 185, reps: null }),
    ];
    expect(getBestSet(sets, 'Bench Press', 'Ethan')).toBeNull();
  });

  it('ignores sets for a different exercise', () => {
    const sets = [makeSet({ weight: 200, reps: 8, exercise: 'Squat' })];
    expect(getBestSet(sets, 'Bench Press', 'Ethan')).toBeNull();
  });
});

describe('getLastSet', () => {
  it('returns the most recent set by createdAt', () => {
    const sets = [
      makeSet({ weight: 135, createdAt: '2026-02-19T09:00:00.000Z' }),
      makeSet({ weight: 145, createdAt: '2026-02-19T10:30:00.000Z' }),
      makeSet({ weight: 125, createdAt: '2026-02-18T08:00:00.000Z' }),
    ];
    expect(getLastSet(sets, 'Bench Press', 'Ethan').weight).toBe(145);
  });

  it('works correctly when reps is null', () => {
    const sets = [makeSet({ reps: null, weight: 0 })];
    const result = getLastSet(sets, 'Bench Press', 'Ethan');
    expect(result).not.toBeNull();
    expect(result.reps).toBeNull();
  });

  it('returns null when no sets exist for that exercise and user', () => {
    expect(getLastSet([], 'Bench Press', 'Ethan')).toBeNull();
  });
});
