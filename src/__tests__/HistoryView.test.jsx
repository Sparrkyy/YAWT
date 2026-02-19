import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryView from '../views/HistoryView';

vi.mock('../data/sheetsApi', () => ({ deleteSet: vi.fn() }));
vi.mock('../components/SwipeableRow', () => ({
  default: ({ children }) => <div>{children}</div>,
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
  it('shows empty state when no sets are logged', () => {
    render(<HistoryView sets={[]} onSetsChange={() => {}} />);
    expect(screen.getByText('No sets logged yet.')).toBeInTheDocument();
  });

  it('shows sets grouped under a formatted date heading', () => {
    const sets = [makeSet({ date: '2026-02-16' })];
    render(<HistoryView sets={sets} onSetsChange={() => {}} />);
    // "Mon, Feb 16" — locale formatting of 2026-02-16
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
    // First heading should be the more recent date (Feb 19)
    expect(headings[0].textContent).toMatch(/Feb 19/);
    expect(headings[1].textContent).toMatch(/Feb 10/);
  });
});
