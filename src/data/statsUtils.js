export function getDateRange(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (period === 'week') {
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }
  if (period === 'month') return {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end:   new Date(today.getFullYear(), today.getMonth() + 1, 0),
  };
  return {
    start: new Date(today.getFullYear(), 0, 1),
    end:   new Date(today.getFullYear(), 11, 31),
  };
}

export function computeStats(sets, exercises, period, user) {
  const { start, end } = getDateRange(period);
  const startStr = start.toLocaleDateString('en-CA');
  const endStr   = end.toLocaleDateString('en-CA');
  const exMap = Object.fromEntries(exercises.map(ex => [ex.name, ex]));
  const totals = {};
  for (const s of sets) {
    if (s.date < startStr || s.date > endStr) continue;
    if (s.user !== user) continue;
    const ex = exMap[s.exercise];
    if (!ex) continue;
    for (const [muscle, w] of Object.entries(ex.muscles)) {
      totals[muscle] = (totals[muscle] ?? 0) + w;
    }
  }
  return totals;
}
