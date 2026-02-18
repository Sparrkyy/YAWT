export const SECTION_ORDER = ['Chest','Back','Shoulders','Arms','Legs','Core','Other'];

const MUSCLE_TO_SECTION = {
  chest: 'Chest',
  back: 'Back', rearDelts: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Arms', triceps: 'Arms',
  quads: 'Legs', hamstrings: 'Legs', glutes: 'Legs', calves: 'Legs',
  abs: 'Core', lowBack: 'Core',
};

export function groupExercises(exercises) {
  const map = Object.fromEntries(SECTION_ORDER.map(s => [s, []]));
  for (const ex of exercises) {
    const entries = Object.entries(ex.muscles ?? {});
    if (!entries.length) { map['Other'].push(ex); continue; }
    const [topMuscle] = entries.sort(([, a], [, b]) => b - a)[0];
    map[MUSCLE_TO_SECTION[topMuscle] ?? 'Other'].push(ex);
  }
  return SECTION_ORDER
    .filter(label => map[label].length > 0)
    .map(label => ({ label, exercises: [...map[label]].sort((a, b) => a.name.localeCompare(b.name)) }));
}
