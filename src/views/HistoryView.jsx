import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import SwipeableRow from '../components/SwipeableRow';
import { deleteSet } from '../data/api';

function formatStats(s) {
  const reps = s.reps != null ? `${s.reps} reps` : '—';
  if (!s.weight) return reps;
  return `${reps} @ ${s.weight} lbs`;
}

function groupByDate(sets) {
  return sets.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
}

function filterSetsByUser(sets, user) {
  return user ? sets.filter((s) => s.user === user) : sets;
}

export default function HistoryView({ sets, onSetsChange, activeUser, onUserChange, users = [] }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  if (sets.length === 0) {
    return <div className="view empty-state">No sets logged yet.</div>;
  }

  const filtered = filterSetsByUser(sets, activeUser);
  const byDate = groupByDate(filtered);
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
    } catch {
      /* error dialog shown by transport layer */
    }
  }

  function handleCancelDelete() {
    pendingDelete?.snapBack?.();
    setPendingDelete(null);
  }

  function userActiveClass(u) {
    return `user-btn${activeUser === u ? ' active' : ''}`;
  }

  function renderUserToggle() {
    if (users.length === 0) return null;
    return (
      <div className="user-toggle">
        {users.map((u) => (
          <button key={u} className={userActiveClass(u)} onClick={() => onUserChange(u)}>
            {u}
          </button>
        ))}
      </div>
    );
  }

  function renderHistory() {
    if (sortedDates.length === 0) {
      return <div className="empty-state">No sets for {activeUser}.</div>;
    }
    return sortedDates.map((date) => (
      <div key={date} className="history-day">
        <h3 className="history-date">
          {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </h3>
        {byDate[date].map((s) => (
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
    ));
  }

  return (
    <div className="view">
      {renderUserToggle()}
      {renderHistory()}
      {pendingDelete && (
        <ConfirmDialog onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
}
