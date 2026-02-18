import { useState } from 'react';
import { addExercise, updateExercise } from '../data/storage';
import ExerciseEditSheet from './ExerciseEditSheet';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', abs: 'Abs', rearDelts: 'Rear Delts', lowBack: 'Low Back',
};

export default function ExercisesView({ exercises, onExercisesChange }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [editingExercise, setEditingExercise] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await addExercise({ name: name.trim(), muscles: {} });
    setName('');
    setAdding(false);
    onExercisesChange();
  }

  function primaryMuscles(muscles) {
    return Object.entries(muscles)
      .filter(([, v]) => v >= 1)
      .map(([k]) => MUSCLE_LABELS[k])
      .join(', ');
  }

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

      <div className="exercise-list">
        {exercises.map(ex => (
          <div key={ex.name} className="exercise-item tappable" onClick={() => setEditingExercise(ex)}>
            <span className="exercise-name">{ex.name}</span>
            {Object.keys(ex.muscles).length > 0 && (
              <span className="exercise-muscles">{primaryMuscles(ex.muscles)}</span>
            )}
          </div>
        ))}
      </div>

      {editingExercise && (
        <ExerciseEditSheet
          exercise={editingExercise}
          onSave={async (muscles) => {
            await updateExercise(editingExercise.name, { muscles });
            onExercisesChange();
          }}
          onClose={() => setEditingExercise(null)}
        />
      )}
    </div>
  );
}
