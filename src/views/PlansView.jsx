import { useState } from 'react';
import { addPlan } from '../data/sheetsApi';
import PlanEditSheet from './PlanEditSheet';

export default function PlansView({ exercises, plans, onPlansChange }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const newPlan = await addPlan({ name: name.trim(), exerciseIds: [] });
    setName('');
    setAdding(false);
    await onPlansChange();
    setEditingPlan(newPlan);
  }

  return (
    <div className="view">
      <div className="exercises-header">
        <h3>Plans</h3>
        <button className="btn-small" onClick={() => setAdding(!adding)}>
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {adding && (
        <form className="add-exercise-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Plan name (e.g. Push Day)"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>
      )}

      {plans.length === 0 && !adding && (
        <p className="empty-state">No plans yet. Tap + Add to create one.</p>
      )}

      <div className="plan-list">
        {plans.map(plan => {
          const count = plan.exerciseIds.length;
          return (
            <button
              key={plan.id}
              className="plan-item tappable"
              onClick={() => setEditingPlan(plan)}
            >
              <span className="plan-name">{plan.name}</span>
              <span className="plan-exercise-count">
                {count === 0 ? 'No exercises' : `${count} exercise${count === 1 ? '' : 's'}`}
              </span>
              <span className="plan-chevron">›</span>
            </button>
          );
        })}
      </div>

      {editingPlan && (
        <PlanEditSheet
          plan={editingPlan}
          exercises={exercises}
          onSave={async (updatedPlan) => {
            await onPlansChange();
            // Re-sync editingPlan to the refreshed list (caller handles state)
            setEditingPlan(null);
          }}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
