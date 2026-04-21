import { useState } from 'react';
import { addSet, deleteSet } from '../data/api';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';
import Fireworks from '../components/Fireworks';
import {
  getBestSet,
  getLastSet,
  getBestRepsAtWeight,
  isNewPR,
  isNewBestSetEver,
  getRecentNotes,
} from '../data/logUtils';
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

function handleExerciseChange(sets, activeUser, setLogDraft) {
  return (newExercise) => {
    const last = getLastSet(sets, newExercise, activeUser);
    setLogDraft((d) => ({ ...d, exercise: newExercise, weight: last ? String(last.weight) : '' }));
  };
}

function planChipClass(activePlanId, p) {
  return `plan-chip${activePlanId === p.id ? ' active' : ''}`;
}
function userBtnClass(activeUser, u) {
  return `user-btn${activeUser === u ? ' active' : ''}`;
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
  );
}

function SetRow({ set, onDelete }) {
  function handleDelete({ snapBack }) {
    onDelete({ id: set.id, snapBack });
  }
  return (
    <SwipeableRow key={set.id} onDelete={handleDelete}>
      <div className={`set-row ${set.user.toLowerCase()}`}>
        <span className="set-user">{set.user}</span>
        <span className="set-exercise">{set.exercise}</span>
        <span className="set-stats">
          {set.reps != null ? `${set.reps} reps` : '—'}
          {set.weight ? ` @ ${set.weight} lbs` : ''}
        </span>
        {set.notes && <span className="set-notes">{set.notes}</span>}
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
}) {
  return (
    <form className="log-form" onSubmit={onSubmit}>
      <div className="field">
        <label>Exercise</label>
        {useAccordionPicker ? (
          <ExercisePickerButton
            exercises={visibleExercises}
            value={exercise}
            onChange={(e) => handleExerciseChange(sets, activeUser, setLogDraft)(e.target.value)}
          />
        ) : (
          <ExerciseSelector
            exercises={visibleExercises}
            value={exercise}
            onChange={(e) => handleExerciseChange(sets, activeUser, setLogDraft)(e.target.value)}
            required
          />
        )}
      </div>

      <ExerciseStats sets={sets} exercise={exercise} activeUser={activeUser} weight={weight} />
      <RecentNotes sets={sets} exercise={exercise} activeUser={activeUser} />

      <div className="field-row">
        <div className="field">
          <label>Weight (lbs)</label>
          <input
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
          <label>Reps</label>
          <input
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
        <label>Notes</label>
        <input
          type="text"
          placeholder="optional"
          value={notes}
          onChange={(e) => setLogDraft((d) => ({ ...d, notes: e.target.value }))}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={!isExerciseReady}>
        Add Set
      </button>
    </form>
  );
}

function TodaysSets({ todaysSets, onSetDelete }) {
  if (todaysSets.length === 0) return null;
  return (
    <div className="todays-sets">
      <h3>Today</h3>
      {todaysSets.map((s) => (
        <SetRow key={s.id} set={s} onDelete={onSetDelete} />
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
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [fireworksLabel, setFireworksLabel] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const { exercise, reps, weight, notes } = logDraft;

  const activePlan = getActivePlan(plans, activePlanId);
  const visibleExercises = getVisibleExercises(exercises, activePlan);
  const today = new Date().toLocaleDateString('en-CA');
  const todaysSets = getTodaysSets(sets, today);

  function handlePlanSelect(planId) {
    setActivePlanId(planId);
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
      />

      <TodaysSets
        todaysSets={todaysSets}
        onSetDelete={({ id, snapBack }) => handleRequestDelete(id, snapBack)}
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
