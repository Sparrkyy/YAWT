import { useState, useEffect } from 'react';
import { getSets, getExercises } from './data/storage';
import LogView from './views/LogView';
import HistoryView from './views/HistoryView';
import ExercisesView from './views/ExercisesView';
import StatsView from './views/StatsView';
import './App.css';

const TABS = ['Log', 'History', 'Exercises', 'Stats'];

export default function App() {
  const [tab, setTab] = useState('Log');
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [activeUser, setActiveUser] = useState('Ethan');
  const [sharedExercise, setSharedExercise] = useState('');
  const [userDrafts, setUserDrafts] = useState({
    Ethan: { reps: '', weight: '', notes: '' },
    Ava:   { reps: '', weight: '', notes: '' },
  });

  const logDraft = { exercise: sharedExercise, ...userDrafts[activeUser] };

  function setLogDraft(updater) {
    const next = typeof updater === 'function' ? updater(logDraft) : updater;
    const { exercise: ex, ...userFields } = next;
    if (ex !== sharedExercise) setSharedExercise(ex);
    setUserDrafts(prev => ({ ...prev, [activeUser]: userFields }));
  }

  useEffect(() => {
    getSets().then(setSets);
    getExercises().then(setExercises);
  }, []);

  async function refreshSets() {
    setSets(await getSets());
  }

  async function refreshExercises() {
    setExercises(await getExercises());
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">YAWT</span>
      </header>

      <main className="app-main">
        {tab === 'Log' && (
          <LogView
            exercises={exercises}
            sets={sets}
            onSetsChange={refreshSets}
            activeUser={activeUser}
            onUserChange={setActiveUser}
            logDraft={logDraft}
            setLogDraft={setLogDraft}
          />
        )}
        {tab === 'History' && (
          <HistoryView sets={sets} onSetsChange={refreshSets} />
        )}
        {tab === 'Exercises' && (
          <ExercisesView exercises={exercises} onExercisesChange={refreshExercises} />
        )}
        {tab === 'Stats' && (
          <StatsView sets={sets} exercises={exercises} activeUser={activeUser} onUserChange={setActiveUser} />
        )}
      </main>

      <nav className="app-nav">
        {TABS.map(t => (
          <button
            key={t}
            className={`nav-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span className="nav-icon">
              {t === 'Log' && '✏️'}
              {t === 'History' && '📋'}
              {t === 'Exercises' && '💪'}
              {t === 'Stats' && '📊'}
            </span>
            <span>{t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
