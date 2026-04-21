import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExerciseSelector from '../components/ExerciseSelector';

const exercises = [
  { name: 'Bench Press', muscles: { chest: 1 }, archived: false },
  { name: 'Squat', muscles: { quads: 1 }, archived: false },
  { name: 'Old Exercise', muscles: { back: 1 }, archived: true },
];

describe('ExerciseSelector', () => {
  it('renders grouped options from exercises array', () => {
    render(<ExerciseSelector exercises={exercises} value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Bench Press' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Squat' })).toBeInTheDocument();
  });

  it('filters out archived exercises by default', () => {
    render(<ExerciseSelector exercises={exercises} value="" onChange={() => {}} />);
    expect(screen.queryByRole('option', { name: 'Old Exercise' })).not.toBeInTheDocument();
  });

  it('shows archived exercises when includeArchived is passed', () => {
    render(<ExerciseSelector exercises={exercises} value="" onChange={() => {}} includeArchived />);
    expect(screen.getByRole('option', { name: 'Old Exercise' })).toBeInTheDocument();
  });

  it('passes extra props to the underlying select', () => {
    render(
      <ExerciseSelector
        exercises={exercises}
        value=""
        onChange={() => {}}
        required
        aria-label="Pick exercise"
      />
    );
    const select = screen.getByRole('combobox', { name: /pick exercise/i });
    expect(select).toBeRequired();
  });
});
