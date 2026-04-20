import { useState } from 'react';
import { deleteSet } from '../data/api';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';

function formatStats(s) {
  const reps = s.reps != null ? `${s.reps} reps` : '—';
  if (!s.weight) return reps;
  return `${reps} @ ${s.weight} lbs`;
}

export default function HistoryView({ sets, onSetsChange, activeUser, onUserChange, users = [] }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  if (sets.length === 0) {
    return <div className="view empty-state">No sets logged yet.</div>;
  }

  const filtered = activeUser ? sets.filter(s => s.user === activeUser) : sets;

  const byDate = filtered.reduce((acc, s) => {
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
    try {
      await deleteSet(id);
      onSetsChange();
    } catch { /* error dialog shown by transport layer */ }
  }

  function handleCancelDelete() {
    pendingDelete?.snapBack?.();
    setPendingDelete(null);
  }

  return (
    <div className="view">
      {users.length > 0 && (
        <div className="user-toggle">
          {users.map(u => (
            <button
              key={u}
              className={`user-btn ${activeUser === u ? 'active' : ''}`}
              onClick={() => onUserChange(u)}
            >
              {u}
            </button>
          ))}
        </div>
      )}

      {sortedDates.length === 0 ? (
        <div className="empty-state">No sets for {activeUser}.</div>
      ) : (
        sortedDates.map(date => (
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
                  <span className="set-stats">{formatStats(s)}</span>
                  {s.notes && <span className="set-notes">{s.notes}</span>}
                </div>
              </SwipeableRow>
            ))}
          </div>
        ))
      )}

      {pendingDelete && (
        <ConfirmDialog onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
}
