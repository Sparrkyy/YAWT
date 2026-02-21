import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogView from '../views/LogView';
import * as logUtils from '../data/logUtils';

vi.mock('../data/sheetsApi', () => ({
  addSet: vi.fn(() => Promise.resolve()),
  deleteSet: vi.fn(),
}));

vi.mock('../components/SwipeableRow', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../components/Fireworks', () => ({
  default: ({ onDismiss }) => (
    <div data-testid="fireworks" onClick={onDismiss}>Fireworks</div>
  ),
}));

const exercises = [
  { name: 'Bench Press', muscles: {} },
  { name: 'Squat', muscles: {} },
];

const defaultProps = {
  exercises,
  sets: [],
  onSetsChange: vi.fn(() => Promise.resolve()),
  activeUser: 'Ethan',
  onUserChange: vi.fn(),
  logDraft: { exercise: 'Bench Press', reps: '10', weight: '135', notes: '' },
  setLogDraft: vi.fn(),
  users: ['Ethan', 'Ava'],
};

describe('LogView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exercise select with options', () => {
    render(<LogView {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('renders user buttons', () => {
    render(<LogView {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Ethan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ava' })).toBeInTheDocument();
  });

  it('does not show fireworks on initial render', () => {
    render(<LogView {...defaultProps} />);
    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument();
  });

  it('shows fireworks after a PR save and dismisses on click', async () => {
    vi.spyOn(logUtils, 'isNewPR').mockReturnValue(true);
    render(<LogView {...defaultProps} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Add Set' }).closest('form'));

    await waitFor(() => {
      expect(screen.getByTestId('fireworks')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('fireworks'));
    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument();
  });

  it('does not show fireworks after a non-PR save', async () => {
    vi.spyOn(logUtils, 'isNewPR').mockReturnValue(false);
    render(<LogView {...defaultProps} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Add Set' }).closest('form'));

    await waitFor(() => {
      expect(defaultProps.onSetsChange).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument();
  });
});
