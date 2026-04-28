import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

  it('renders flat list (no optgroup) when 15 or fewer exercises', () => {
    const few = Array.from({ length: 15 }, (_, i) => ({
      name: `Exercise ${i + 1}`,
      muscles: { chest: 1 },
      archived: false,
    }));
    const { container } = render(<ExerciseSelector exercises={few} value="" onChange={() => {}} />);
    expect(container.querySelector('optgroup')).toBeNull();
    expect(screen.getAllByRole('option').length).toBe(16); // 15 + "— select —"
  });

  it('renders grouped optgroups when more than 15 exercises', () => {
    const many = Array.from({ length: 16 }, (_, i) => ({
      name: `Exercise ${i + 1}`,
      muscles: { chest: 1 },
      archived: false,
    }));
    const { container } = render(<ExerciseSelector exercises={many} value="" onChange={() => {}} />);
    expect(container.querySelector('optgroup')).not.toBeNull();
  });

  it('flat list is sorted alphabetically', () => {
    const few = [
      { name: 'Squat', muscles: { quads: 1 }, archived: false },
      { name: 'Bench Press', muscles: { chest: 1 }, archived: false },
    ];
    render(<ExerciseSelector exercises={few} value="" onChange={() => {}} />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options.indexOf('Bench Press')).toBeLessThan(options.indexOf('Squat'));
  });
});
