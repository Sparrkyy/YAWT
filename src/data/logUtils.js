export function getBestSet(sets, exercise, user) {
  return sets
    .filter(s => s.exercise === exercise && s.user === user && s.reps != null && s.reps >= 5)
    .sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0] ?? null;
}

export function getLastSet(sets, exercise, user) {
  return [...sets
    .filter(s => s.exercise === exercise && s.user === user)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null;
}

export function getBestRepsAtWeight(sets, exercise, user, weight) {
  const filtered = sets.filter(
    s => s.exercise === exercise &&
         s.user === user &&
         s.weight === weight &&
         s.reps != null
  );
  if (!filtered.length) return null;
  return filtered.reduce((best, s) => (s.reps > best.reps ? s : best));
}
