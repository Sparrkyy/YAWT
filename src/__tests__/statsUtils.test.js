import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeStats } from '../data/statsUtils';

// Today is 2026-02-19 (Thursday)
const TODAY = '2026-02-19';

const benchPress = {
  name: 'Bench Press',
  muscles: { chest: 1, triceps: 0.5, shoulders: 0.25 },
};

const squat = {
  name: 'Squat',
  muscles: { quads: 1, glutes: 0.5, hamstrings: 0.25 },
};

const exercises = [benchPress, squat];

function makeSet(overrides = {}) {
  return {
    date: TODAY,
    user: 'Ethan',
    exercise: 'Bench Press',
    reps: 8,
    weight_lbs: 135,
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('computeStats', () => {
  it('returns correct muscle totals for one set today', () => {
    const sets = [makeSet()];
    const totals = computeStats(sets, exercises, 'week', 'Ethan');
    expect(totals.chest).toBe(1);
    expect(totals.triceps).toBe(0.5);
    expect(totals.shoulders).toBe(0.25);
  });

  it('returns {} when user does not match', () => {
    const sets = [makeSet({ user: 'Ava' })];
    const totals = computeStats(sets, exercises, 'week', 'Ethan');
    expect(totals).toEqual({});
  });

  it('excludes a set from last week when period is week', () => {
    const sets = [makeSet({ date: '2026-02-11' })]; // previous Mon–Sun week
    const totals = computeStats(sets, exercises, 'week', 'Ethan');
    expect(totals).toEqual({});
  });

  it('excludes a set from last month when period is month', () => {
    const sets = [makeSet({ date: '2026-01-31' })];
    const totals = computeStats(sets, exercises, 'month', 'Ethan');
    expect(totals).toEqual({});
  });

  it('excludes a set from last year when period is year', () => {
    const sets = [makeSet({ date: '2025-12-31' })];
    const totals = computeStats(sets, exercises, 'year', 'Ethan');
    expect(totals).toEqual({});
  });

  it('accumulates totals when a second set is added', () => {
    const sets = [makeSet()];
    const before = computeStats(sets, exercises, 'week', 'Ethan');
    const after = computeStats([...sets, makeSet()], exercises, 'week', 'Ethan');
    expect(after.chest).toBe(before.chest * 2);
    expect(after.triceps).toBe(before.triceps * 2);
  });

  it('decreases totals when a set is deleted', () => {
    const set1 = makeSet();
    const set2 = makeSet({ reps: 10 });
    const sets = [set1, set2];
    const before = computeStats(sets, exercises, 'week', 'Ethan');
    const after = computeStats(sets.filter(s => s !== set2), exercises, 'week', 'Ethan');
    expect(after.chest).toBe(before.chest / 2);
  });

  it('ignores sets whose exercise is not in the exercise list', () => {
    const sets = [makeSet({ exercise: 'Unknown Exercise' })];
    const totals = computeStats(sets, exercises, 'week', 'Ethan');
    expect(totals).toEqual({});
  });
});
