import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OfflineView from '../views/OfflineView';
import {
  saveOfflineCache,
  getPendingQueue,
  clearPendingQueue,
} from '../data/offlineStorage';

const EXERCISES = [
  { id: 'ex-1', name: 'Bench Press', muscles: {}, archived: false },
  { id: 'ex-2', name: 'Squat', muscles: {}, archived: false },
];
const USERS = ['Ethan', 'Ava'];

beforeEach(() => {
  localStorage.clear();
  clearPendingQueue();
  saveOfflineCache('sub1', EXERCISES, USERS);
});

describe('OfflineView — form basics', () => {
  it('renders exercise selector, weight, reps, and Log Set button', () => {
    render(<OfflineView onSignIn={() => {}} />);
    expect(screen.getByLabelText('Exercise')).toBeInTheDocument();
    expect(screen.getByLabelText('Weight (lbs)')).toBeInTheDocument();
    expect(screen.getByLabelText('Reps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log Set' })).toBeInTheDocument();
  });

  it('Log Set is disabled when no exercise is selected', () => {
    render(<OfflineView onSignIn={() => {}} />);
    expect(screen.getByRole('button', { name: 'Log Set' })).toBeDisabled();
  });

  it('Log Set is disabled when exercise is selected but weight is empty', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Bench Press' } });
    expect(screen.getByRole('button', { name: 'Log Set' })).toBeDisabled();
  });

  it('Log Set is enabled when exercise and weight are filled', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '135' } });
    expect(screen.getByRole('button', { name: 'Log Set' })).not.toBeDisabled();
  });
});

describe('OfflineView — user toggle', () => {
  it('shows user toggle when there are multiple users', () => {
    render(<OfflineView onSignIn={() => {}} />);
    expect(screen.getByRole('button', { name: 'Ethan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ava' })).toBeInTheDocument();
  });

  it('does not show user toggle when only one user is cached', () => {
    localStorage.clear();
    saveOfflineCache('sub1', EXERCISES, ['Ethan']);
    render(<OfflineView onSignIn={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Ethan' })).not.toBeInTheDocument();
  });
});

describe('OfflineView — logging sets', () => {
  it('enqueues a set with the correct exerciseId on submit', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '135' } });
    fireEvent.change(screen.getByLabelText('Reps'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log Set' }));
    const queue = getPendingQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].exercise).toBe('Bench Press');
    expect(queue[0].exerciseId).toBe('ex-1');
    expect(queue[0].weight).toBe(135);
    expect(queue[0].reps).toBe(8);
  });

  it('clears weight and reps after submit but keeps exercise selected', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '135' } });
    fireEvent.change(screen.getByLabelText('Reps'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log Set' }));
    expect(screen.getByLabelText('Weight (lbs)').value).toBe('');
    expect(screen.getByLabelText('Reps').value).toBe('');
    expect(screen.getByLabelText('Exercise').value).toBe('Bench Press');
  });

  it('stores reps as null when reps field is empty', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Squat' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '225' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log Set' }));
    expect(getPendingQueue()[0].reps).toBeNull();
  });
});

describe('OfflineView — pending badge', () => {
  it('does not show pending badge when queue is empty', () => {
    render(<OfflineView onSignIn={() => {}} />);
    expect(screen.queryByText(/pending sync/)).toBeNull();
  });

  it('shows "1 set pending sync" after logging one set', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '135' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log Set' }));
    expect(screen.getByText('1 set pending sync')).toBeInTheDocument();
  });

  it('shows "2 sets pending sync" after logging two sets', () => {
    render(<OfflineView onSignIn={() => {}} />);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '135' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log Set' }));
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '145' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log Set' }));
    expect(screen.getByText('2 sets pending sync')).toBeInTheDocument();
  });
});

describe('OfflineView — sign in button', () => {
  it('calls onSignIn when "Sign in to sync" is clicked', () => {
    const onSignIn = vi.fn();
    render(<OfflineView onSignIn={onSignIn} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to sync' }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
