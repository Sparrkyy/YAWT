import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ExerciseSelector from '../components/ExerciseSelector';
import { groupExercises } from '../data/grouping';
import { getDateRange, getExerciseProgress, getLastMuscleHitDates } from '../data/statsUtils';
import BodyDiagram from './BodyDiagram';

const MUSCLE_LABELS = {
  chest: 'Chest',
  back: 'Back',
  frontDelts: 'Front Delts',
  sideDelts: 'Side Delts',
  rearDelts: 'Rear Delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Abs',
  lowBack: 'Low Back',
};

function formatDate(dateStr) {
  const [, month, day] = dateStr.split('-');
  return `${month}/${day}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatShortDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

function hasData(active, payload) {
  return active && payload?.length;
}

function CustomTooltip({ active, payload, label }) {
  if (!hasData(active, payload)) return null;
  const { e1rm, reps, weight } = payload[0].payload;
  const breakdown =
    reps != null ? `${weight} lbs × ${reps} reps` : `${weight} lbs (bodyweight/hold)`;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-date">{label}</p>
      <p className="chart-tooltip-e1rm">{e1rm} lbs (e1RM)</p>
      <p className="chart-tooltip-breakdown">{breakdown}</p>
    </div>
  );
}

function mostRecentExercise(sets, user) {
  const userSets = sets.filter((s) => s.user === user);
  if (userSets.length > 0) {
    const mostRecent = [...userSets].sort((a, b) => b.date.localeCompare(a.date))[0];
    return mostRecent.exercise;
  }
  return '';
}

function userBtnClass(activeUser, u) {
  return `user-btn${activeUser === u ? ' active' : ''}`;
}
function periodBtnClass(period, p) {
  return `period-btn${period === p ? ' active' : ''}`;
}

const periodLabels = {
  week: 'This Week',
  month: 'This Month',
  lastMonth: 'Last Month',
  year: 'This Year',
};

function computeEffectiveSets(sets, exercises, period, activeUser) {
  const { start, end } = getDateRange(period);
  const startStr = start.toLocaleDateString('en-CA');
  const endStr = end.toLocaleDateString('en-CA');
  const exMap = Object.fromEntries(exercises.map((ex) => [ex.name, ex]));
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
}

function UserToggle({ users, activeUser, onUserChange }) {
  return (
    <div className="user-toggle">
      {users.map((u) => (
        <button key={u} className={userBtnClass(activeUser, u)} onClick={() => onUserChange(u)}>
          {u}
        </button>
      ))}
    </div>
  );
}

function PeriodSelector({ period, onPeriodChange }) {
  return (
    <div className="period-selector">
      {['week', 'month', 'lastMonth', 'year'].map((p) => (
        <button key={p} className={periodBtnClass(period, p)} onClick={() => onPeriodChange(p)}>
          {periodLabels[p]}
        </button>
      ))}
    </div>
  );
}

function MuscleTotals({ rankedMuscles, weeksInPeriod, period, lastMuscleHit }) {
  if (rankedMuscles.length === 0) {
    return <p className="empty-state">No sets logged in this period.</p>;
  }
  return (
    <div className="muscle-totals">
      {rankedMuscles.map(([muscle, value]) => (
        <div key={muscle} className="muscle-total-row">
          <span className="muscle-name">{MUSCLE_LABELS[muscle] ?? muscle}</span>
          <div className="muscle-right">
            <span className="muscle-total-value">{parseFloat(value.toFixed(2))} sets</span>
            {period !== 'week' && (
              <span className="muscle-avg">~{(value / weeksInPeriod).toFixed(2)}/wk</span>
            )}
            {lastMuscleHit[muscle] && (
              <span className="muscle-last">
                last performed {formatShortDate(lastMuscleHit[muscle])}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExerciseProgress({ progressData, selectedExercise, exercises, onExerciseChange }) {
  return (
    <div className="exercise-progress">
      <h3>Exercise Progress</h3>
      <ExerciseSelector
        exercises={exercises}
        value={selectedExercise}
        onChange={(e) => onExerciseChange(e.target.value)}
        includeArchived
        aria-label="Select exercise"
      />
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
  );
}

export default function StatsView({ sets, exercises, activeUser, onUserChange, users = [] }) {
  const [period, setPeriod] = useState('week');
  const [side, setSide] = useState('front');

  const groupedExercises = useMemo(() => groupExercises(exercises), [exercises]);

  const defaultExercise = useMemo(() => {
    const ex = mostRecentExercise(sets, activeUser);
    return ex ?? groupedExercises[0]?.exercises[0]?.name ?? '';
  }, [sets, activeUser, groupedExercises]);

  const [selectedExercise, setSelectedExercise] = useState(defaultExercise);

  useEffect(() => {
    setSelectedExercise(defaultExercise);
  }, [activeUser]);

  const effectiveSets = useMemo(
    () => computeEffectiveSets(sets, exercises, period, activeUser),
    [sets, exercises, period, activeUser]
  );

  const progressData = useMemo(
    () => getExerciseProgress(sets, selectedExercise, activeUser),
    [sets, selectedExercise, activeUser]
  );

  const weeksInPeriod = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { start, end } = getDateRange(period);
    const effectiveEnd = period === 'lastMonth' ? end : today;
    const elapsedDays = Math.round((effectiveEnd - start) / 86400000) + 1;
    return Math.ceil(elapsedDays / 7);
  }, [period]);

  const lastMuscleHit = useMemo(
    () => getLastMuscleHitDates(sets, exercises, activeUser),
    [sets, exercises, activeUser]
  );

  const rankedMuscles = Object.entries(effectiveSets)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="view">
      <UserToggle users={users} activeUser={activeUser} onUserChange={onUserChange} />
      <PeriodSelector period={period} onPeriodChange={setPeriod} />

      <BodyDiagram effectiveSets={effectiveSets} side={side} onSideChange={setSide} />

      <MuscleTotals
        rankedMuscles={rankedMuscles}
        weeksInPeriod={weeksInPeriod}
        period={period}
        lastMuscleHit={lastMuscleHit}
      />

      <ExerciseProgress
        progressData={progressData}
        selectedExercise={selectedExercise}
        exercises={exercises}
        onExerciseChange={setSelectedExercise}
      />
    </div>
  );
}
