import { useState } from 'react';
import { MUSCLE_GROUPS } from '../data/exercises';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', tibialis: 'Tibialis', abs: 'Abs', rearDelts: 'Rear Delts', lowBack: 'Low Back',
};

function fmt(v) {
  return parseFloat(v.toFixed(2)).toString();
}

export default function ExerciseEditSheet({ exercise, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...exercise.muscles });

  function step(muscle, delta) {
    setDraft(prev => {
      const next = (prev[muscle] ?? 0) + delta;
      const clamped = Math.round(Math.max(0, Math.min(2, next)) * 100) / 100;
      return { ...prev, [muscle]: clamped };
    });
  }

  async function handleSave() {
    await onSave(draft);
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-header">
          <span className="sheet-title">{exercise.name}</span>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        <div className="sheet-body">
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
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
