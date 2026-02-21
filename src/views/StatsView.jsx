import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BodyDiagram from './BodyDiagram';
import { getDateRange, getExerciseProgress } from '../data/statsUtils';
import { groupExercises } from '../data/grouping';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', abs: 'Abs', rearDelts: 'Rear Delts', lowBack: 'Low Back',
};

const formatDate = (dateStr) => {
  const [, month, day] = dateStr.split('-');
  return `${month}/${day}`;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { e1rm, reps, weight } = payload[0].payload;
  const breakdown = reps != null ? `${weight} lbs × ${reps} reps` : `${weight} lbs (bodyweight/hold)`;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-date">{label}</p>
      <p className="chart-tooltip-e1rm">{e1rm} lbs (e1RM)</p>
      <p className="chart-tooltip-breakdown">{breakdown}</p>
    </div>
  );
}

export default function StatsView({ sets, exercises, activeUser, onUserChange, users = [] }) {
  const [period, setPeriod] = useState('week');
  const [side, setSide] = useState('front');

  const groupedExercises = useMemo(() => groupExercises(exercises), [exercises]);

  const defaultExercise = useMemo(() => {
    const userSets = sets.filter(s => s.user === activeUser);
    if (userSets.length > 0) {
      const mostRecent = [...userSets].sort((a, b) => b.date.localeCompare(a.date))[0];
      return mostRecent.exercise;
    }
    return groupedExercises[0]?.exercises[0]?.name ?? '';
  }, [sets, activeUser, groupedExercises]);

  const [selectedExercise, setSelectedExercise] = useState(defaultExercise);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSelectedExercise(defaultExercise); }, [activeUser]);

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

  const progressData = useMemo(
    () => getExerciseProgress(sets, selectedExercise, activeUser),
    [sets, selectedExercise, activeUser]
  );

  const rankedMuscles = Object.entries(effectiveSets)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const periodLabels = { week: 'This Week', month: 'This Month', year: 'This Year' };

  return (
    <div className="view">
      <div className="user-toggle">
        {users.map(u => (
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

      <div className="exercise-progress">
        <h3>Exercise Progress</h3>
        <select
          value={selectedExercise}
          onChange={e => setSelectedExercise(e.target.value)}
          aria-label="Select exercise"
        >
          {groupedExercises.map(({ label, exercises: group }) => (
            <optgroup key={label} label={label}>
              {group.map(ex => (
                <option key={ex.name} value={ex.name}>{ex.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis
                label={{ value: 'lbs (e1RM)', angle: -90, position: 'insideLeft', offset: 10 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="e1rm" dot stroke="#4f8ef7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">No sets logged for this exercise yet.</p>
        )}
      </div>
    </div>
  );
}
