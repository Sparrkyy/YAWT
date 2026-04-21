import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExerciseEditSheet from '../views/ExerciseEditSheet';

const renameExerciseMock = vi.fn();

vi.mock('../data/api', () => ({
  renameExercise: (...args) => renameExerciseMock(...args),
}));

vi.mock('../data/exercises', () => ({
  MUSCLE_GROUPS: ['chest', 'back'],
}));

function makeExercise(overrides = {}) {
  return {
    id: 'ex-001',
    name: 'Bench Press',
    muscles: { chest: 1, back: 0 },
    archived: false,
    ...overrides,
  };
}

function renderSheet(exerciseOverrides = {}, props = {}) {
  const exercise = makeExercise(exerciseOverrides);
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <ExerciseEditSheet
      exercise={exercise}
      exercises={[exercise]}
      onSave={onSave}
      onClose={onClose}
      {...props}
    />
  );
  return { onSave, onClose, exercise };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ExerciseEditSheet', () => {
  it('renders name input pre-filled with exercise name', () => {
    renderSheet();
    expect(screen.getByPlaceholderText('Exercise name')).toHaveValue('Bench Press');
  });

  it('shows the rename hint text', () => {
    renderSheet();
    expect(
      screen.getByText('Renaming updates all historical sets automatically')
    ).toBeInTheDocument();
  });

  it('disables Save button when name input is empty', () => {
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText('Exercise name'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables Save button when name is non-empty', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
  });

  it('does NOT call renameExercise when name is unchanged on save', async () => {
    const { onSave, onClose } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(renameExerciseMock).not.toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });

  it('calls renameExercise with new name when name changed on save', async () => {
    renameExerciseMock.mockResolvedValue(undefined);
    const { onSave, onClose } = renderSheet();
    fireEvent.change(screen.getByPlaceholderText('Exercise name'), {
      target: { value: 'Flat Bench' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(renameExerciseMock).toHaveBeenCalledWith('ex-001', 'Flat Bench');
    expect(onSave).toHaveBeenCalled();
  });

  it('shows inline error when new name duplicates an existing exercise', async () => {
    const exercises = [
      makeExercise({ id: 'ex-001', name: 'Bench Press' }),
      makeExercise({ id: 'ex-002', name: 'Squat' }),
    ];
    render(
      <ExerciseEditSheet
        exercise={exercises[0]}
        exercises={exercises}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Exercise name'), { target: { value: 'Squat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(screen.getByText('"Squat" already exists')).toBeInTheDocument();
    });
    expect(renameExerciseMock).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking the close button', () => {
    const { onClose } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the overlay backdrop', () => {
    const { onClose } = renderSheet();
    const overlay = document.querySelector('.sheet-overlay');
    fireEvent.click(overlay, { target: overlay });
    expect(onClose).toHaveBeenCalled();
  });

  it('increments muscle value when + stepper is clicked', () => {
    renderSheet({ muscles: { chest: 1, back: 0 } });
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    fireEvent.click(plusButtons[0]); // chest +
    expect(screen.getAllByText('1.25')[0]).toBeInTheDocument();
  });

  it('decrements muscle value when − stepper is clicked', () => {
    renderSheet({ muscles: { chest: 1, back: 0 } });
    const minusButtons = screen.getAllByRole('button', { name: '−' });
    fireEvent.click(minusButtons[0]); // chest −
    expect(screen.getAllByText('0.75')[0]).toBeInTheDocument();
  });

  it('clamps muscle value at 0 when decremented below 0', () => {
    renderSheet({ muscles: { chest: 0, back: 0 } });
    const minusButtons = screen.getAllByRole('button', { name: '−' });
    fireEvent.click(minusButtons[0]);
    expect(screen.getAllByText('0')[0]).toBeInTheDocument();
  });

  it('passes updated muscle draft to onSave', async () => {
    const { onSave } = renderSheet({ muscles: { chest: 0, back: 0 } });
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    fireEvent.click(plusButtons[0]); // chest → 0.25
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ chest: 0.25 }))
    );
  });
});
