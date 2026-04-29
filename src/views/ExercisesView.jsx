import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import SwipeableRow from '../components/SwipeableRow';
import { addExercise, updateExercise } from '../data/api';
import { groupExercises } from '../data/grouping';
import ExerciseEditSheet from './ExerciseEditSheet';

function BarbellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4v16M18 4v16M6 9h12M6 15h12M2 9v6M22 9v6" />
    </svg>
  );
}

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

function addLabel(adding) {
  return adding ? 'Cancel' : '+ Add';
}

function primaryMuscles(muscles) {
  return Object.entries(muscles)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => MUSCLE_LABELS[k])
    .join(', ');
}

export default function ExercisesView({ exercises, onExercisesChange }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [editingExercise, setEditingExercise] = useState(null);
  const [pendingArchive, setPendingArchive] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const trimmedName = name.trim();
    const newExercise = await addExercise({ name: trimmedName, muscles: {}, archived: false });
    setName('');
    setAdding(false);
    await onExercisesChange();
    setEditingExercise(newExercise);
  }

  function handleArchiveRequest(exercise, snapBack) {
    setPendingArchive({ exercise, snapBack });
  }

  async function handleConfirmArchive() {
    const { exercise } = pendingArchive;
    setPendingArchive(null);
    await updateExercise(exercise.id, { archived: true });
    onExercisesChange();
  }

  function handleCancelArchive() {
    pendingArchive?.snapBack?.();
    setPendingArchive(null);
  }

  const visibleExercises = exercises.filter((ex) => !ex.archived);

  return (
    <div className="view">
      <div className="exercises-header">
        <h3>Exercises</h3>
        <button className="btn-small" onClick={() => setAdding(!adding)}>
          {addLabel(adding)}
        </button>
      </div>

      {adding && (
        <form className="add-exercise-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      )}

      {groupExercises(visibleExercises).map(({ label, exercises: group }) => (
        <div key={label} className="exercise-group">
          <div className="exercise-group-header">{label}</div>
          <div className="exercise-list">
            {group.map((ex) => (
              <SwipeableRow
                key={ex.name}
                onDelete={({ snapBack }) => handleArchiveRequest(ex, snapBack)}
              >
                <div className="exercise-item tappable" onClick={() => setEditingExercise(ex)}>
                  <div className="exercise-item-icon"><BarbellIcon /></div>
                  <div className="exercise-item-content">
                    <span className="exercise-name">{ex.name}</span>
                    {Object.keys(ex.muscles).length > 0 && (
                      <span className="exercise-muscles">{primaryMuscles(ex.muscles)}</span>
                    )}
                  </div>
                </div>
              </SwipeableRow>
            ))}
          </div>
        </div>
      ))}

      {editingExercise && (
        <ExerciseEditSheet
          exercise={editingExercise}
          exercises={exercises}
          onSave={async (muscles) => {
            await updateExercise(editingExercise.id, { muscles });
            onExercisesChange();
          }}
          onClose={() => setEditingExercise(null)}
        />
      )}

      {pendingArchive && (
        <ConfirmDialog
          title={`Archive "${pendingArchive.exercise.name}"?`}
          confirmLabel="Archive"
          confirmStyle="btn-danger"
          onConfirm={handleConfirmArchive}
          onCancel={handleCancelArchive}
        />
      )}
    </div>
  );
}
