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
  { name: 'Bench Press', muscles: { chest: 1, triceps: 0.5, shoulders: 0.25 } },
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
    expect(options.map(o => o.textContent)).toEqual(['Bench Press', 'Squat']);
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
});
