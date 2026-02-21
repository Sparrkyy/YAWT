import { describe, it, expect } from 'vitest';
import { getBestSet, getLastSet, getBestRepsAtWeight, isNewPR } from '../data/logUtils';

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

  it('returns the set with more reps when two sets share the highest weight', () => {
    const sets = [
      makeSet({ weight: 185, reps: 6 }),
      makeSet({ weight: 185, reps: 10 }),
    ];
    expect(getBestSet(sets, 'Bench Press', 'Ethan').reps).toBe(10);
  });
});

describe('getBestRepsAtWeight', () => {
  it('returns the set with the most reps at the exact weight', () => {
    const sets = [
      makeSet({ weight: 185, reps: 6 }),
      makeSet({ weight: 185, reps: 8 }),
      makeSet({ weight: 185, reps: 5 }),
    ];
    expect(getBestRepsAtWeight(sets, 'Bench Press', 'Ethan', 185).reps).toBe(8);
  });

  it('ignores sets at a different weight', () => {
    const sets = [
      makeSet({ weight: 135, reps: 12 }),
      makeSet({ weight: 185, reps: 6 }),
    ];
    expect(getBestRepsAtWeight(sets, 'Bench Press', 'Ethan', 185).reps).toBe(6);
  });

  it('ignores sets for a different user', () => {
    const sets = [
      makeSet({ weight: 185, reps: 10, user: 'Ava' }),
    ];
    expect(getBestRepsAtWeight(sets, 'Bench Press', 'Ethan', 185)).toBeNull();
  });

  it('ignores sets for a different exercise', () => {
    const sets = [
      makeSet({ weight: 185, reps: 10, exercise: 'Squat' }),
    ];
    expect(getBestRepsAtWeight(sets, 'Bench Press', 'Ethan', 185)).toBeNull();
  });

  it('returns null when no sets exist at that weight', () => {
    const sets = [
      makeSet({ weight: 135, reps: 8 }),
    ];
    expect(getBestRepsAtWeight(sets, 'Bench Press', 'Ethan', 185)).toBeNull();
  });

  it('ignores sets where reps is null', () => {
    const sets = [
      makeSet({ weight: 185, reps: null }),
    ];
    expect(getBestRepsAtWeight(sets, 'Bench Press', 'Ethan', 185)).toBeNull();
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

describe('isNewPR', () => {
  it('returns false when reps is null', () => {
    expect(isNewPR([makeSet({ weight: 135, reps: 10 })], 'Bench Press', 'Ethan', 135, null)).toBe(false);
  });
  it('returns false when no previous entry at that weight', () => {
    expect(isNewPR([makeSet({ weight: 135, reps: 10 })], 'Bench Press', 'Ethan', 185, 8)).toBe(false);
  });
  it('returns false when new reps ties the previous best', () => {
    expect(isNewPR([makeSet({ weight: 135, reps: 10 })], 'Bench Press', 'Ethan', 135, 10)).toBe(false);
  });
  it('returns false when new reps is less than previous best', () => {
    expect(isNewPR([makeSet({ weight: 135, reps: 10 })], 'Bench Press', 'Ethan', 135, 8)).toBe(false);
  });
  it('returns true when new reps strictly beats the previous best', () => {
    expect(isNewPR([makeSet({ weight: 135, reps: 10 })], 'Bench Press', 'Ethan', 135, 11)).toBe(true);
  });
  it('returns false when sets is empty', () => {
    expect(isNewPR([], 'Bench Press', 'Ethan', 135, 12)).toBe(false);
  });
});
