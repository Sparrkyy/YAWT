import { useState } from 'react';
import { deleteSet } from '../data/sheetsApi';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';

export default function HistoryView({ sets, onSetsChange }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  if (sets.length === 0) {
    return <div className="view empty-state">No sets logged yet.</div>;
  }

  const byDate = sets.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  function handleRequestDelete(id, snapBack) {
    setPendingDelete({ id, snapBack });
  }

  async function handleConfirmDelete() {
    const { id } = pendingDelete;
    setPendingDelete(null);
    await deleteSet(id);
    onSetsChange();
  }

  function handleCancelDelete() {
    pendingDelete?.snapBack?.();
    setPendingDelete(null);
  }

  return (
    <div className="view">
      {sortedDates.map(date => (
        <div key={date} className="history-day">
          <h3 className="history-date">
            {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })}
          </h3>
          {byDate[date].map(s => (
            <SwipeableRow key={s.id} onDelete={({ snapBack }) => handleRequestDelete(s.id, snapBack)}>
              <div className={`set-row ${s.user?.toLowerCase()}`}>
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
      ))}
      {pendingDelete && (
        <ConfirmDialog onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
}
