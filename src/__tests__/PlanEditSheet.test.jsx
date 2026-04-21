import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanEditSheet from '../views/PlanEditSheet';
import * as api from '../data/api';

vi.mock('../data/api', () => ({
  updatePlan: vi.fn(() => Promise.resolve()),
  deletePlan: vi.fn(() => Promise.resolve()),
}));

const exercises = [
  { id: 'ex-1', name: 'Bench Press', muscles: { chest: 2 }, archived: false },
  { id: 'ex-2', name: 'Squat', muscles: { quads: 2 }, archived: false },
  { id: 'ex-3', name: 'Old Move', muscles: { chest: 1 }, archived: true },
];

const plan = { id: 'plan-1', name: 'Push Day', exerciseIds: ['ex-1'] };

function renderSheet(overrides = {}) {
  return render(
    <PlanEditSheet
      plan={plan}
      exercises={exercises}
      onSave={vi.fn(() => Promise.resolve())}
      onClose={vi.fn()}
      {...overrides}
    />
  );
}

describe('PlanEditSheet', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pre-fills the plan name input', () => {
    renderSheet();
    expect(screen.getByRole('textbox', { name: /plan name/i })).toHaveValue('Push Day');
  });

  it('does not render archived exercises', () => {
    renderSheet();
    expect(screen.queryByText('Old Move')).not.toBeInTheDocument();
  });

  it('checks the checkbox for exercises already in the plan', () => {
    renderSheet();
    const benchCheckbox = screen.getByRole('checkbox', { name: /bench press/i });
    expect(benchCheckbox).toBeChecked();
  });

  it('unchecks the checkbox for exercises not in the plan', () => {
    renderSheet();
    const squatCheckbox = screen.getByRole('checkbox', { name: /squat/i });
    expect(squatCheckbox).not.toBeChecked();
  });

  it('toggles exercise selection when a checkbox is clicked', () => {
    renderSheet();
    const squatCheckbox = screen.getByRole('checkbox', { name: /squat/i });
    fireEvent.click(squatCheckbox);
    expect(squatCheckbox).toBeChecked();
    fireEvent.click(squatCheckbox);
    expect(squatCheckbox).not.toBeChecked();
  });

  it('calls updatePlan with current name and selected IDs on Save', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    renderSheet({ onSave });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(api.updatePlan).toHaveBeenCalledWith('plan-1', {
        name: 'Push Day',
        exerciseIds: ['ex-1'],
      })
    );
    expect(onSave).toHaveBeenCalled();
  });

  it('uses original name when input is cleared before saving', async () => {
    renderSheet();
    fireEvent.change(screen.getByRole('textbox', { name: /plan name/i }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(api.updatePlan).toHaveBeenCalledWith('plan-1', {
        name: 'Push Day',
        exerciseIds: expect.any(Array),
      })
    );
  });

  it('shows confirm dialog when Delete Plan is clicked', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Plan' }));
    expect(screen.getByText(/Delete "Push Day"/)).toBeInTheDocument();
  });

  it('cancels deletion when dialog Cancel is clicked', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText(/Delete "Push Day"/)).not.toBeInTheDocument();
    expect(api.deletePlan).not.toHaveBeenCalled();
  });

  it('calls deletePlan then onSave on confirm delete', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    renderSheet({ onSave });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(api.deletePlan).toHaveBeenCalledWith('plan-1'));
    expect(onSave).toHaveBeenCalled();
  });

  it('calls onClose when the ✕ button is clicked', () => {
    const onClose = vi.fn();
    renderSheet({ onClose });
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the overlay backdrop is clicked', () => {
    const onClose = vi.fn();
    renderSheet({ onClose });
    fireEvent.click(document.querySelector('.sheet-overlay'));
    expect(onClose).toHaveBeenCalled();
  });
});
