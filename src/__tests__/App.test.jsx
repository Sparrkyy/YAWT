import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';

import { getSets, getExercises, getPlans, getMeasurements } from '../data/api';
import { initAuth, signIn } from '../data/auth';

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
  setSheetId: vi.fn(),
  setApiErrorHandler: vi.fn(),
}));

// Mock child views that aren't under test here to keep rendering lightweight
vi.mock('../views/SetupView', () => ({
  default: ({ setupPhase }) => <div data-testid="setup-view">{setupPhase}</div>,
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
