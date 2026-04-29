import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import ExercisePickerButton from '../components/ExercisePickerButton';
import ExerciseSelector from '../components/ExerciseSelector';
import Fireworks from '../components/Fireworks';
import SwipeableRow from '../components/SwipeableRow';
import { addSet, deleteSet } from '../data/api';
import UserToggle from '../components/UserToggle';
import {
  getBestSet,
  getLastSet,
  getBestRepsAtWeight,
  isNewPR,
  isNewBestSetEver,
  getRecentNotes,
} from '../data/logUtils';

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
  const ex = exercises.find((e) => e.name === exercise);
  return ex ? ex.id : '';
}

function getActivePlan(plans, id) {
  return plans.find((p) => p.id === id) ?? null;
}

function getVisibleExercises(exercises, plan) {
  return plan ? exercises.filter((ex) => plan.exerciseIds.includes(ex.id)) : exercises;
}

async function fireCelebration(
  label,
  exercise,
  activeUser,
  numWeight,
  numReps,
  today,
  exerciseId,
  notes,
  onSetsChange,
  setLogDraft
) {
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
  setLogDraft((d) => ({ ...d, reps: '', notes: '' }));
  await onSetsChange();
  return label;
}

function captureIfChanged(currentExercise, newExercise, setPrevExercise) {
  if (currentExercise && currentExercise !== newExercise) setPrevExercise(currentExercise);
}

function handleExerciseChange(sets, activeUser, setLogDraft, currentExercise, setPrevExercise) {
  return (newExercise) => {
    captureIfChanged(currentExercise, newExercise, setPrevExercise);
    const last = getLastSet(sets, newExercise, activeUser);
    setLogDraft((d) => ({ ...d, exercise: newExercise, weight: last ? String(last.weight) : '' }));
  };
}

function handleToggleExercise(exercise, prevExercise, sets, activeUser, setLogDraft, setPrevExercise) {
  if (!prevExercise) return;
  setPrevExercise(exercise);
  const last = getLastSet(sets, prevExercise, activeUser);
  setLogDraft((d) => ({ ...d, exercise: prevExercise, weight: last ? String(last.weight) : '' }));
}

function planChipClass(activePlanId, p) {
  return `plan-chip${activePlanId === p.id ? ' active' : ''}`;
}

function selectPlan(plans, planId, exercises, currentExercise, setLogDraft) {
  const plan = getActivePlan(plans, planId);
  if (
    shouldClearExercise(
      plan,
      exercises.find((ex) => ex.name === currentExercise)
    )
  ) {
    setLogDraft((d) => ({ ...d, exercise: '', weight: '' }));
  }
}

