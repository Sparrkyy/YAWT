import { useState, useEffect } from 'react';
import { initAuth, signIn, signOut } from './data/auth';
import { getSets, getExercises } from './data/sheetsApi';
import LogView from './views/LogView';
import HistoryView from './views/HistoryView';
import ExercisesView from './views/ExercisesView';
import StatsView from './views/StatsView';
import './App.css';

const TABS = ['Log', 'History', 'Exercises', 'Stats'];

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
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
    // GIS loads async; poll until it's ready then init
    function tryInit() {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        initAuth(onSignIn);
        setAuthReady(true);
      } else {
        setTimeout(tryInit, 100);
      }
    }
    tryInit();
  }, []);

  async function onSignIn() {
    setSignedIn(true);
    setLoading(true);
    try {
      const [fetchedSets, fetchedExercises] = await Promise.all([getSets(), getExercises()]);
      setSets(fetchedSets);
      setExercises(fetchedExercises);
    } finally {
      setLoading(false);
    }
  }

  async function refreshSets() {
    setSets(await getSets());
  }

  async function refreshExercises() {
    setExercises(await getExercises());
  }

  function handleSignOut() {
    signOut();
    setSignedIn(false);
    setSets([]);
    setExercises([]);
  }

  if (!signedIn) {
    return (
      <div className="app sign-in-screen">
        <div className="sign-in-card">
          <h1 className="app-title">YAWT</h1>
          <p className="sign-in-subtitle">Yet Another Workout Tracker</p>
          <button className="btn-primary sign-in-btn" onClick={signIn} disabled={!authReady}>
            {authReady ? 'Sign in with Google' : 'Loading…'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app sign-in-screen">
        <div className="sign-in-card">
          <span className="loading-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">YAWT</span>
        <button className="sign-out-btn" onClick={handleSignOut}>Sign out</button>
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
