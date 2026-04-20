import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoryView from '../views/HistoryView';
import * as api from '../data/api';

vi.mock('../data/api', () => ({ deleteSet: vi.fn(() => Promise.resolve()) }));
vi.mock('../components/SwipeableRow', () => ({
  default: ({ children, onDelete }) => (
    <div>
      {children}
      <button onClick={() => onDelete({ snapBack: vi.fn() })}>swipe-delete</button>
    </div>
  ),
}));

function makeSet(overrides = {}) {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2026-02-19',
    user: 'Ethan',
    exercise: 'Bench Press',
    reps: 8,
    weight: 135,
    notes: '',
    createdAt: '2026-02-19T10:00:00.000Z',
    ...overrides,
  };
}

describe('HistoryView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows empty state when no sets are logged', () => {
    render(<HistoryView sets={[]} onSetsChange={() => {}} />);
    expect(screen.getByText('No sets logged yet.')).toBeInTheDocument();
  });

  it('shows sets grouped under a formatted date heading', () => {
    const sets = [makeSet({ date: '2026-02-16' })];
    render(<HistoryView sets={sets} onSetsChange={() => {}} />);
    expect(screen.getByText(/Feb 16/)).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('shows most recent date first when sets span multiple days', () => {
    const sets = [
      makeSet({ date: '2026-02-10', exercise: 'Squat' }),
      makeSet({ date: '2026-02-19', exercise: 'Bench Press' }),
    ];
    render(<HistoryView sets={sets} onSetsChange={() => {}} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toMatch(/Feb 19/);
    expect(headings[1].textContent).toMatch(/Feb 10/);
  });

  it('does not render the user toggle when users array is empty', () => {
    render(<HistoryView sets={[makeSet()]} onSetsChange={() => {}} users={[]} />);
    expect(screen.queryByRole('button', { name: 'Ethan' })).not.toBeInTheDocument();
  });

  it('renders user toggle buttons when users are provided', () => {
    render(<HistoryView sets={[makeSet()]} onSetsChange={() => {}} users={['Ethan', 'Ava']} />);
    expect(screen.getByRole('button', { name: 'Ethan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ava' })).toBeInTheDocument();
  });

  it('calls onUserChange when a user toggle button is clicked', () => {
    const onUserChange = vi.fn();
    render(
      <HistoryView sets={[makeSet()]} onSetsChange={() => {}} users={['Ethan', 'Ava']} onUserChange={onUserChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ava' }));
    expect(onUserChange).toHaveBeenCalledWith('Ava');
  });

  it('filters sets by activeUser', () => {
    const sets = [
      makeSet({ user: 'Ethan', exercise: 'Bench Press' }),
      makeSet({ user: 'Ava',   exercise: 'Squat' }),
    ];
    render(<HistoryView sets={sets} onSetsChange={() => {}} activeUser="Ava" users={['Ethan', 'Ava']} />);
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('shows filtered-empty state when activeUser has no sets', () => {
    const sets = [makeSet({ user: 'Ethan' })];
    render(<HistoryView sets={sets} onSetsChange={() => {}} activeUser="Ava" users={['Ethan', 'Ava']} />);
    expect(screen.getByText('No sets for Ava.')).toBeInTheDocument();
  });

  it('formats stats as "reps @ weight lbs" when both are present', () => {
    render(<HistoryView sets={[makeSet({ reps: 8, weight: 135 })]} onSetsChange={() => {}} />);
    expect(screen.getByText('8 reps @ 135 lbs')).toBeInTheDocument();
  });

  it('formats stats as "— @ weight lbs" when reps is null', () => {
    render(<HistoryView sets={[makeSet({ reps: null, weight: 135 })]} onSetsChange={() => {}} />);
    expect(screen.getByText('— @ 135 lbs')).toBeInTheDocument();
  });

  it('shows only reps when weight is 0', () => {
    render(<HistoryView sets={[makeSet({ reps: 10, weight: 0 })]} onSetsChange={() => {}} />);
    expect(screen.getByText('10 reps')).toBeInTheDocument();
  });

  it('displays notes when present', () => {
    render(<HistoryView sets={[makeSet({ notes: 'felt strong' })]} onSetsChange={() => {}} />);
    expect(screen.getByText('felt strong')).toBeInTheDocument();
  });

  it('shows confirm dialog after swipe-delete', () => {
    render(<HistoryView sets={[makeSet()]} onSetsChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls deleteSet and onSetsChange when delete is confirmed', async () => {
    const onSetsChange = vi.fn(() => Promise.resolve());
    const set = makeSet();
    render(<HistoryView sets={[set]} onSetsChange={onSetsChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(api.deleteSet).toHaveBeenCalledWith(set.id));
    expect(onSetsChange).toHaveBeenCalled();
  });

  it('dismisses confirm dialog without calling deleteSet when cancel is clicked', async () => {
    render(<HistoryView sets={[makeSet()]} onSetsChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.deleteSet).not.toHaveBeenCalled();
  });
});
