function weekRange(today) {
  const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function getDateRange(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const m = today.getMonth();
  const ranges = {
    week:      () => weekRange(today),
    month:     () => ({ start: new Date(y, m, 1),     end: new Date(y, m + 1, 0) }),
    lastMonth: () => ({ start: new Date(y, m - 1, 1), end: new Date(y, m, 0) }),
    year:      () => ({ start: new Date(y, 0, 1),     end: new Date(y, 11, 31) }),
  };
  return (ranges[period] ?? ranges.year)();
}

function calcE1rm(weight, reps) {
  return !reps ? weight : weight * (1 + reps / 30);
}

function isBetterE1rm(byDate, date, e1rm) {
  return !byDate[date] || e1rm > byDate[date].e1rm;
}

function matchesExerciseAndUser(s, exercise, user) {
  return s.exercise === exercise && s.user === user;
}

function processProgressSet(byDate, s, exercise, user) {
  if (!matchesExerciseAndUser(s, exercise, user)) return;
  const e1rm = calcE1rm(s.weight, s.reps);
  if (isBetterE1rm(byDate, s.date, e1rm)) {
    byDate[s.date] = { e1rm, reps: s.reps, weight: s.weight };
  }
}

export function getExerciseProgress(sets, exercise, user) {
  const byDate = {};
  for (const s of sets) processProgressSet(byDate, s, exercise, user);
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { e1rm, reps, weight }]) => ({
      date,
      e1rm: parseFloat(e1rm.toFixed(1)),
      reps,
      weight,
    }));
}

function updateMuscleHit(result, muscle, date) {
  if (!result[muscle] || date > result[muscle]) result[muscle] = date;
}

function applyMuscleIfActive(result, muscle, w, date) {
  if (w) updateMuscleHit(result, muscle, date);
}

function applyMuscleHits(result, exMap, s) {
  const ex = exMap[s.exercise];
  if (!ex) return;
  for (const [muscle, w] of Object.entries(ex.muscles)) {
    applyMuscleIfActive(result, muscle, w, s.date);
  }
}

export function getLastMuscleHitDates(sets, exercises, user) {
  const exMap = Object.fromEntries(exercises.map(ex => [ex.name, ex]));
  const result = {};
  for (const s of sets) {
    if (s.user !== user) continue;
    applyMuscleHits(result, exMap, s);
  }
  return result;
}

function inPeriod(s, startStr, endStr, user) {
  return s.date >= startStr && s.date <= endStr && s.user === user;
}

function accumulateMuscles(totals, ex) {
  for (const [muscle, w] of Object.entries(ex.muscles)) {
    totals[muscle] = (totals[muscle] ?? 0) + w;
  }
}

export function computeStats(sets, exercises, period, user) {
  const { start, end } = getDateRange(period);
  const startStr = start.toLocaleDateString('en-CA');
  const endStr   = end.toLocaleDateString('en-CA');
  const exMap = Object.fromEntries(exercises.map(ex => [ex.name, ex]));
  const totals = {};
  for (const s of sets.filter(s => inPeriod(s, startStr, endStr, user))) {
    const ex = exMap[s.exercise];
    if (!ex) continue;
    accumulateMuscles(totals, ex);
  }
  return totals;
}
