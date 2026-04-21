import { useState, useEffect, useRef } from 'react';
import {
  initAuth,
  signIn,
  signOut,
  getUserSub,
  tryRestoreSession,
  hasStoredSession,
  trySilentSignIn,
} from './data/auth';
import {
  getSets,
  getExercises,
  getPlans,
  getMeasurements,
  setSheetId,
  setApiErrorHandler,
  DEV_MODE,
} from './data/api';
import { setLoadingListener } from './data/loadingTracker';
import { getLastSet, getLastExerciseToday, resolveExerciseOnUserSwitch } from './data/logUtils';
import LogView from './views/LogView';
import HistoryView from './views/HistoryView';
import ExercisesView from './views/ExercisesView';
import PlansView from './views/PlansView';
import StatsView from './views/StatsView';
import SetupView from './views/SetupView';
import SettingsView from './views/SettingsView';
import MeasurementsView from './views/MeasurementsView';
import ErrorDialog from './components/ErrorDialog';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

const TABS = ['Log', 'History', 'Exercises', 'Plans', 'Stats', 'Measurements', 'Settings'];

function getTabIcon(tab) {
  const icons = {
    Log: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    History: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    Exercises: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 4v16M18 4v16M6 9h12M6 15h12M2 9v6M22 9v6" />
      </svg>
    ),
    Plans: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="15" x2="13" y2="15" />
        <polyline points="6 9 7 10 6 11" />
      </svg>
    ),
    Stats: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    Measurements: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12h20" />
        <path d="M6 8v8" />
        <path d="M10 10v4" />
        <path d="M14 10v4" />
        <path d="M18 8v8" />
      </svg>
    ),
    Settings: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };
  return icons[tab];
}

function NavBar({ tab, onTabChange, apiLoading, apiError, onErrorDismiss, onReauth, signOut }) {
  return (
    <div className={`app${tab === 'Log' ? '' : ''}`}>
      <header className="app-header">
        <img src="yawt-icon.svg" className="app-logo-icon" alt="YAWT" />
      </header>
      <main className="app-main">{/* tabs render here */}</main>
      <nav className="app-nav">
        {TABS.map((t) => (
          <button
            key={t}
            className={`nav-btn ${tab === t ? 'active' : ''}`}
            onClick={() => onTabChange(t)}
          >
            <span className="nav-icon">{getTabIcon(t)}</span>
            <span>{t}</span>
          </button>
        ))}
      </nav>
      <LoadingOverlay visible={apiLoading} />
      <ErrorDialog error={apiError} onDismiss={onErrorDismiss} onReauth={onReauth} />
    </div>
  );
}

function storageKey(suffix) {
  return `yawt_${suffix}_${getUserSub() ?? 'default'}`;
}

