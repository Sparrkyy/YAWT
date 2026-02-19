export function getBestSet(sets, exercise, user) {
  return sets
    .filter(s => s.exercise === exercise && s.user === user && s.reps != null && s.reps >= 5)
    .sort((a, b) => b.weight - a.weight)[0] ?? null;
}

export function getLastSet(sets, exercise, user) {
  return [...sets
    .filter(s => s.exercise === exercise && s.user === user)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null;
}
