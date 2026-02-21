import { useState } from 'react';
import { addSet, deleteSet } from '../data/sheetsApi';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';
import Fireworks from '../components/Fireworks';
import { groupExercises } from '../data/grouping';
import { getBestSet, getLastSet, getBestRepsAtWeight, isNewPR } from '../data/logUtils';

export default function LogView({ exercises, sets, onSetsChange, activeUser, onUserChange, logDraft, setLogDraft, users = [] }) {
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const { exercise, reps, weight, notes } = logDraft;

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
    await deleteSet(id);
    onSetsChange();
  }

  function handleCancelDelete() {
    pendingDelete?.snapBack?.();
    setPendingDelete(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!exercise || !weight) return;
    setSaving(true);
    // Evaluate PR status against current sets BEFORE the save
    const pr = isNewPR(sets, exercise, activeUser, Number(weight), reps === '' ? null : Number(reps));
    try {
      await addSet({
        date: today,
        user: activeUser,
        exercise,
        reps: reps === '' ? null : Number(reps),
        weight: Number(weight),
        notes,
        createdAt: new Date().toISOString(),
      });
      setLogDraft(d => ({ ...d, reps: '', notes: '' }));
      await onSetsChange();
      if (pr) setShowFireworks(true);
    } finally {
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

      <form className="log-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Exercise</label>
          <select value={exercise} onChange={e => setLogDraft(d => ({ ...d, exercise: e.target.value, weight: '' }))} required>
            <option value="">— select —</option>
            {groupExercises(exercises).map(({ label, exercises: group }) => (
              <optgroup key={label} label={label}>
                {group.map(ex => (
                  <option key={ex.name} value={ex.name}>{ex.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
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

        <button type="submit" className="btn-primary" disabled={saving}>
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
                  {s.reps != null ? `${s.reps} reps` : '—'} @ {s.weight} lbs
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
      {showFireworks && (
        <Fireworks onDismiss={() => setShowFireworks(false)} />
      )}
    </div>
  );
}
