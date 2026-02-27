import { useState } from 'react';
import { renameExercise } from '../data/sheetsApi';
import { MUSCLE_GROUPS } from '../data/exercises';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', tibialis: 'Tibialis', abs: 'Abs', rearDelts: 'Rear Delts', lowBack: 'Low Back',
};

function fmt(v) {
  return parseFloat(v.toFixed(2)).toString();
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
    const duplicate = exercises.find(e => e.name === trimmedName && e.id !== exercise.id);
    if (duplicate) {
      setNameError(`"${trimmedName}" already exists`);
      return;
    }
    setNameError('');
    if (trimmedName !== exercise.name) {
      await renameExercise(exercise.id, trimmedName);
    }
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
          <div className="name-field">
            <input
              type="text"
              className="exercise-name-input"
              value={draftName}
              onChange={e => { setDraftName(e.target.value); setNameError(''); }}
              placeholder="Exercise name"
            />
            {nameError && <span className="name-error">{nameError}</span>}
            <span className="name-hint">Renaming updates all historical sets automatically</span>
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
