import { useState } from 'react';
import { addSet, deleteSet } from '../data/api';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';
import Fireworks from '../components/Fireworks';
import { getBestSet, getLastSet, getBestRepsAtWeight, isNewPR, isNewBestSetEver, getRecentNotes } from '../data/logUtils';
import ExerciseSelector from '../components/ExerciseSelector';
import ExercisePickerButton from '../components/ExercisePickerButton';

function getCelebrationLabel(sets, exercise, user, weight, reps) {
  if (isNewBestSetEver(sets, exercise, user, weight, reps)) return 'New Best!';
  if (isNewPR(sets, exercise, user, weight, reps)) return 'New PR!';
  return null;
}

function shouldClearExercise(plan, currentEx) {
  return currentEx && plan && !plan.exerciseIds.includes(currentEx.id);
}

function parseNumReps(reps) {
  return reps === '' ? null : Number(reps);
}

function isFormReady(exercise, weight) {
  return !!exercise && !!weight;
}

function resolveExerciseId(exercises, exercise) {
  const ex = exercises.find(e => e.name === exercise);
  return ex ? ex.id : '';
}

function getActivePlan(plans, id) { return plans.find(p => p.id === id) ?? null; }

function getVisibleExercises(exercises, plan) {
  return plan ? exercises.filter(ex => plan.exerciseIds.includes(ex.id)) : exercises;
}

async function fireCelebration(label, exercise, activeUser, numWeight, numReps, today, exerciseId, notes, onSetsChange, setLogDraft) {
  await addSet({
    date: today,
    user: activeUser,
    exercise,
    exerciseId,
    reps: numReps,
    weight: numWeight,
    notes,
    createdAt: new Date().toISOString(),
  });
  setLogDraft(d => ({ ...d, reps: '', notes: '' }));
  await onSetsChange();
  return label;
}

function handleExerciseChange(sets, activeUser, setLogDraft) {
  return (newExercise) => {
    const last = getLastSet(sets, newExercise, activeUser);
    setLogDraft(d => ({ ...d, exercise: newExercise, weight: last ? String(last.weight) : '' }));
  };
}

function planChipClass(activePlanId, p) { return `plan-chip${activePlanId === p.id ? ' active' : ''}`; }
function userBtnClass(activeUser, u) { return `user-btn${activeUser === u ? ' active' : ''}`; }

export default function LogView({ exercises, plans = [], sets, onSetsChange, activeUser, onUserChange, logDraft, setLogDraft, users = [], useAccordionPicker = false }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [fireworksLabel, setFireworksLabel] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const { exercise, reps, weight, notes } = logDraft;

  const activePlan = getActivePlan(plans, activePlanId);
  const visibleExercises = getVisibleExercises(exercises, activePlan);

  function handlePlanSelect(planId) {
    setActivePlanId(planId);
    if (planId === null) return;
    const plan = getActivePlan(plans, planId);
    const currentEx = exercises.find(ex => ex.name === exercise);
    if (shouldClearExercise(plan, currentEx)) {
      setLogDraft(d => ({ ...d, exercise: '', weight: '' }));
    }
  }

  const today = new Date().toLocaleDateString('en-CA');

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
    if (!isFormReady(exercise, weight)) return;
    const numReps = parseNumReps(reps);
    const numWeight = Number(weight);
    const label = getCelebrationLabel(sets, exercise, activeUser, numWeight, numReps);
    const exerciseId = resolveExerciseId(exercises, exercise);
    try {
      const result = await fireCelebration(label, exercise, activeUser, numWeight, numReps, today, exerciseId, notes, onSetsChange, setLogDraft);
      if (result) setFireworksLabel(result);
    } catch { /* error dialog shown by transport layer */ }
  }

  return (
    <div className="view">
      <div className="user-toggle">
        {users.map(u => (
          <button key={u} className={userBtnClass(activeUser, u)} onClick={() => onUserChange(u)}>
            {u}
          </button>
        ))}
      </div>

      {plans.length > 0 && (
        <div className="plan-chips">
          <button type="button" className={`plan-chip${activePlanId === null ? ' active' : ''}`} onClick={() => handlePlanSelect(null)}>
            All
          </button>
          {plans.map(p => (
            <button key={p.id} type="button" className={planChipClass(activePlanId, p)} onClick={() => handlePlanSelect(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      <form className="log-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Exercise</label>
          {useAccordionPicker ? (
            <ExercisePickerButton
              exercises={visibleExercises}
              value={exercise}
              onChange={e => handleExerciseChange(sets, activeUser, setLogDraft)(e.target.value)}
            />
          ) : (
            <ExerciseSelector
              exercises={visibleExercises}
              value={exercise}
              onChange={e => handleExerciseChange(sets, activeUser, setLogDraft)(e.target.value)}
              required
            />
          )}
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

        {exercise && (() => {
          const recentNotes = getRecentNotes(sets, exercise, activeUser);
          return recentNotes.length > 0 ? (
            <div className="recent-notes">
              <span className="recent-notes-title">Recent notes</span>
              {recentNotes.map((note, i) => (
                <span key={i} className="recent-note">{note}</span>
              ))}
            </div>
          ) : null;
        })()}

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

        <button type="submit" className="btn-primary" disabled={!exercise}>
          Add Set
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