function getTodaysSets(sets, today) {
  return sets
    .filter((s) => s.date === today)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function RecentNotes({ sets, exercise, activeUser }) {
  const notes = getRecentNotes(sets, exercise, activeUser);
  if (notes.length === 0) return null;
  return (
    <div className="recent-notes">
      <span className="recent-notes-title">Recent notes</span>
      {notes.map((note, i) => (
        <span key={i} className="recent-note">
          {note}
        </span>
      ))}
    </div>
  );
}

function PlanChips({ plans, activePlanId, onSelect }) {
  if (plans.length === 0) return null;
  return (
    <div className="plan-chips-wrap">
      <div className="plan-chips-label">Plan Filter</div>
      <div className="plan-chips">
        <button
          type="button"
          className={`plan-chip${activePlanId === null ? ' active' : ''}`}
          onClick={() => onSelect(null)}
        >
          All
        </button>
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            className={planChipClass(activePlanId, p)}
            onClick={() => onSelect(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function BarbellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4v16M18 4v16M6 9h12M6 15h12M2 9v6M22 9v6" />
    </svg>
  );
}

function formatSetStats(set) {
  const parts = [];
  if (set.weight) parts.push(`${set.weight} lbs`);
  if (set.reps != null) parts.push(`${set.reps} reps`);
  return parts.join(' × ') || '—';
}

function SetRow({ set, onDelete, showUser }) {
  function handleDelete({ snapBack }) {
    onDelete({ id: set.id, snapBack });
  }
  const stats = showUser
    ? `${set.user} · ${formatSetStats(set)}`
    : formatSetStats(set);
  return (
    <SwipeableRow key={set.id} onDelete={handleDelete}>
      <div className={`set-row ${set.user.toLowerCase()}`}>
        <span className="set-user">{set.user}</span>
        <div className="set-icon"><BarbellIcon /></div>
        <div className="set-content">
          <span className="set-exercise">{set.exercise}</span>
          <span className="set-stats">{stats}</span>
          {set.notes && <span className="set-notes">{set.notes}</span>}
        </div>
        <div className="set-right">
          <span className="set-chevron">›</span>
        </div>
      </div>
    </SwipeableRow>
  );
}

function LogForm({
  exercise,
  reps,
  weight,
  notes,
  visibleExercises,
  useAccordionPicker,
  sets,
  activeUser,
  setLogDraft,
  onSubmit,
  isExerciseReady,
  onExerciseChange,
  prevExercise,
  onToggleExercise,
}) {
  const weightId = 'weight-input';
  const repsId = 'reps-input';
  const notesId = 'notes-input';
  return (
    <form className="log-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="exercise-select">Exercise</label>
        <div className="exercise-field-row">
          {useAccordionPicker ? (
            <ExercisePickerButton
              id="exercise-select"
              exercises={visibleExercises}
              value={exercise}
              onChange={(e) => onExerciseChange(e.target.value)}
            />
          ) : (
            <ExerciseSelector
              id="exercise-select"
              exercises={visibleExercises}
              value={exercise}
              onChange={(e) => onExerciseChange(e.target.value)}
              required
            />
          )}
          {prevExercise && (
            <button
              type="button"
              className="exercise-toggle-btn"
              onClick={onToggleExercise}
              title={`Switch to ${prevExercise}`}
              aria-label={`Switch to ${prevExercise}`}
            >
              ⇄
            </button>
          )}
        </div>
      </div>

      <ExerciseStats sets={sets} exercise={exercise} activeUser={activeUser} weight={weight} />
      <RecentNotes sets={sets} exercise={exercise} activeUser={activeUser} />

      <div className="field-row">
        <div className="field">
          <label htmlFor={weightId}>Weight (lbs)</label>
          <input
            id={weightId}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={weight}
            onChange={(e) => setLogDraft((d) => ({ ...d, weight: e.target.value }))}
            min="0"
            step="0.5"
            required
          />
        </div>
        <div className="field">
          <label htmlFor={repsId}>Reps</label>
          <input
            id={repsId}
            type="number"
            inputMode="numeric"
            placeholder="—"
            value={reps}
            onChange={(e) => setLogDraft((d) => ({ ...d, reps: e.target.value }))}
            min="0"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor={notesId}>Notes</label>
        <input
          id={notesId}
          type="text"
          placeholder="optional"
          value={notes}
          onChange={(e) => setLogDraft((d) => ({ ...d, notes: e.target.value }))}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={!isExerciseReady}>
        Log Set
      </button>
    </form>
  );
}

function TodaysSets({ todaysSets, onSetDelete, multiUser }) {
  if (todaysSets.length === 0) return null;
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
  return (
    <div className="todays-sets">
      <div className="todays-sets-header">TODAY · {today}</div>
      {todaysSets.map((s) => (
        <SetRow key={s.id} set={s} onDelete={onSetDelete} showUser={multiUser} />
      ))}
    </div>
  );
}

function DeleteConfirm({ pendingDelete, onConfirm, onCancel }) {
  if (!pendingDelete) return null;
  return <ConfirmDialog onConfirm={onConfirm} onCancel={onCancel} />;
}

function FireworksCelebration({ label, onDismiss }) {
  if (!label) return null;
  return <Fireworks label={label} onDismiss={onDismiss} />;
}


function ExerciseStats({ sets, exercise, activeUser, weight }) {
  if (!exercise) return null;
  const bestSet = getBestSet(sets, exercise, activeUser);
  const lastSet = getLastSet(sets, exercise, activeUser);
  const bestAtWeight = getBestRepsAtWeight(sets, exercise, activeUser, Number(weight));
  return (
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
        <span className="stat-value">{bestAtWeight ? `${bestAtWeight.reps} reps` : '—'}</span>
      </div>
    </div>
  );
}

export default function LogView({
  exercises,
  plans = [],
  sets,
  onSetsChange,
  activeUser,
  onUserChange,
  logDraft,
  setLogDraft,
  users = [],
  useAccordionPicker = false,
  activePlanId = null,
  onPlanSelect,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [fireworksLabel, setFireworksLabel] = useState(null);
  const [prevExercise, setPrevExercise] = useState(null);
  const { exercise, reps, weight, notes } = logDraft;

  const activePlan = getActivePlan(plans, activePlanId);
  const visibleExercises = getVisibleExercises(exercises, activePlan);
  const today = new Date().toLocaleDateString('en-CA');
  const todaysSets = getTodaysSets(sets, today);

  function handlePlanSelect(planId) {
    onPlanSelect(planId);
    if (planId !== null) {
      selectPlan(plans, planId, exercises, exercise, setLogDraft);
    }
  }

  function handleRequestDelete(id, snapBack) {
    setPendingDelete({ id, snapBack });
  }

  async function handleConfirmDelete() {
    const { id } = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteSet(id);
      onSetsChange();
    } catch {
      /* error dialog shown by transport layer */
    }
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
      const result = await fireCelebration(
        label,
        exercise,
        activeUser,
        numWeight,
        numReps,
        today,
        exerciseId,
        notes,
        onSetsChange,
        setLogDraft
      );
      if (result) setFireworksLabel(result);
    } catch {
      /* error dialog shown by transport layer */
    }
  }

  return (
    <div className="view">
      <UserToggle users={users} activeUser={activeUser} onUserChange={onUserChange} />

      <PlanChips plans={plans} activePlanId={activePlanId} onSelect={handlePlanSelect} />

      <LogForm
        exercise={exercise}
        reps={reps}
        weight={weight}
        notes={notes}
        visibleExercises={visibleExercises}
        useAccordionPicker={useAccordionPicker}
        sets={sets}
        activeUser={activeUser}
        setLogDraft={setLogDraft}
        onSubmit={handleSubmit}
        isExerciseReady={exercise}
        onExerciseChange={handleExerciseChange(sets, activeUser, setLogDraft, exercise, setPrevExercise)}
        prevExercise={prevExercise}
        onToggleExercise={() => handleToggleExercise(exercise, prevExercise, sets, activeUser, setLogDraft, setPrevExercise)}
      />

      <TodaysSets
        todaysSets={todaysSets}
        onSetDelete={({ id, snapBack }) => handleRequestDelete(id, snapBack)}
        multiUser={users.length > 1}
      />
      <DeleteConfirm
        pendingDelete={pendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <FireworksCelebration label={fireworksLabel} onDismiss={() => setFireworksLabel(null)} />
    </div>
  );
}
