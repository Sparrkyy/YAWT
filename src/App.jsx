import { useState, useEffect, useRef } from 'react';
import { initAuth, signIn, signOut, getUserSub, tryRestoreSession, hasStoredSession, trySilentSignIn } from './data/auth';
import { getSets, getExercises, setSheetId } from './data/sheetsApi';
import LogView from './views/LogView';
import HistoryView from './views/HistoryView';
import ExercisesView from './views/ExercisesView';
import StatsView from './views/StatsView';
import SetupView from './views/SetupView';
import SettingsView from './views/SettingsView';
import './App.css';

const TABS = ['Log', 'History', 'Exercises', 'Stats', 'Settings'];

function storageKey(suffix) {
  return `yawt_${suffix}_${getUserSub() ?? 'default'}`;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('Log');
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [sharedExercise, setSharedExercise] = useState('');
  const [userDrafts, setUserDrafts] = useState({});
  const [users, setUsers] = useState([]);
  const [setupPhase, setSetupPhase] = useState(null); // 'sheet' | 'users' | null
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const pendingSheetIdRef = useRef(null); // carries sheet ID from step 1 → step 2 of setup

  // Re-initialize drafts whenever the user list changes
  useEffect(() => {
    setUserDrafts(Object.fromEntries(users.map(u => [u, { reps: '', weight: '', notes: '' }])));
    if (users.length > 0 && !users.includes(activeUser)) {
      setActiveUser(users[0]);
    }
  }, [users]);

  const logDraft = { exercise: sharedExercise, ...(userDrafts[activeUser] ?? { reps: '', weight: '', notes: '' }) };

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
        if (tryRestoreSession()) {
          // Valid token in localStorage — skip sign-in screen entirely
          onSignIn();
        } else if (hasStoredSession()) {
          // Stored token exists but expired — attempt silent GIS re-auth (no popup)
          // If successful, the initAuth callback will call onSignIn()
          // If it fails, resp.error is set and callback returns early → sign-in screen stays
          trySilentSignIn();
        }
        // else: no stored session — show sign-in screen normally
      } else {
        setTimeout(tryInit, 100);
      }
    }
    tryInit();
  }, []);

  async function onSignIn() {
    setSignedIn(true);

    const storedSheetId = localStorage.getItem(storageKey('sheet'));

    if (!storedSheetId) {
      setSetupPhase('sheet');
      return;
    }

    const storedUsers = localStorage.getItem(storageKey('users'));
    if (!storedUsers) {
      setSheetId(storedSheetId);
      setSetupPhase('users');
      return;
    }

    await loadApp(storedSheetId, JSON.parse(storedUsers));
  }

  async function loadApp(id, userList) {
    setSetupPhase(null);
    setSheetId(id);
    setCurrentSheetId(id);
    setUsers(userList);
    setActiveUser(userList[0]);
    setLoading(true);
    try {
      const [fetchedSets, fetchedExercises] = await Promise.all([getSets(), getExercises()]);
      setSets(fetchedSets);
      setExercises(fetchedExercises);
    } finally {
      setLoading(false);
    }
  }

  function handleSheetReady(id) {
    pendingSheetIdRef.current = id;
    localStorage.setItem(storageKey('sheet'), id);
    setSheetId(id);
    setSetupPhase('users');
  }

  async function handleUsersReady(userList) {
    // Prefer the ref (set during step 1 of this session), fall back to localStorage
    const id = pendingSheetIdRef.current ?? localStorage.getItem(storageKey('sheet'));
    localStorage.setItem(storageKey('users'), JSON.stringify(userList));
    await loadApp(id, userList);
  }

  async function refreshSets() {
    setSets(await getSets());
  }

  async function refreshExercises() {
    setExercises(await getExercises());
  }

  async function handleSheetChange(id) {
    setCurrentSheetId(id);
    setSheetId(id);
    localStorage.setItem(storageKey('sheet'), id);
    await Promise.all([refreshSets(), refreshExercises()]);
  }

  function handleUsersChange(newUsers) {
    setUsers(newUsers);
    localStorage.setItem(storageKey('users'), JSON.stringify(newUsers));
  }

  function handleSignOut() {
    signOut();
    setSignedIn(false);
    setSets([]);
    setExercises([]);
    setUsers([]);
    setSetupPhase(null);
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

  if (setupPhase !== null) {
    return (
      <SetupView
        setupPhase={setupPhase}
        onSheetReady={handleSheetReady}
        onUsersReady={handleUsersReady}
      />
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
            users={users}
          />
        )}
        {tab === 'History' && (
          <HistoryView sets={sets} onSetsChange={refreshSets} />
        )}
        {tab === 'Exercises' && (
          <ExercisesView exercises={exercises} onExercisesChange={refreshExercises} />
        )}
        {tab === 'Stats' && (
          <StatsView sets={sets} exercises={exercises} activeUser={activeUser} onUserChange={setActiveUser} users={users} />
        )}
        {tab === 'Settings' && (
          <SettingsView
            currentSheetId={currentSheetId}
            users={users}
            onSheetChange={handleSheetChange}
            onUsersChange={handleUsersChange}
            onSignOut={handleSignOut}
          />
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
              {t === 'Settings' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
