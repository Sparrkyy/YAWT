import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExercisesView from '../views/ExercisesView';

const addExerciseMock = vi.fn();
const updateExerciseMock = vi.fn();

vi.mock('../data/api', () => ({
  addExercise: (...args) => addExerciseMock(...args),
  updateExercise: (...args) => updateExerciseMock(...args),
  renameExercise: vi.fn(),
}));

vi.mock('../components/SwipeableRow', () => ({
  default: ({ children, onDelete }) => (
    <div>
      {children}
      <button onClick={() => onDelete({ snapBack: vi.fn() })}>Delete</button>
    </div>
  ),
}));

vi.mock('../views/ExerciseEditSheet', () => ({
  default: ({ exercise, onSave, onClose }) => (
    <div data-testid="exercise-edit-sheet">
      <span>{exercise.name}</span>
      <button onClick={() => onSave({})}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

function makeExercise(overrides = {}) {
  return {
    id: 'ex-001',
    name: 'Bench Press',
    muscles: { chest: 1, triceps: 0.5 },
    archived: false,
    ...overrides,
  };
}

describe('ExercisesView', () => {
  beforeEach(() => {
    addExerciseMock.mockImplementation((exercise) =>
      Promise.resolve({ id: 'new-ex-id', ...exercise })
    );
    updateExerciseMock.mockResolvedValue(undefined);
  });

  it('renders only non-archived exercises', () => {
    const exercises = [
      makeExercise({ name: 'Bench Press', archived: false }),
      makeExercise({ name: 'Old Lift', archived: true }),
    ];
    render(<ExercisesView exercises={exercises} onExercisesChange={vi.fn()} />);
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Old Lift')).not.toBeInTheDocument();
  });

  it('auto-opens ExerciseEditSheet after submitting new exercise name', async () => {
    const onExercisesChange = vi.fn().mockResolvedValue(undefined);
    render(<ExercisesView exercises={[]} onExercisesChange={onExercisesChange} />);

    fireEvent.click(screen.getByText('+ Add'));
    fireEvent.change(screen.getByPlaceholderText('Exercise name'), {
      target: { value: 'Pull Up' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByTestId('exercise-edit-sheet')).toBeInTheDocument();
    });
    expect(screen.getByText('Pull Up')).toBeInTheDocument();
  });

  it('calls addExercise with archived: false when adding a new exercise', async () => {
    const onExercisesChange = vi.fn().mockResolvedValue(undefined);
    render(<ExercisesView exercises={[]} onExercisesChange={onExercisesChange} />);

    fireEvent.click(screen.getByText('+ Add'));
    fireEvent.change(screen.getByPlaceholderText('Exercise name'), {
      target: { value: 'Pull Up' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(addExerciseMock).toHaveBeenCalledWith({
        name: 'Pull Up',
        muscles: {},
        archived: false,
      });
    });
  });

  it('shows ConfirmDialog with exercise name when swipe delete is triggered', async () => {
    const exercises = [makeExercise({ name: 'Bench Press' })];
    render(<ExercisesView exercises={exercises} onExercisesChange={vi.fn()} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Archive "Bench Press"?')).toBeInTheDocument();
    });
  });

  it('calls updateExercise with archived: true and onExercisesChange when archive is confirmed', async () => {
    const onExercisesChange = vi.fn();
    const exercises = [makeExercise({ name: 'Bench Press' })];
    render(<ExercisesView exercises={exercises} onExercisesChange={onExercisesChange} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => screen.getByText('Archive "Bench Press"?'));
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));

    await waitFor(() => {
      expect(updateExerciseMock).toHaveBeenCalledWith('ex-001', { archived: true });
    });
    expect(onExercisesChange).toHaveBeenCalled();
  });

  it('calls snapBack and closes dialog when archive is cancelled', async () => {
    const exercises = [makeExercise({ name: 'Bench Press' })];
    render(<ExercisesView exercises={exercises} onExercisesChange={vi.fn()} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => screen.getByText('Archive "Bench Press"?'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText('Archive "Bench Press"?')).not.toBeInTheDocument();
    });
  });

  it('opens ExerciseEditSheet with the exercise when an exercise row is clicked', () => {
    const exercises = [makeExercise({ name: 'Squat' })];
    render(<ExercisesView exercises={exercises} onExercisesChange={vi.fn()} />);

    fireEvent.click(screen.getByText('Squat'));

    expect(screen.getByTestId('exercise-edit-sheet')).toBeInTheDocument();
    expect(screen.getAllByText('Squat').length).toBeGreaterThanOrEqual(1);
  });
});