function fromSettled(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('Log');
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [sharedExercise, setSharedExercise] = useState('');
  const [userDrafts, setUserDrafts] = useState({});
  const [users, setUsers] = useState([]);
  const [setupPhase, setSetupPhase] = useState(null); // 'sheet' | 'users' | null
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [useAccordionPicker, setUseAccordionPicker] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('yawt_darkMode') === 'true');
  const pendingSheetIdRef = useRef(null); // carries sheet ID from step 1 → step 2 of setup

  // Sync dark mode to DOM and localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('yawt_darkMode', String(darkMode));
  }, [darkMode]);

  // Re-initialize drafts whenever the user list changes
  useEffect(() => {
    setUserDrafts(Object.fromEntries(users.map((u) => [u, { reps: '', weight: '', notes: '' }])));
    if (users.length > 0 && !users.includes(activeUser)) {
      setActiveUser(users[0]);
    }
  }, [users]);

  const logDraft = {
    exercise: sharedExercise,
    ...(userDrafts[activeUser] ?? { reps: '', weight: '', notes: '' }),
  };

  function handleUserChange(u) {
    setActiveUser(u);
    const exerciseToUse = resolveExerciseOnUserSwitch(sharedExercise, sets, u);
    if (exerciseToUse && !sharedExercise) setSharedExercise(exerciseToUse);
    if (exerciseToUse) {
      const last = getLastSet(sets, exerciseToUse, u);
      setUserDrafts((prev) => ({
        ...prev,
        [u]: { ...(prev[u] ?? { reps: '', notes: '' }), weight: last ? String(last.weight) : '' },
      }));
    }
  }

  function setLogDraft(updater) {
    const next = typeof updater === 'function' ? updater(logDraft) : updater;
    const { exercise: ex, ...userFields } = next;
    if (ex !== sharedExercise) setSharedExercise(ex);
    setUserDrafts((prev) => ({ ...prev, [activeUser]: userFields }));
  }

  useEffect(() => {
    setApiErrorHandler(setApiError);
    setLoadingListener(setApiLoading);

    if (DEV_MODE) {
      setAuthReady(true);
      setSignedIn(true);
      loadApp('mock-sheet-id', ['Ethan', 'Ava']);
      return;
    }

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
    setUseAccordionPicker(localStorage.getItem(storageKey('exercisePicker')) === 'true');
    setLoading(true);
    try {
      const [setsResult, exercisesResult, plansResult, measurementsResult] =
        await Promise.allSettled([getSets(), getExercises(), getPlans(), getMeasurements()]);
      const fetchedSets = fromSettled(setsResult, []);
      const fetchedExercises = fromSettled(exercisesResult, []);
      const fetchedPlans = fromSettled(plansResult, []);
      setSets(fetchedSets);
      setExercises(fetchedExercises);
      setPlans(fetchedPlans);
      setMeasurements(fromSettled(measurementsResult, []));
      const defaultExercise = getLastExerciseToday(fetchedSets, userList[0]);
      if (defaultExercise) {
        const lastSet = getLastSet(fetchedSets, defaultExercise, userList[0]);
        setSharedExercise(defaultExercise);
        setUserDrafts((prev) => ({
          ...prev,
          [userList[0]]: {
            ...(prev[userList[0]] ?? { reps: '', notes: '' }),
            weight: lastSet ? String(lastSet.weight) : '',
          },
        }));
      }
    } catch {
      /* error dialog shown by transport layer */
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
    try {
      setSets(await getSets());
    } catch {
      /* error dialog shown by transport layer */
    }
  }

  async function refreshExercises() {
    try {
      setExercises(await getExercises());
    } catch {
      /* error dialog shown by transport layer */
    }
  }

  async function refreshPlans() {
    try {
      setPlans(await getPlans());
    } catch {
      /* error dialog shown by transport layer */
    }
  }

  async function refreshMeasurements() {
    try {
      setMeasurements(await getMeasurements());
    } catch {
      /* error dialog shown by transport layer */
    }
  }

  async function handleSheetChange(id) {
    setCurrentSheetId(id);
    setSheetId(id);
    localStorage.setItem(storageKey('sheet'), id);
    await Promise.all([refreshSets(), refreshExercises(), refreshPlans(), refreshMeasurements()]);
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
    setPlans([]);
    setMeasurements([]);
    setUsers([]);
    setSetupPhase(null);
    setSharedExercise('');
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
        <LoadingOverlay visible={apiLoading} />
        <ErrorDialog
          error={apiError}
          onDismiss={() => setApiError(null)}
          onReauth={() => {
            setApiError(null);
            signIn();
          }}
        />
      </div>
    );
  }

  if (setupPhase !== null) {
    return (
      <>
        <SetupView
          setupPhase={setupPhase}
          onSheetReady={handleSheetReady}
          onUsersReady={handleUsersReady}
        />
        <LoadingOverlay visible={apiLoading} />
        <ErrorDialog
          error={apiError}
          onDismiss={() => setApiError(null)}
          onReauth={() => {
            setApiError(null);
            signIn();
          }}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="app sign-in-screen">
        <div className="sign-in-card">
          <span className="loading-spinner" />
          <p>Loading…</p>
        </div>
        <LoadingOverlay visible={apiLoading} />
        <ErrorDialog
          error={apiError}
          onDismiss={() => setApiError(null)}
          onReauth={() => {
            setApiError(null);
            signIn();
          }}
        />
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
            plans={plans}
            sets={sets}
            onSetsChange={refreshSets}
            activeUser={activeUser}
            onUserChange={handleUserChange}
            logDraft={logDraft}
            setLogDraft={setLogDraft}
            users={users}
            useAccordionPicker={useAccordionPicker}
          />
        )}
        {tab === 'History' && (
          <HistoryView
            sets={sets}
            onSetsChange={refreshSets}
            activeUser={activeUser}
            onUserChange={setActiveUser}
            users={users}
          />
        )}
        {tab === 'Exercises' && (
          <ExercisesView exercises={exercises} onExercisesChange={refreshExercises} />
        )}
        {tab === 'Plans' && (
          <PlansView exercises={exercises} plans={plans} onPlansChange={refreshPlans} />
        )}
        {tab === 'Stats' && (
          <StatsView
            sets={sets}
            exercises={exercises}
            activeUser={activeUser}
            onUserChange={setActiveUser}
            users={users}
          />
        )}
        {tab === 'Measurements' && (
          <MeasurementsView
            measurements={measurements}
            onMeasurementsChange={refreshMeasurements}
            activeUser={activeUser}
            onUserChange={setActiveUser}
            users={users}
          />
        )}
        {tab === 'Settings' && (
          <SettingsView
            currentSheetId={currentSheetId}
            users={users}
            onSheetChange={handleSheetChange}
            onUsersChange={handleUsersChange}
            onSignOut={handleSignOut}
            useAccordionPicker={useAccordionPicker}
            onAccordionPickerChange={(val) => {
              setUseAccordionPicker(val);
              localStorage.setItem(storageKey('exercisePicker'), String(val));
            }}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
          />
        )}
      </main>

      <nav className="app-nav">
        {TABS.map((t) => (
          <button
            key={t}
            className={`nav-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span className="nav-icon">{getTabIcon(t)}</span>
            <span>{t}</span>
          </button>
        ))}
      </nav>
      <LoadingOverlay visible={apiLoading} />
      <ErrorDialog
        error={apiError}
        onDismiss={() => setApiError(null)}
        onReauth={() => {
          setApiError(null);
          signIn();
        }}
      />
    </div>
  );
}
