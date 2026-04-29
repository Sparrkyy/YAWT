import { useState } from 'react';
import ExerciseSelector from '../components/ExerciseSelector';
import UserToggle from '../components/UserToggle';
import {
  findCachedUserSub,
  loadCachedExercises,
  loadCachedUsers,
  enqueuePendingSet,
  pendingCount,
} from '../data/offlineStorage';

function parseReps(reps) {
  return reps === '' ? null : Number(reps);
}

function resolveExerciseId(exercises, exercise) {
  const ex = exercises.find((e) => e.name === exercise);
  return ex?.id ?? '';
}

function buildPendingSet(exercise, activeUser, weight, reps, exerciseId) {
  return {
    date: new Date().toLocaleDateString('en-CA'),
    user: activeUser,
    exercise,
    exerciseId,
    reps: parseReps(reps),
    weight: Number(weight),
    notes: '',
    createdAt: new Date().toISOString(),
  };
}

function PendingBadge({ count }) {
  if (count === 0) return null;
  return (
    <p className="offline-pending-badge">
      {count} set{count === 1 ? '' : 's'} pending sync
    </p>
  );
}

export default function OfflineView({ onSignIn }) {
  const sub = findCachedUserSub();
  const exercises = loadCachedExercises(sub) ?? [];
  const users = loadCachedUsers(sub) ?? [];

  const [activeUser, setActiveUser] = useState(users[0] ?? '');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const pending = pendingCount();

  function handleSubmit(e) {
    e.preventDefault();
    const exerciseId = resolveExerciseId(exercises, exercise);
    enqueuePendingSet(buildPendingSet(exercise, activeUser, weight, reps, exerciseId));
    setWeight('');
    setReps('');
  }

  return (
    <div className="app sign-in-screen">
      <div className="sign-in-card">
        <h1 className="app-title">Offline</h1>
        {users.length > 1 && (
          <UserToggle users={users} activeUser={activeUser} onUserChange={setActiveUser} />
        )}
        <form className="log-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="offline-exercise">Exercise</label>
            <ExerciseSelector
              id="offline-exercise"
              exercises={exercises}
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="offline-weight">Weight (lbs)</label>
              <input
                id="offline-weight"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.5"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="offline-reps">Reps</label>
              <input
                id="offline-reps"
                type="number"
                inputMode="numeric"
                placeholder="—"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="0"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={!exercise || !weight}>
            Log Set
          </button>
        </form>
        <PendingBadge count={pending} />
        <button type="button" className="btn-secondary sign-in-btn" onClick={onSignIn}>
          Sign in to sync
        </button>
      </div>
    </div>
  );
}
