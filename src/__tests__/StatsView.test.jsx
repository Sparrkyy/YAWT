import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatsView from '../views/StatsView';

vi.mock('../views/BodyDiagram', () => ({ default: () => <div data-testid="body-diagram" /> }));

const TODAY = '2026-02-19';

const exercises = [
  { name: 'Bench Press', muscles: { chest: 1, triceps: 0.5, shoulders: 0.25 } },
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
