import { useState } from 'react';
import { addMeasurement, deleteMeasurement } from '../data/api';
import { MEASUREMENT_TYPES, MEASUREMENT_GROUPS } from '../data/measurementTypes';
import SwipeableRow from '../components/SwipeableRow';
import ConfirmDialog from '../components/ConfirmDialog';

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}

function filterByUser(measurements, user) {
  return user ? measurements.filter(m => m.user === user) : measurements;
}

function groupByDate(measurements) {
  return measurements.reduce((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});
}

function labelForType(key) {
  return MEASUREMENT_TYPES.find(t => t.key === key)?.label ?? key;
}

function toggleHint(expanded, key) {
  return expanded === key ? null : key;
}

function MaybeHint({ expanded, type, t }) {
  if (expanded !== type.key) return null;
  return (
    <div className="measurement-hint">
      {t.guideFile && (
        <img
          src={`${import.meta.env.BASE_URL}measurement-guides/${t.guideFile}`}
          alt={`How to measure ${t.label}`}
          className="measurement-guide-img"
          loading="lazy"
        />
      )}
      <p className="measurement-hint-text">{t.hint}</p>
    </div>
  );
}

function renderHistorySection(sortedDates, byDate, handleRequestDelete) {
  if (sortedDates.length === 0) {
    return <div className="empty-state">No measurements logged yet.</div>;
  }
  return sortedDates.map(d => (
    <div key={d} className="history-day">
      <h3 className="history-date">
        {new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric'
        })}
      </h3>
      {byDate[d].map(m => (
        <SwipeableRow key={m.id} onDelete={({ snapBack }) => handleRequestDelete(m.id, snapBack)}>
          <div className="set-row">
            <span className="set-exercise">{labelForType(m.type)}</span>
            <span className="set-stats">{m.value} {m.unit}</span>
            {m.notes && <span className="set-notes">{m.notes}</span>}
          </div>
        </SwipeableRow>
      ))}
    </div>
  ));
}

function userBtnClass(activeUser, u) { return `user-btn${activeUser === u ? ' active' : ''}`; }

export default function MeasurementsView({ measurements, onMeasurementsChange, activeUser, onUserChange, users = [] }) {
  const today = new Date().toLocaleDateString('en-CA');
  const [date, setDate] = useState(today);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [expandedHint, setExpandedHint] = useState(null);

  function handleValueChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const entries = MEASUREMENT_TYPES.filter(t => values[t.key] !== undefined && values[t.key] !== '');
    if (entries.length === 0) return;

    setSubmitting(true);
    try {
      await Promise.all(entries.map(t =>
        addMeasurement({
          id: crypto.randomUUID(),
          date,
          user: activeUser,
          type: t.key,
          value: Number(values[t.key]),
          unit: t.unit,
          notes: '',
          createdAt: new Date().toISOString(),
        })
      ));
      setValues({});
      await onMeasurementsChange();
    } catch { /* error dialog shown by transport layer */ } finally {
      setSubmitting(false);
    }
  }

  function handleRequestDelete(id, snapBack) {
    setPendingDelete({ id, snapBack });
  }

  async function handleConfirmDelete() {
    const { id } = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteMeasurement(id);
      onMeasurementsChange();
    } catch { /* error dialog shown by transport layer */ }
  }

  function handleCancelDelete() {
    pendingDelete?.snapBack?.();
    setPendingDelete(null);
  }

  const filtered = filterByUser(measurements, activeUser);
  const byDate = groupByDate(filtered);
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="view">
      {users.length > 0 && (
        <div className="user-toggle">
          {users.map(u => (
            <button key={u} className={userBtnClass(activeUser, u)} onClick={() => onUserChange(u)}>
              {u}
            </button>
          ))}
        </div>
      )}

      <form className="log-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            className="setup-input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {MEASUREMENT_GROUPS.map(group => (
          <div key={group} className="measurement-group">
            <div className="exercise-group-header">{group}</div>
            {MEASUREMENT_TYPES.filter(t => t.group === group).map(t => (
              <div key={t.key}>
                <div className="muscle-row">
                  <div className="measurement-label-row">
                    <span className="muscle-label">{t.label}</span>
                    <button
                      type="button"
                      className="measurement-hint-btn"
                      onClick={() => setExpandedHint(toggleHint(expandedHint, t.key))}
                      aria-label={`Measurement guide for ${t.label}`}
                    >
                      <InfoIcon />
                    </button>
                  </div>
                  <div className="measurement-value-row">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      className="measurement-number-input"
                      placeholder="—"
                      value={values[t.key] ?? ''}
                      onChange={e => handleValueChange(t.key, e.target.value)}
                    />
                    <span className="measurement-unit-label">{t.unit}</span>
                  </div>
                </div>
                <MaybeHint expanded={expandedHint} type={t} t={t} />
              </div>
            ))}
          </div>
        ))}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Log Measurements'}
        </button>
      </form>

      <div className="measurements-history">
        <div className="exercise-group-header" style={{ paddingTop: 4 }}>History</div>
        {renderHistorySection(sortedDates, byDate, handleRequestDelete)}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          message="Delete this measurement?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
