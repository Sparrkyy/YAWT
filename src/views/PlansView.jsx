import { useState } from 'react';
import { addPlan } from '../data/api';
import PlanEditSheet from './PlanEditSheet';

function addBtnLabel(adding) { return adding ? 'Cancel' : '+ Add'; }

function exerciseCountLabel(count) {
  if (count === 0) return 'No exercises';
  return `${count} exercise${count === 1 ? '' : 's'}`;
}

function EmptyPlansHint({ adding, plans }) {
  if (plans.length > 0 || adding) return null;
  return <p className="empty-state">No plans yet. Tap + Add to create one.</p>;
}

function AddPlanForm({ adding, name, setName, handleAdd }) {
  if (!adding) return null;
  return (
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
  );
}

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
          {addBtnLabel(adding)}
        </button>
      </div>

      <AddPlanForm adding={adding} name={name} setName={setName} handleAdd={handleAdd} />

      <EmptyPlansHint adding={adding} plans={plans} />

      <div className="plan-list">
        {plans.map(plan => (
          <button
            key={plan.id}
            className="plan-item tappable"
            onClick={() => setEditingPlan(plan)}
          >
            <span className="plan-name">{plan.name}</span>
            <span className="plan-exercise-count">
              {exerciseCountLabel(plan.exerciseIds.length)}
            </span>
            <span className="plan-chevron">›</span>
          </button>
        ))}
      </div>

      {editingPlan && (
        <PlanEditSheet
          plan={editingPlan}
          exercises={exercises}
          onSave={async (updatedPlan) => {
            await onPlansChange();
            setEditingPlan(null);
          }}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
