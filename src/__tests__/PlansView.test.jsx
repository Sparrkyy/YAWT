import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlansView from '../views/PlansView';

vi.mock('../data/sheetsApi', () => ({
  addPlan: vi.fn(() => Promise.resolve({ id: 'new-plan', name: 'New Plan', exerciseIds: [] })),
  updatePlan: vi.fn(() => Promise.resolve()),
  deletePlan: vi.fn(() => Promise.resolve()),
}));

vi.mock('../views/PlanEditSheet', () => ({
  default: ({ plan, onClose }) => (
    <div data-testid="plan-edit-sheet">
      <span>{plan.name}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const exercises = [
  { id: 'ex-1', name: 'Bench Press', muscles: { chest: 1 }, archived: false },
  { id: 'ex-2', name: 'Squat', muscles: { quads: 1 }, archived: false },
];

const plans = [
  { id: 'plan-1', name: 'Push Day', exerciseIds: ['ex-1'] },
  { id: 'plan-2', name: 'Leg Day', exerciseIds: ['ex-2'] },
];

const defaultProps = {
  exercises,
  plans,
  onPlansChange: vi.fn(() => Promise.resolve()),
};

describe('PlansView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of plans with exercise counts', () => {
    render(<PlansView {...defaultProps} />);
    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('Leg Day')).toBeInTheDocument();
    expect(screen.getAllByText('1 exercise')).toHaveLength(2);
  });

  it('shows empty state when there are no plans', () => {
    render(<PlansView {...defaultProps} plans={[]} />);
    expect(screen.getByText(/No plans yet/)).toBeInTheDocument();
  });

  it('shows add form when + Add is clicked', () => {
    render(<PlansView {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(screen.getByPlaceholderText(/Plan name/)).toBeInTheDocument();
  });

  it('opens PlanEditSheet when a plan is clicked', () => {
    render(<PlansView {...defaultProps} />);
    fireEvent.click(screen.getByText('Push Day'));
    expect(screen.getByTestId('plan-edit-sheet')).toBeInTheDocument();
  });

  it('closes PlanEditSheet when Close is clicked', () => {
    render(<PlansView {...defaultProps} />);
    fireEvent.click(screen.getByText('Push Day'));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('plan-edit-sheet')).not.toBeInTheDocument();
  });

  it('shows plural exercise count correctly', () => {
    const plansWithTwo = [{ id: 'plan-3', name: 'Full Body', exerciseIds: ['ex-1', 'ex-2'] }];
    render(<PlansView {...defaultProps} plans={plansWithTwo} />);
    expect(screen.getByText('2 exercises')).toBeInTheDocument();
  });

  it('shows "No exercises" when plan has no exercises', () => {
    const emptyPlan = [{ id: 'plan-4', name: 'Empty Plan', exerciseIds: [] }];
    render(<PlansView {...defaultProps} plans={emptyPlan} />);
    expect(screen.getByText('No exercises')).toBeInTheDocument();
  });
});
