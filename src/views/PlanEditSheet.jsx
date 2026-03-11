import { useState } from 'react';
import { updatePlan, deletePlan } from '../data/sheetsApi';
import ConfirmDialog from '../components/ConfirmDialog';
import { groupExercises } from '../data/grouping';

export default function PlanEditSheet({ plan, exercises, onSave, onClose }) {
  const [selectedIds, setSelectedIds] = useState(new Set(plan.exerciseIds));
  const [planName, setPlanName] = useState(plan.name);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const visibleExercises = exercises.filter(ex => !ex.archived);
  const groups = groupExercises(visibleExercises);

  function toggleExercise(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updatePlan(plan.id, { name: planName.trim() || plan.name, exerciseIds: [...selectedIds] });
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    await deletePlan(plan.id);
    await onSave();
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-header">
            <input
              className="plan-name-input"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              aria-label="Plan name"
            />
            <button className="sheet-close" onClick={onClose}>✕</button>
          </div>

          <div className="sheet-body">
            {groups.map(({ label, exercises: group }) => (
              <div key={label} className="exercise-group">
                <div className="exercise-group-header">{label}</div>
                {group.map(ex => (
                  <label key={ex.id} className="plan-exercise-row">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(ex.id)}
                      onChange={() => toggleExercise(ex.id)}
                    />
                    <span className="exercise-name">{ex.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>

          <div className="sheet-footer">
            <div className="sheet-footer-row">
              <button
                type="button"
                className="btn-danger"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Plan
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete "${plan.name}"?`}
          message="This cannot be undone."
          confirmLabel="Delete"
          confirmStyle="btn-danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
