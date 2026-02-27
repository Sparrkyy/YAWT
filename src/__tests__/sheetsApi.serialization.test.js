import { describe, it, expect } from 'vitest';
import { rowToSet, setToRow, rowToExercise, exerciseToRow } from '../data/sheetsApi';

describe('set row serialization', () => {
  it('setToRow writes XLOOKUP formula in col D and exerciseId in col E', () => {
    const set = {
      id: 'abc-123',
      date: '2026-02-19',
      user: 'Ethan',
      exercise: 'Bench Press',
      exerciseId: 'ex-uuid-001',
      reps: 8,
      weight: 135,
      notes: 'felt strong',
      createdAt: '2026-02-19T10:00:00.000Z',
    };
    const row = setToRow(set);
    expect(row[3]).toContain('XLOOKUP');
    expect(row[4]).toBe('ex-uuid-001');
    expect(row[5]).toBe(8);    // reps
    expect(row[6]).toBe(135);  // weight
    expect(row[7]).toBe('felt strong'); // notes
    expect(row[8]).toBe('2026-02-19T10:00:00.000Z'); // createdAt
  });

  it('setToRow falls back to exercise name in col E when exerciseId is absent', () => {
    const set = {
      id: 'abc-123', date: '2026-02-19', user: 'Ethan',
      exercise: 'Bench Press',
      reps: 5, weight: 100, notes: '', createdAt: '2026-02-19T10:00:00.000Z',
    };
    const row = setToRow(set);
    expect(row[4]).toBe('Bench Press');
  });

  it('rowToSet reads exercise name from col D and exerciseId from col E', () => {
    const row = ['abc-123', '2026-02-19', 'Ethan', 'Bench Press', 'ex-uuid-001', 8, 135, 'felt strong', '2026-02-19T10:00:00.000Z'];
    const set = rowToSet(row);
    expect(set.exercise).toBe('Bench Press');
    expect(set.exerciseId).toBe('ex-uuid-001');
    expect(set.reps).toBe(8);
    expect(set.weight).toBe(135);
    expect(set.notes).toBe('felt strong');
    expect(set.createdAt).toBe('2026-02-19T10:00:00.000Z');
  });

  it('preserves reps: null through rowToSet (not coerced to 0)', () => {
    const row = ['xyz-456', '2026-02-19', 'Ava', 'Plank', 'ex-uuid-002', '', 0, '', '2026-02-19T11:00:00.000Z'];
    const result = rowToSet(row);
    expect(result.reps).toBeNull();
  });
});

describe('exercise row serialization', () => {
  it('roundtrips an exercise with id, name, muscles, archived without data loss', () => {
    const original = {
      id: 'ex-uuid-001',
      name: 'Bench Press',
      muscles: { chest: 1, triceps: 0.5, shoulders: 0.25 },
      archived: false,
    };
    expect(rowToExercise(exerciseToRow(original))).toEqual(original);
  });

  it('roundtrips an archived exercise preserving the archived flag', () => {
    const original = {
      id: 'ex-uuid-002',
      name: 'Old Lift',
      muscles: { back: 1 },
      archived: true,
    };
    expect(rowToExercise(exerciseToRow(original))).toEqual(original);
  });

  it('defaults archived to false when column D is missing (legacy row)', () => {
    const result = rowToExercise(['ex-id', 'Bench Press', '{"chest":1}']);
    expect(result.archived).toBe(false);
  });

  it('defaults archived to false when column D is an empty string', () => {
    const result = rowToExercise(['ex-id', 'Bench Press', '{"chest":1}', '']);
    expect(result.archived).toBe(false);
  });

  it('returns {} for muscles when the JSON cell is malformed (no crash)', () => {
    const result = rowToExercise(['ex-id', 'Bench Press', 'not valid json']);
    expect(result.muscles).toEqual({});
  });

  it('returns safe defaults for missing/empty cells in a set row', () => {
    const result = rowToSet([]);
    expect(result.id).toBe('');
    expect(result.weight).toBe(0);
    expect(result.reps).toBeNull();
    expect(result.notes).toBe('');
    expect(result.exerciseId).toBe('');
  });
});
