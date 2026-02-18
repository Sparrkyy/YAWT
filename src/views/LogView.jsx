import { addSet, deleteSet } from '../data/storage';
import SwipeableRow from '../components/SwipeableRow';

const USERS = ['Ethan', 'Ava'];

export default function LogView({ exercises, sets, onSetsChange, activeUser, onUserChange, logDraft, setLogDraft }) {
  const { exercise, reps, weight, notes } = logDraft;

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  const todaysSets = sets
    .filter(s => s.date === today)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const exerciseSets = sets.filter(s => s.exercise === exercise && s.user === activeUser);

  const lastSet = [...exerciseSets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null;

  const bestSet = exerciseSets
    .filter(s => s.reps != null && s.reps >= 5)
    .sort((a, b) => b.weight - a.weight)[0] ?? null;

  async function handleDelete(id) {
    await deleteSet(id);
    onSetsChange();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!exercise || !weight) return;
    await addSet({
      date: today,
      user: activeUser,
      exercise,
      reps: reps === '' ? null : Number(reps),
      weight: Number(weight),
      notes,
      createdAt: new Date().toISOString(),
    });
    setLogDraft(d => ({ ...d, reps: '', weight: '', notes: '' }));
    onSetsChange();
  }

  return (
    <div className="view">
      <div className="user-toggle">
        {USERS.map(u => (
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
          <select value={exercise} onChange={e => setLogDraft(d => ({ ...d, exercise: e.target.value }))} required>
            <option value="">— select —</option>
            {exercises.map(ex => (
              <option key={ex.name} value={ex.name}>{ex.name}</option>
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
          </div>
        )}

        <div className="field-row">
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
          <div className="field">
            <label>Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={e => setLogDraft(d => ({ ...d, weight: e.target.value }))}
              min="0"
              required
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

        <button type="submit" className="btn-primary">Add Set</button>
      </form>

      {todaysSets.length > 0 && (
        <div className="todays-sets">
          <h3>Today</h3>
          {todaysSets.map(s => (
            <SwipeableRow key={s.id} onDelete={() => handleDelete(s.id)}>
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
    </div>
  );
}
