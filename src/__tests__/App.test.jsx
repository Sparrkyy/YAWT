import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

vi.mock('../data/auth', () => ({
  initAuth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getUserSub: vi.fn(() => 'test-user'),
}));

vi.mock('../data/sheetsApi', () => ({
  getSets: vi.fn(() => new Promise(() => {})),    // never resolves
  getExercises: vi.fn(() => new Promise(() => {})), // never resolves
  setSheetId: vi.fn(),
}));

// Mock child views that aren't under test here to keep rendering lightweight
vi.mock('../views/SetupView', () => ({
  default: ({ setupPhase }) => <div data-testid="setup-view">{setupPhase}</div>,
}));

import { initAuth, signIn } from '../data/auth';

let capturedOnSignIn;

beforeEach(() => {
  global.google = { accounts: { oauth2: {} } };
  localStorage.clear();
  vi.clearAllMocks();
  initAuth.mockImplementation((cb) => { capturedOnSignIn = cb; });
});

afterEach(() => {
  delete global.google;
});

describe('App — conditional rendering state machine', () => {
  it('shows sign-in screen after auth loads', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: 'Sign in with Google' })
    ).toBeInTheDocument();
  });

  it('sign-in button calls signIn()', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('no localStorage → sheet phase after onSignIn', async () => {
    render(<App />);
    await act(async () => { capturedOnSignIn(); });
    expect(screen.getByTestId('setup-view')).toHaveTextContent('sheet');
  });

  it('sheet in localStorage but no users → users phase after onSignIn', async () => {
    localStorage.setItem('yawt_sheet_test-user', 'some-id');
    render(<App />);
    await act(async () => { capturedOnSignIn(); });
    expect(screen.getByTestId('setup-view')).toHaveTextContent('users');
  });

  it('both in localStorage → loading state after onSignIn', async () => {
    localStorage.setItem('yawt_sheet_test-user', 'some-id');
    localStorage.setItem('yawt_users_test-user', JSON.stringify(['Ethan']));
    render(<App />);
    await act(async () => { capturedOnSignIn(); });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
