import { describe, it, expect } from 'vitest';
import { getRecentNotes } from '../data/logUtils';

function makeSet(overrides = {}) {
  return {
    exercise: 'Bench Press',
    user: 'Ethan',
    reps: 8,
    weight: 135,
    notes: '',
    createdAt: '2026-02-19T10:00:00.000Z',
    ...overrides,
  };
}

describe('getRecentNotes', () => {
  it('returns empty array when no sets have notes', () => {
    const sets = [
      makeSet({ notes: '' }),
      makeSet({ notes: '' }),
    ];
    expect(getRecentNotes(sets, 'Bench Press', 'Ethan')).toEqual([]);
  });

  it('returns notes filtered by exercise and user', () => {
    const sets = [
      makeSet({ notes: 'keep elbows in' }),
      makeSet({ notes: 'wrong exercise', exercise: 'Squat' }),
      makeSet({ notes: 'wrong user', user: 'Ava' }),
    ];
    expect(getRecentNotes(sets, 'Bench Press', 'Ethan')).toEqual(['keep elbows in']);
  });

  it('returns at most 3 notes by default', () => {
    const sets = [
      makeSet({ notes: 'note 1', createdAt: '2026-02-19T10:00:00.000Z' }),
      makeSet({ notes: 'note 2', createdAt: '2026-02-19T09:00:00.000Z' }),
      makeSet({ notes: 'note 3', createdAt: '2026-02-19T08:00:00.000Z' }),
      makeSet({ notes: 'note 4', createdAt: '2026-02-19T07:00:00.000Z' }),
    ];
    expect(getRecentNotes(sets, 'Bench Press', 'Ethan')).toHaveLength(3);
  });

  it('returns most recent notes first', () => {
    const sets = [
      makeSet({ notes: 'older', createdAt: '2026-02-18T10:00:00.000Z' }),
      makeSet({ notes: 'newest', createdAt: '2026-02-19T12:00:00.000Z' }),
      makeSet({ notes: 'middle', createdAt: '2026-02-19T08:00:00.000Z' }),
    ];
    expect(getRecentNotes(sets, 'Bench Press', 'Ethan')).toEqual(['newest', 'middle', 'older']);
  });

  it('deduplicates identical note text, keeping most recent', () => {
    const sets = [
      makeSet({ notes: 'keep elbows in', createdAt: '2026-02-19T12:00:00.000Z' }),
      makeSet({ notes: 'keep elbows in', createdAt: '2026-02-19T10:00:00.000Z' }),
      makeSet({ notes: 'keep elbows in', createdAt: '2026-02-19T08:00:00.000Z' }),
      makeSet({ notes: 'felt good', createdAt: '2026-02-19T06:00:00.000Z' }),
    ];
    expect(getRecentNotes(sets, 'Bench Press', 'Ethan')).toEqual(['keep elbows in', 'felt good']);
  });

  it('ignores sets with empty or missing notes', () => {
    const sets = [
      makeSet({ notes: '' }),
      makeSet({ notes: 'actual note', createdAt: '2026-02-19T10:00:00.000Z' }),
      makeSet({}), // notes defaults to ''
    ];
    expect(getRecentNotes(sets, 'Bench Press', 'Ethan')).toEqual(['actual note']);
  });
});
