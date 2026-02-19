import { describe, it, expect } from 'vitest';
import { rowToSet, setToRow, rowToExercise, exerciseToRow } from '../data/sheetsApi';

describe('set row serialization', () => {
  it('roundtrips a complete set without data loss', () => {
    const original = {
      id: 'abc-123',
      date: '2026-02-19',
      user: 'Ethan',
      exercise: 'Bench Press',
      reps: 8,
      weight: 135,
      notes: 'felt strong',
      createdAt: '2026-02-19T10:00:00.000Z',
    };
    expect(rowToSet(setToRow(original))).toEqual(original);
  });

  it('preserves reps: null through the roundtrip (not coerced to 0)', () => {
    const original = {
      id: 'xyz-456',
      date: '2026-02-19',
      user: 'Ava',
      exercise: 'Plank',
      reps: null,
      weight: 0,
      notes: '',
      createdAt: '2026-02-19T11:00:00.000Z',
    };
    const result = rowToSet(setToRow(original));
    expect(result.reps).toBeNull();
  });
});

describe('exercise row serialization', () => {
  it('roundtrips an exercise with muscles without data loss', () => {
    const original = {
      name: 'Bench Press',
      muscles: { chest: 1, triceps: 0.5, shoulders: 0.25 },
    };
    expect(rowToExercise(exerciseToRow(original))).toEqual(original);
  });

  it('returns {} for muscles when the JSON cell is malformed (no crash)', () => {
    const result = rowToExercise(['Bench Press', 'not valid json']);
    expect(result.muscles).toEqual({});
  });

  it('returns safe defaults for missing/empty cells in a set row', () => {
    const result = rowToSet([]);
    expect(result.id).toBe('');
    expect(result.weight).toBe(0);
    expect(result.reps).toBeNull();
    expect(result.notes).toBe('');
  });
});
