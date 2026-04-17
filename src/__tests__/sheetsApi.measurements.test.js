import { describe, it, expect } from 'vitest';
import { rowToMeasurement, measurementToRow } from '../data/sheetsApi';

describe('measurement row serialization', () => {
  it('roundtrips a measurement without data loss', () => {
    const original = {
      id: 'meas-uuid-1',
      date: '2026-02-19',
      user: 'Ethan',
      type: 'waist',
      value: 32,
      unit: 'in',
      notes: '',
      createdAt: '2026-02-19T08:00:00.000Z',
    };
    expect(rowToMeasurement(measurementToRow(original))).toEqual(original);
  });

  it('roundtrips a weight measurement with lbs unit', () => {
    const original = {
      id: 'meas-uuid-2',
      date: '2026-02-19',
      user: 'Ava',
      type: 'weight',
      value: 130,
      unit: 'lbs',
      notes: 'morning',
      createdAt: '2026-02-19T07:00:00.000Z',
    };
    expect(rowToMeasurement(measurementToRow(original))).toEqual(original);
  });

  it('rowToMeasurement coerces value to Number', () => {
    const row = ['meas-1', '2026-02-19', 'Ethan', 'bicepL', '15.5', 'in', '', '2026-02-19T08:00:00.000Z'];
    const result = rowToMeasurement(row);
    expect(result.value).toBe(15.5);
    expect(typeof result.value).toBe('number');
  });

  it('rowToMeasurement defaults unit to "in" when column F is missing', () => {
    const row = ['meas-1', '2026-02-19', 'Ethan', 'waist', '32'];
    const result = rowToMeasurement(row);
    expect(result.unit).toBe('in');
  });

  it('rowToMeasurement returns safe defaults for an empty row', () => {
    const result = rowToMeasurement([]);
    expect(result.id).toBe('');
    expect(result.date).toBe('');
    expect(result.user).toBe('');
    expect(result.type).toBe('');
    expect(result.value).toBe(0);
    expect(result.unit).toBe('in');
    expect(result.notes).toBe('');
    expect(result.createdAt).toBe('');
  });
});
