import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';

import { getSets, getExercises, getPlans, getMeasurements, addSet } from '../data/api';
import { initAuth, signIn } from '../data/auth';
import { saveOfflineCache, getPendingQueue, enqueuePendingSet } from '../data/offlineStorage';

vi.mock('../data/auth', () => ({
  initAuth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getUserSub: vi.fn(() => 'test-user'),
  tryRestoreSession: vi.fn(() => false),
  hasStoredSession: vi.fn(() => false),
  trySilentSignIn: vi.fn(),
}));

vi.mock('../data/api', () => ({
  DEV_MODE: false,
  getSets: vi.fn(() => new Promise(() => {})), // never resolves
  getExercises: vi.fn(() => new Promise(() => {})), // never resolves
  getPlans: vi.fn(() => new Promise(() => {})), // never resolves
  getMeasurements: vi.fn(() => new Promise(() => {})), // never resolves
  addSet: vi.fn(() => Promise.resolve()),
  setSheetId: vi.fn(),
  setApiErrorHandler: vi.fn(),
}));

// Mock child views that aren't under test here to keep rendering lightweight
vi.mock('../views/SetupView', () => ({
  default: ({ setupPhase }) => <div data-testid="setup-view">{setupPhase}</div>,
}));
vi.mock('../views/OfflineView', () => ({
  default: ({ onSignIn }) => (
    <div data-testid="offline-view">
      <button onClick={onSignIn}>Back to sign-in</button>
    </div>
  ),
}));
vi.mock('../views/LogView', () => ({ default: () => <div data-testid="log-view" /> }));
vi.mock('../views/HistoryView', () => ({ default: () => <div data-testid="history-view" /> }));
vi.mock('../views/ExercisesView', () => ({ default: () => <div data-testid="exercises-view" /> }));
vi.mock('../views/PlansView', () => ({ default: () => <div data-testid="plans-view" /> }));
vi.mock('../views/StatsView', () => ({ default: () => <div data-testid="stats-view" /> }));
vi.mock('../views/MeasurementsView', () => ({
  default: () => <div data-testid="measurements-view" />,
}));
vi.mock('../views/SettingsView', () => ({ default: () => <div data-testid="settings-view" /> }));

let capturedOnSignIn;

beforeEach(() => {
  global.google = { accounts: { oauth2: {} } };
  localStorage.clear();
  vi.resetAllMocks();
  initAuth.mockImplementation((cb) => {
    capturedOnSignIn = cb;
  });
  getSets.mockImplementation(() => new Promise(() => {}));
  getExercises.mockImplementation(() => new Promise(() => {}));
  getPlans.mockImplementation(() => new Promise(() => {}));
  getMeasurements.mockImplementation(() => new Promise(() => {}));
});

afterEach(() => {
  delete global.google;
});

describe('App — loadApp resilience', () => {
  beforeEach(() => {
    localStorage.setItem('yawt_sheet_test-user', 'some-id');
    localStorage.setItem('yawt_users_test-user', JSON.stringify(['Ethan']));
  });

  it('renders the app when all fetches succeed', async () => {
    getSets.mockResolvedValue([]);
    getExercises.mockResolvedValue([]);
    getPlans.mockResolvedValue([]);
    getMeasurements.mockResolvedValue([]);
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByTestId('log-view')).toBeInTheDocument();
  });

  it('renders the app when getMeasurements fails (missing tab)', async () => {
    getSets.mockResolvedValue([]);
    getExercises.mockResolvedValue([]);
    getPlans.mockResolvedValue([]);
    getMeasurements.mockRejectedValue(new Error('Sheets GET failed: HTTP status 400'));
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByTestId('log-view')).toBeInTheDocument();
  });

  it('renders the app when getSets fails', async () => {
    getSets.mockRejectedValue(new Error('400'));
    getExercises.mockResolvedValue([]);
    getPlans.mockResolvedValue([]);
    getMeasurements.mockResolvedValue([]);
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByTestId('log-view')).toBeInTheDocument();
  });

  it('renders the app when all fetches fail', async () => {
    getSets.mockRejectedValue(new Error('400'));
    getExercises.mockRejectedValue(new Error('400'));
    getPlans.mockRejectedValue(new Error('400'));
    getMeasurements.mockRejectedValue(new Error('400'));
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByTestId('log-view')).toBeInTheDocument();
  });
});

