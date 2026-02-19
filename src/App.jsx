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
    <div className={`app${tab === 'Log' ? ` user-${activeUser.toLowerCase()}` : ''}`}>
      <header className="app-header">
        <img src="yawt-icon.svg" className="app-logo-icon" alt="YAWT" />
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
              {t === 'Log' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              )}
              {t === 'History' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              )}
              {t === 'Exercises' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4v16M18 4v16M6 9h12M6 15h12"/>
                  <path d="M2 9v6M22 9v6"/>
                </svg>
              )}
              {t === 'Stats' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                  <line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              )}
            </span>
            <span>{t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
