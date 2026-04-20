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

export function getExerciseProgress(sets, exercise, user) {
  const byDate = {};
  for (const s of sets) {
    if (s.exercise !== exercise || s.user !== user) continue;
    const e1rm = (!s.reps || s.reps === 0) ? s.weight : s.weight * (1 + s.reps / 30);
    if (!byDate[s.date] || e1rm > byDate[s.date].e1rm) {
      byDate[s.date] = { e1rm, reps: s.reps, weight: s.weight };
    }
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { e1rm, reps, weight }]) => ({
      date,
      e1rm: parseFloat(e1rm.toFixed(1)),
      reps,
      weight,
    }));
}

export function getLastMuscleHitDates(sets, exercises, user) {
  const exMap = Object.fromEntries(exercises.map(ex => [ex.name, ex]));
  const result = {};
  for (const s of sets) {
    if (s.user !== user) continue;
    const ex = exMap[s.exercise];
    if (!ex) continue;
    for (const [muscle, w] of Object.entries(ex.muscles)) {
      if (!w) continue;
      if (!result[muscle] || s.date > result[muscle]) result[muscle] = s.date;
    }
  }
  return result;
}

export function computeStats(sets, exercises, period, user) {
  const { start, end } = getDateRange(period);
  const startStr = start.toLocaleDateString('en-CA');
  const endStr   = end.toLocaleDateString('en-CA');
  const exMap = Object.fromEntries(exercises.map(ex => [ex.name, ex]));
  const totals = {};
  const inPeriod = s => s.date >= startStr && s.date <= endStr && s.user === user;
  for (const s of sets.filter(inPeriod)) {
    const ex = exMap[s.exercise];
    if (!ex) continue;
    for (const [muscle, w] of Object.entries(ex.muscles)) {
      totals[muscle] = (totals[muscle] ?? 0) + w;
    }
  }
  return totals;
}
