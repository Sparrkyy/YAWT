import { useState, useMemo } from 'react';
import BodyDiagram from './BodyDiagram';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', abs: 'Abs', rearDelts: 'Rear Delts', lowBack: 'Low Back',
};

function getDateRange(period) {
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

const USERS = ['Ethan', 'Ava'];

export default function StatsView({ sets, exercises, activeUser, onUserChange }) {
  const [period, setPeriod] = useState('week');
  const [side, setSide] = useState('front');

  const effectiveSets = useMemo(() => {
    const { start, end } = getDateRange(period);
    const startStr = start.toLocaleDateString('en-CA');
    const endStr   = end.toLocaleDateString('en-CA');
    const exMap = Object.fromEntries(exercises.map(ex => [ex.name, ex]));
    const totals = {};
    for (const s of sets) {
      if (s.date < startStr || s.date > endStr) continue;
      if (s.user !== activeUser) continue;
      const ex = exMap[s.exercise];
      if (!ex) continue;
      for (const [muscle, w] of Object.entries(ex.muscles)) {
        totals[muscle] = (totals[muscle] ?? 0) + w;
      }
    }
    return totals;
  }, [sets, exercises, period, activeUser]);

  const rankedMuscles = Object.entries(effectiveSets)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const periodLabels = { week: 'This Week', month: 'This Month', year: 'This Year' };

  return (
    <div className="view">
      <div className="user-toggle">
        {USERS.map(u => (
          <button
            key={u}
            className={`user-btn ${activeUser === u ? 'active' : ''}`}
            onClick={() => onUserChange(u)}
          >
            {u}
          </button>
        ))}
      </div>
      <div className="period-selector">
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            className={`period-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      <BodyDiagram effectiveSets={effectiveSets} side={side} onSideChange={setSide} />

      {rankedMuscles.length > 0 ? (
        <div className="muscle-totals">
          {rankedMuscles.map(([muscle, value]) => (
            <div key={muscle} className="muscle-total-row">
              <span>{MUSCLE_LABELS[muscle] ?? muscle}</span>
              <span className="muscle-total-value">{parseFloat(value.toFixed(2))} sets</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No sets logged in this period.</p>
      )}
    </div>
  );
}
