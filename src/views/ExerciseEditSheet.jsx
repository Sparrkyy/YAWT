import { useState } from 'react';
import { renameExercise } from '../data/api';
import { MUSCLE_GROUPS } from '../data/exercises';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back',
  frontDelts: 'Front Delts', sideDelts: 'Side Delts', rearDelts: 'Rear Delts',
  biceps: 'Biceps', triceps: 'Triceps',
  quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', tibialis: 'Tibialis', abs: 'Abs', lowBack: 'Low Back',
};

function fmt(v) {
  return parseFloat(v.toFixed(2)).toString();
}

function findDuplicate(exercises, name, currentId) {
  return exercises.find(e => e.name === name && e.id !== currentId);
}

async function maybeRename(exercise, trimmedName) {
  if (trimmedName !== exercise.name) {
    await renameExercise(exercise.id, trimmedName);
  }
}

export default function ExerciseEditSheet({ exercise, exercises = [], onSave, onClose }) {
  const [draftName, setDraftName] = useState(exercise.name);
  const [draft, setDraft] = useState({ ...exercise.muscles });
  const [nameError, setNameError] = useState('');

  function step(muscle, delta) {
    setDraft(prev => {
      const next = (prev[muscle] ?? 0) + delta;
      const clamped = Math.round(Math.max(0, Math.min(2, next)) * 100) / 100;
      return { ...prev, [muscle]: clamped };
    });
  }

  async function handleSave() {
    const trimmedName = draftName.trim();
    if (!trimmedName) return;
    const duplicate = findDuplicate(exercises, trimmedName, exercise.id);
    if (duplicate) {
      setNameError(`"${trimmedName}" already exists`);
      return;
    }
    setNameError('');
    await maybeRename(exercise, trimmedName);
    await onSave(draft);
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-header">
          <span className="sheet-title">Edit Exercise</span>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        <div className="sheet-body">
          <div className="field" style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
            <label>Exercise Name</label>
            <input
              type="text"
              value={draftName}
              onChange={e => { setDraftName(e.target.value); setNameError(''); }}
              placeholder="Exercise name"
            />
            {nameError
              ? <span className="settings-error">{nameError}</span>
              : <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Renaming updates all historical sets automatically</span>
            }
          </div>

          {MUSCLE_GROUPS.map(muscle => (
            <div key={muscle} className="muscle-row">
              <span className="muscle-label">{MUSCLE_LABELS[muscle]}</span>
              <div className="stepper">
                <button className="stepper-btn" onClick={() => step(muscle, -0.25)}>−</button>
                <span className="stepper-value">{fmt(draft[muscle] ?? 0)}</span>
                <button className="stepper-btn" onClick={() => step(muscle, 0.25)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="sheet-footer">
          <button className="btn-primary" onClick={handleSave} disabled={!draftName.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}
