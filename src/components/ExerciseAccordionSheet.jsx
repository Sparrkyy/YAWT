import { useState } from 'react';
import { MUSCLE_GROUPS } from '../data/exercises';

const MUSCLE_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', quads: 'Quads',
  hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves',
  tibialis: 'Tibialis', abs: 'Abs', rearDelts: 'Rear Delts', lowBack: 'Low Back',
};

function groupByMuscle(exercises) {
  const map = Object.fromEntries(MUSCLE_GROUPS.map(m => [m, []]));
  for (const ex of exercises) {
    for (const muscle of Object.keys(ex.muscles ?? {})) {
      if (ex.muscles[muscle] > 0 && map[muscle]) {
        map[muscle].push(ex);
      }
    }
  }
  return MUSCLE_GROUPS
    .filter(m => map[m].length > 0)
    .map(m => ({
      key: m,
      label: MUSCLE_LABELS[m] ?? m,
      exercises: [...map[m]].sort((a, b) => (b.muscles[m] - a.muscles[m]) || a.name.localeCompare(b.name)),
    }));
}

export default function ExerciseAccordionSheet({ exercises, value, onSelect, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const visible = exercises.filter(ex => !ex.archived);
  const groups = groupByMuscle(visible);

  function handleSectionToggle(key) {
    setExpandedSection(prev => prev === key ? null : key);
  }

  function handleSelect(name) {
    onSelect(name);
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          <span className="sheet-title">Select Exercise</span>
          <button type="button" className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          {groups.map(({ key, label, exercises: group }) => (
            <div key={key} className="accordion-section">
              <button
                type="button"
                className="accordion-header"
                onClick={() => handleSectionToggle(key)}
              >
                <span className="accordion-chevron">
                  {expandedSection === key ? '▾' : '▸'}
                </span>
                <span className="accordion-label">{label}</span>
                <span className="accordion-count">{group.length}</span>
              </button>
              {expandedSection === key && (
                <div className="accordion-items">
                  {group.map(ex => (
                    <button
                      type="button"
                      key={ex.name}
                      className={`accordion-item${ex.name === value ? ' selected' : ''}`}
                      onClick={() => handleSelect(ex.name)}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
