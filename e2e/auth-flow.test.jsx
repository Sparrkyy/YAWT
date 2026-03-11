import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { clearLocalStorage } from './helpers';
import App from '../src/App';

function getNavButton(name) {
  return screen.getAllByRole('button').find(
    b => b.textContent.trim() === name && b.classList.contains('nav-btn')
  );
}

describe('Auth flow', () => {
  it('shows sign-in screen when no stored session', async () => {
    clearLocalStorage();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });
    expect(screen.getByText('YAWT')).toBeInTheDocument();
    expect(screen.getByText('Yet Another Workout Tracker')).toBeInTheDocument();
  });

  it('skips sign-in and loads app with stored session', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Ethan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ava' })).toBeInTheDocument();
  });

  it('navigates between all tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });

    // Navigate to History
    await user.click(getNavButton('History'));
    await waitFor(() => {
      expect(getNavButton('History').classList.contains('active')).toBe(true);
    });

    // Navigate to Exercises
    await user.click(getNavButton('Exercises'));
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    // Navigate to Plans
    await user.click(getNavButton('Plans'));
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
    });

    // Navigate to Stats
    await user.click(getNavButton('Stats'));
    await waitFor(() => {
      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    // Navigate to Settings
    await user.click(getNavButton('Settings'));
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    // Navigate back to Log
    await user.click(getNavButton('Log'));
    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });
  });
});
