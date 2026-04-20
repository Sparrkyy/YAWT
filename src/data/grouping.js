export const SECTION_ORDER = ['Chest','Back','Delts','Arms','Legs','Core','Other'];

const MUSCLE_TO_SECTION = {
  chest: 'Chest',
  back: 'Back',
  frontDelts: 'Delts', sideDelts: 'Delts', rearDelts: 'Delts',
  biceps: 'Arms', triceps: 'Arms',
  quads: 'Legs', hamstrings: 'Legs', glutes: 'Legs', calves: 'Legs',
  abs: 'Core', lowBack: 'Core',
};

function topMuscle(ex) {
  const entries = Object.entries(ex.muscles ?? {});
  return entries.length ? entries.sort(([,a],[,b]) => b - a)[0][0] : null;
}

function sectionFor(ex) {
  const m = topMuscle(ex);
  return m ? (MUSCLE_TO_SECTION[m] ?? 'Other') : 'Other';
}

export function groupExercises(exercises) {
  const map = Object.fromEntries(SECTION_ORDER.map(s => [s, []]));
  for (const ex of exercises) {
    const section = sectionFor(ex);
    map[section].push(ex);
  }
  return SECTION_ORDER
    .filter(label => map[label].length > 0)
    .map(label => ({ label, exercises: [...map[label]].sort((a, b) => a.name.localeCompare(b.name)) }));
}
