import { useState } from 'react';
import { addExercise, updateExercise } from '../data/api';
import ExerciseEditSheet from './ExerciseEditSheet';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';
import { groupExercises } from '../data/grouping';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back',
  frontDelts: 'Front Delts', sideDelts: 'Side Delts', rearDelts: 'Rear Delts',
  biceps: 'Biceps', triceps: 'Triceps',
  quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', abs: 'Abs', lowBack: 'Low Back',
};

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

  function primaryMuscles(muscles) {
    return Object.entries(muscles)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k]) => MUSCLE_LABELS[k])
      .join(', ');
  }

  const visibleExercises = exercises.filter(ex => !ex.archived);

  return (
    <div className="view">
      <div className="exercises-header">
        <h3>Exercises</h3>
        <button className="btn-small" onClick={() => setAdding(!adding)}>
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {adding && (
        <form className="add-exercise-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>
      )}

      {groupExercises(visibleExercises).map(({ label, exercises: group }) => (
        <div key={label} className="exercise-group">
          <div className="exercise-group-header">{label}</div>
          <div className="exercise-list">
            {group.map(ex => (
              <SwipeableRow key={ex.name} onDelete={({ snapBack }) => handleArchiveRequest(ex, snapBack)}>
                <div className="exercise-item tappable" onClick={() => setEditingExercise(ex)}>
                  <span className="exercise-name">{ex.name}</span>
                  {Object.keys(ex.muscles).length > 0 && (
                    <span className="exercise-muscles">{primaryMuscles(ex.muscles)}</span>
                  )}
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
