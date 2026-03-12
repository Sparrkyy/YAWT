import { useState } from 'react';
import { addSet, deleteSet } from '../data/sheetsApi';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';
import Fireworks from '../components/Fireworks';
import { getBestSet, getLastSet, getBestRepsAtWeight, isNewPR, isNewBestSetEver } from '../data/logUtils';
import ExerciseSelector from '../components/ExerciseSelector';

export default function LogView({ exercises, plans = [], sets, onSetsChange, activeUser, onUserChange, logDraft, setLogDraft, users = [] }) {
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [fireworksLabel, setFireworksLabel] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const { exercise, reps, weight, notes } = logDraft;

  const activePlan = plans.find(p => p.id === activePlanId) ?? null;
  const visibleExercises = activePlan
    ? exercises.filter(ex => activePlan.exerciseIds.includes(ex.id))
    : exercises;

  function handlePlanSelect(planId) {
    setActivePlanId(planId);
    // Clear exercise if it's not in the newly selected plan
    if (planId !== null) {
      const plan = plans.find(p => p.id === planId);
      const currentEx = exercises.find(ex => ex.name === exercise);
      if (currentEx && plan && !plan.exerciseIds.includes(currentEx.id)) {
        setLogDraft(d => ({ ...d, exercise: '', weight: '' }));
      }
    }
  }

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  const todaysSets = sets
    .filter(s => s.date === today)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const bestSet = getBestSet(sets, exercise, activeUser);
  const lastSet = getLastSet(sets, exercise, activeUser);
  const bestAtWeight = exercise
    ? getBestRepsAtWeight(sets, exercise, activeUser, Number(weight))
    : null;

  function handleRequestDelete(id, snapBack) {
    setPendingDelete({ id, snapBack });
  }

  async function handleConfirmDelete() {
    const { id } = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteSet(id);
      onSetsChange();
    } catch { /* error dialog shown by transport layer */ }
  }

  function handleCancelDelete() {
    pendingDelete?.snapBack?.();
    setPendingDelete(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!exercise || !weight) return;
    setSaving(true);
    // Evaluate celebration status against current sets BEFORE the save
    const numReps = reps === '' ? null : Number(reps);
    const numWeight = Number(weight);
    let label = null;
    if (isNewBestSetEver(sets, exercise, activeUser, numWeight, numReps)) {
      label = 'New Best!';
    } else if (isNewPR(sets, exercise, activeUser, numWeight, numReps)) {
      label = 'New PR!';
    }
    try {
      const selectedExercise = exercises.find(ex => ex.name === exercise);
      await addSet({
        date: today,
        user: activeUser,
        exercise,
        exerciseId: selectedExercise?.id ?? '',
        reps: numReps,
        weight: numWeight,
        notes,
        createdAt: new Date().toISOString(),
      });
      setLogDraft(d => ({ ...d, reps: '', notes: '' }));
      await onSetsChange();
      if (label) setFireworksLabel(label);
    } catch { /* error dialog shown by transport layer */ } finally {
      setSaving(false);
    }
  }

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

      {plans.length > 0 && (
        <div className="plan-chips">
          <button
            type="button"
            className={`plan-chip ${activePlanId === null ? 'active' : ''}`}
            onClick={() => handlePlanSelect(null)}
          >
            All
          </button>
          {plans.map(p => (
            <button
              key={p.id}
              type="button"
              className={`plan-chip ${activePlanId === p.id ? 'active' : ''}`}
              onClick={() => handlePlanSelect(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <form className="log-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Exercise</label>
          <ExerciseSelector
            exercises={visibleExercises}
            value={exercise}
            onChange={e => {
              const newExercise = e.target.value;
              const last = getLastSet(sets, newExercise, activeUser);
              setLogDraft(d => ({ ...d, exercise: newExercise, weight: last ? String(last.weight) : '' }));
            }}
            required
          />
        </div>

        {exercise && (
          <div className="exercise-stats">
            <div className="stat-block">
              <span className="stat-label">Best set (5+ reps)</span>
              <span className="stat-value">
                {bestSet ? `${bestSet.weight} lbs × ${bestSet.reps}` : '—'}
              </span>
            </div>
            <div className="stat-block">
              <span className="stat-label">Last set</span>
              <span className="stat-value">
                {lastSet
                  ? `${lastSet.weight} lbs${lastSet.reps != null ? ` × ${lastSet.reps}` : ''}`
                  : '—'}
              </span>
            </div>
            <div className="stat-block">
              <span className="stat-label">Best at {weight || '0'} lbs</span>
              <span className="stat-value">
                {bestAtWeight ? `${bestAtWeight.reps} reps` : '—'}
              </span>
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label>Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={e => setLogDraft(d => ({ ...d, weight: e.target.value }))}
              min="0"
              step="0.5"
              required
            />
          </div>
          <div className="field">
            <label>Reps</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="—"
              value={reps}
              onChange={e => setLogDraft(d => ({ ...d, reps: e.target.value }))}
              min="0"
            />
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <input
            type="text"
            placeholder="optional"
            value={notes}
            onChange={e => setLogDraft(d => ({ ...d, notes: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving || !exercise}>
          {saving ? 'Saving…' : 'Add Set'}
        </button>
      </form>

      {todaysSets.length > 0 && (
        <div className="todays-sets">
          <h3>Today</h3>
          {todaysSets.map(s => (
            <SwipeableRow key={s.id} onDelete={({ snapBack }) => handleRequestDelete(s.id, snapBack)}>
              <div className={`set-row ${s.user.toLowerCase()}`}>
                <span className="set-user">{s.user}</span>
                <span className="set-exercise">{s.exercise}</span>
                <span className="set-stats">
                  {s.reps != null ? `${s.reps} reps` : '—'}{s.weight ? ` @ ${s.weight} lbs` : ''}
                </span>
                {s.notes && <span className="set-notes">{s.notes}</span>}
              </div>
            </SwipeableRow>
          ))}
        </div>
      )}
      {pendingDelete && (
        <ConfirmDialog onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
      )}
      {fireworksLabel && (
        <Fireworks label={fireworksLabel} onDismiss={() => setFireworksLabel(null)} />
      )}
    </div>
  );
}
