import { deleteSet } from '../data/storage';

export default function HistoryView({ sets, onSetsChange }) {
  if (sets.length === 0) {
    return <div className="view empty-state">No sets logged yet.</div>;
  }

  const byDate = sets.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  async function handleDelete(id) {
    await deleteSet(id);
    onSetsChange();
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
            <div key={s.id} className={`set-row ${s.user?.toLowerCase()}`}>
              <span className="set-user">{s.user}</span>
              <span className="set-exercise">{s.exercise}</span>
              <span className="set-stats">
                {s.reps != null ? `${s.reps} reps` : '—'} @ {s.weight} lbs
              </span>
              {s.notes && <span className="set-notes">{s.notes}</span>}
              <button className="delete-btn" onClick={() => handleDelete(s.id)} title="Delete">×</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
