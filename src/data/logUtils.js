function matchesExerciseUser(s, exercise, user) {
  return s.exercise === exercise && s.user === user;
}

function isEligibleReps(reps) {
  return reps != null && reps >= 5;
}

function compareByWeightThenReps(a, b) {
  return b.weight - a.weight || b.reps - a.reps;
}

function matchesWeightWithReps(s, weight) {
  return s.weight === weight && s.reps != null;
}

export function getBestSet(sets, exercise, user) {
  return (
    sets
      .filter((s) => matchesExerciseUser(s, exercise, user))
      .filter((s) => isEligibleReps(s.reps))
      .sort(compareByWeightThenReps)[0] ?? null
  );
}

export function getLastExerciseToday(sets, user) {
  const today = new Date().toLocaleDateString('en-CA');
  const last = [...sets]
    .filter((s) => s.user === user && s.date === today)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  return last ? last.exercise : null;
}

export function getLastSet(sets, exercise, user) {
  return (
    [...sets.filter((s) => s.exercise === exercise && s.user === user)].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0] ?? null
  );
}

export function getBestRepsAtWeight(sets, exercise, user, weight) {
  const filtered = sets
    .filter((s) => matchesExerciseUser(s, exercise, user))
    .filter((s) => matchesWeightWithReps(s, weight));
  if (!filtered.length) return null;
  return filtered.reduce((best, s) => (s.reps > best.reps ? s : best));
}

export function isNewPR(sets, exercise, user, weight, reps) {
  if (reps == null) return false;
  const previous = getBestRepsAtWeight(sets, exercise, user, weight);
  if (previous === null) return false; // first time at this weight → not a PR
  return reps > previous.reps;
}

export function resolveExerciseOnUserSwitch(currentExercise, sets, newUser) {
  if (currentExercise) return currentExercise;
  return getLastExerciseToday(sets, newUser) ?? null;
}

function hasNoteForUser(s, exercise, user) {
  return matchesExerciseUser(s, exercise, user) && !!s.notes;
}

export function getRecentNotes(sets, exercise, user, count = 3) {
  const seen = new Set();
  return sets
    .filter((s) => hasNoteForUser(s, exercise, user))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .reduce((acc, s) => {
      if (acc.length >= count || seen.has(s.notes)) return acc;
      seen.add(s.notes);
      acc.push(s.notes);
      return acc;
    }, []);
}

function outperforms(best, weight, reps) {
  return weight > best.weight || (weight === best.weight && reps > best.reps);
}

export function isNewBestSetEver(sets, exercise, user, weight, reps) {
  if (!isEligibleReps(reps)) return false;
  const best = getBestSet(sets, exercise, user);
  return best !== null && outperforms(best, weight, reps);
}
