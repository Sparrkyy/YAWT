import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatsView from '../views/StatsView';

vi.mock('../views/BodyDiagram', () => ({ default: () => <div data-testid="body-diagram" /> }));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const TODAY = '2026-02-19';

const exercises = [
  { name: 'Bench Press', muscles: { chest: 1, triceps: 0.5, frontDelts: 0.25 } },
  { name: 'Squat', muscles: { quads: 1, glutes: 0.5, hamstrings: 0.25 } },
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('StatsView', () => {
  it('shows empty state when no sets are logged', () => {
    render(
      <StatsView
        sets={[]}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    expect(screen.getByText('No sets logged in this period.')).toBeInTheDocument();
  });

  it('shows muscle name rows when sets have data', () => {
    const sets = [
      { date: TODAY, user: 'Ethan', exercise: 'Bench Press', reps: 8, weight_lbs: 135 },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    expect(screen.getByText('Chest')).toBeInTheDocument();
  });

  it('renders exercise selector with all exercises listed alphabetically', () => {
    render(
      <StatsView
        sets={[]}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    const select = screen.getByRole('combobox', { name: /select exercise/i });
    expect(select).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(['— select —', 'Bench Press', 'Squat']);
  });

  it('defaults selected exercise to the most recent set for activeUser', () => {
    const sets = [
      { id: '1', date: '2026-02-10', user: 'Ethan', exercise: 'Bench Press', reps: 8, weight: 135, notes: '', createdAt: '' },
      { id: '2', date: '2026-02-19', user: 'Ethan', exercise: 'Squat', reps: 5, weight: 185, notes: '', createdAt: '' },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    const select = screen.getByRole('combobox', { name: /select exercise/i });
    expect(select.value).toBe('Squat');
  });

  it('shows empty state when no sets logged for selected exercise', () => {
    render(
      <StatsView
        sets={[]}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    expect(screen.getByText('No sets logged for this exercise yet.')).toBeInTheDocument();
  });

  it('switches to month period and shows data from this month', () => {
    const sets = [
      { date: TODAY, user: 'Ethan', exercise: 'Bench Press', reps: 8, weight_lbs: 135 },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'This Month' }));
    expect(screen.getByText('Chest')).toBeInTheDocument();
  });

  it('shows muscle-last span with formatted date when a set exists', () => {
    const sets = [
      { date: '2026-02-05', user: 'Ethan', exercise: 'Bench Press', reps: 8, weight: 135, notes: '', createdAt: '' },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
        users={['Ethan', 'Ava']}
      />
    );
    // Switch to month so Feb 5 sets appear in the period
    fireEvent.click(screen.getByRole('button', { name: 'This Month' }));
    // Bench Press hits chest, triceps, and frontDelts — all show "last performed Feb 5"
    const lastSpans = screen.getAllByText('last performed Feb 5');
    expect(lastSpans.length).toBeGreaterThan(0);
    expect(lastSpans[0]).toBeInTheDocument();
  });

  it('shows muscle-avg for month period and hides it for week period', () => {
    const sets = [
      { date: TODAY, user: 'Ethan', exercise: 'Bench Press', reps: 8, weight: 135, notes: '', createdAt: '' },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
        users={['Ethan', 'Ava']}
      />
    );
    // Week period — no avg/wk labels
    expect(screen.queryAllByText(/\/wk/)).toHaveLength(0);

    // Month period — avg/wk labels appear (one per muscle)
    fireEvent.click(screen.getByRole('button', { name: 'This Month' }));
    expect(screen.getAllByText(/\/wk/).length).toBeGreaterThan(0);
  });

  it('renders a "Last Month" period button', () => {
    render(
      <StatsView
        sets={[]}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Last Month' })).toBeInTheDocument();
  });

  it('shows data from last month when Last Month is selected', () => {
    // Jan 15 is in last month (TODAY = 2026-02-19)
    const sets = [
      { date: '2026-01-15', user: 'Ethan', exercise: 'Bench Press', reps: 8, weight: 135, notes: '', createdAt: '' },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    // Default week period: Jan 15 set not visible
    expect(screen.queryByText('Chest')).not.toBeInTheDocument();
    // Click Last Month: Jan set now visible
    fireEvent.click(screen.getByRole('button', { name: 'Last Month' }));
    expect(screen.getByText('Chest')).toBeInTheDocument();
  });

  it('uses elapsed weeks for per-week average (month period)', () => {
    // TODAY = 2026-02-19: 19 days into February → ceil(19/7) = 3 elapsed weeks
    // 1 Bench Press set → chest = 1 → avg = 1/3 → "~0.33/wk"
    const sets = [
      { date: TODAY, user: 'Ethan', exercise: 'Bench Press', reps: 8, weight: 135, notes: '', createdAt: '' },
    ];
    render(
      <StatsView
        sets={sets}
        exercises={exercises}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'This Month' }));
    expect(screen.getByText('~0.33/wk')).toBeInTheDocument();
  });
});
