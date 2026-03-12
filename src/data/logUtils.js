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

export function isNewPR(sets, exercise, user, weight, reps) {
  if (reps == null) return false;
  const previous = getBestRepsAtWeight(sets, exercise, user, weight);
  if (previous === null) return false;   // first time at this weight → not a PR
  return reps > previous.reps;
}

export function getRecentNotes(sets, exercise, user, count = 3) {
  const seen = new Set();
  return sets
    .filter(s => s.exercise === exercise && s.user === user && s.notes)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .reduce((acc, s) => {
      if (acc.length >= count || seen.has(s.notes)) return acc;
      seen.add(s.notes);
      acc.push(s.notes);
      return acc;
    }, []);
}

export function isNewBestSetEver(sets, exercise, user, weight, reps) {
  if (reps == null || reps < 5) return false;
  const best = getBestSet(sets, exercise, user);
  if (best === null) return false;  // no previous 5+ rep set → not a new best
  return weight > best.weight || (weight === best.weight && reps > best.reps);
}