describe('App — conditional rendering state machine', () => {
  it('shows sign-in screen after auth loads', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
  });

  it('sign-in button calls signIn()', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('no localStorage → sheet phase after onSignIn', async () => {
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByTestId('setup-view')).toHaveTextContent('sheet');
  });

  it('sheet in localStorage but no users → users phase after onSignIn', async () => {
    localStorage.setItem('yawt_sheet_test-user', 'some-id');
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByTestId('setup-view')).toHaveTextContent('users');
  });

  it('both in localStorage → loading state after onSignIn', async () => {
    localStorage.setItem('yawt_sheet_test-user', 'some-id');
    localStorage.setItem('yawt_users_test-user', JSON.stringify(['Ethan']));
    render(<App />);
    await act(async () => {
      capturedOnSignIn();
    });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});

describe('App — offline mode', () => {
  const EXERCISES = [{ id: 'ex-1', name: 'Bench Press', muscles: {}, archived: false }];

  it('"Use Offline" button is absent when no cache exists', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Use Offline' })).not.toBeInTheDocument();
  });

  it('"Use Offline" button is present when cache exists', () => {
    saveOfflineCache('sub1', EXERCISES, ['Ethan']);
    render(<App />);
    expect(screen.getByRole('button', { name: 'Use Offline' })).toBeInTheDocument();
  });

  it('clicking "Use Offline" renders OfflineView', () => {
    saveOfflineCache('sub1', EXERCISES, ['Ethan']);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Use Offline' }));
    expect(screen.getByTestId('offline-view')).toBeInTheDocument();
  });

  it('OfflineView onSignIn callback returns to sign-in screen', () => {
    saveOfflineCache('sub1', EXERCISES, ['Ethan']);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Use Offline' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to sign-in' }));
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
  });
});

describe('App — syncPendingIfNeeded', () => {
  beforeEach(() => {
    localStorage.setItem('yawt_sheet_test-user', 'some-id');
    localStorage.setItem('yawt_users_test-user', JSON.stringify(['Ethan']));
    getSets.mockResolvedValue([]);
    getExercises.mockResolvedValue([]);
    getPlans.mockResolvedValue([]);
    getMeasurements.mockResolvedValue([]);
  });

  it('calls addSet for each pending set during loadApp', async () => {
    const setA = { exercise: 'Bench Press', exerciseId: 'ex-1', weight: 135, reps: 8 };
    const setB = { exercise: 'Squat', exerciseId: 'ex-2', weight: 225, reps: 5 };
    enqueuePendingSet(setA);
    enqueuePendingSet(setB);
    render(<App />);
    await act(async () => {
      await capturedOnSignIn();
    });
    expect(addSet).toHaveBeenCalledTimes(2);
    expect(addSet).toHaveBeenCalledWith(setA);
    expect(addSet).toHaveBeenCalledWith(setB);
  });

  it('clears the pending queue after sync', async () => {
    enqueuePendingSet({ exercise: 'Squat', weight: 225 });
    render(<App />);
    await act(async () => {
      await capturedOnSignIn();
    });
    expect(getPendingQueue()).toEqual([]);
  });

  it('does not call addSet when the queue is empty', async () => {
    render(<App />);
    await act(async () => {
      await capturedOnSignIn();
    });
    expect(addSet).not.toHaveBeenCalled();
  });

  it('clears the queue even if one addSet call rejects', async () => {
    addSet.mockRejectedValueOnce(new Error('network'));
    enqueuePendingSet({ exercise: 'Bench Press', weight: 135 });
    render(<App />);
    await act(async () => {
      await capturedOnSignIn();
    });
    expect(getPendingQueue()).toEqual([]);
  });
});
