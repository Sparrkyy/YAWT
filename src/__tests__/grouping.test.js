import { describe, it, expect } from 'vitest';
import { groupExercises } from '../data/grouping';

describe('groupExercises', () => {
  it('returns [] for empty input', () => {
    expect(groupExercises([])).toEqual([]);
  });

  it('places exercise in the correct section by primary muscle', () => {
    const exercises = [{ name: 'Bench Press', muscles: { chest: 1, triceps: 0.5 } }];
    const groups = groupExercises(exercises);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Chest');
    expect(groups[0].exercises[0].name).toBe('Bench Press');
  });

  it('sorts exercises alphabetically within a section', () => {
    const exercises = [
      { name: 'Squat', muscles: { quads: 1 } },
      { name: 'Leg Press', muscles: { quads: 1 } },
      { name: 'Lunge', muscles: { quads: 1 } },
    ];
    const groups = groupExercises(exercises);
    const names = groups[0].exercises.map(e => e.name);
    expect(names).toEqual(['Leg Press', 'Lunge', 'Squat']);
  });

  it('determines primary muscle by highest weighting, not by key order', () => {
    // triceps weighting is higher, so should land in Arms not Chest
    const exercises = [{ name: 'Close-Grip Bench', muscles: { chest: 0.25, triceps: 1 } }];
    const groups = groupExercises(exercises);
    expect(groups[0].label).toBe('Arms');
  });

  it('places exercise with no muscles in Other', () => {
    const exercises = [{ name: 'Mystery Move', muscles: {} }];
    const groups = groupExercises(exercises);
    expect(groups[0].label).toBe('Other');
  });

  it('places exercise with an unmapped muscle key in Other', () => {
    const exercises = [{ name: 'Tibialis Raise', muscles: { tibialis: 1 } }];
    const groups = groupExercises(exercises);
    expect(groups[0].label).toBe('Other');
  });

  it('omits sections that have no exercises', () => {
    const exercises = [{ name: 'Curl', muscles: { biceps: 1 } }];
    const groups = groupExercises(exercises);
    const labels = groups.map(g => g.label);
    expect(labels).toEqual(['Arms']);
    expect(labels).not.toContain('Chest');
    expect(labels).not.toContain('Legs');
  });
});
