import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExerciseAccordionSheet from '../components/ExerciseAccordionSheet';

function makeExercises(count, muscle = 'chest') {
  return Array.from({ length: count }, (_, i) => ({
    name: `Exercise ${String.fromCharCode(65 + i)}`,
    muscles: { [muscle]: 1 },
    archived: false,
  }));
}

describe('ExerciseAccordionSheet', () => {
  it('renders flat list (no accordion headers) when 15 or fewer exercises', () => {
    const exercises = makeExercises(15);
    render(
      <ExerciseAccordionSheet exercises={exercises} value="" onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(document.querySelector('.accordion-header')).toBeNull();
    expect(screen.getAllByRole('button', { name: /Exercise/ }).length).toBe(15);
  });

  it('renders grouped accordion when more than 15 exercises', () => {
    const exercises = makeExercises(16);
    render(
      <ExerciseAccordionSheet exercises={exercises} value="" onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(document.querySelector('.accordion-header')).not.toBeNull();
  });

  it('flat list is sorted alphabetically', () => {
    const exercises = [
      { name: 'Squat', muscles: { quads: 1 }, archived: false },
      { name: 'Bench Press', muscles: { chest: 1 }, archived: false },
    ];
    render(
      <ExerciseAccordionSheet exercises={exercises} value="" onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button', { name: /Bench Press|Squat/ });
    expect(buttons[0].textContent).toBe('Bench Press');
    expect(buttons[1].textContent).toBe('Squat');
  });

  it('selected exercise gets the selected class in flat mode', () => {
    const exercises = [
      { name: 'Bench Press', muscles: { chest: 1 }, archived: false },
      { name: 'Squat', muscles: { quads: 1 }, archived: false },
    ];
    render(
      <ExerciseAccordionSheet
        exercises={exercises}
        value="Bench Press"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );
    const btn = screen.getByRole('button', { name: 'Bench Press' });
    expect(btn.className).toContain('selected');
  });

  it('calls onSelect and onClose when a flat-mode item is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const exercises = [{ name: 'Bench Press', muscles: { chest: 1 }, archived: false }];
    render(
      <ExerciseAccordionSheet exercises={exercises} value="" onSelect={onSelect} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Bench Press' }));
    expect(onSelect).toHaveBeenCalledWith('Bench Press');
    expect(onClose).toHaveBeenCalled();
  });

  it('excludes archived exercises in flat mode', () => {
    const exercises = [
      { name: 'Bench Press', muscles: { chest: 1 }, archived: false },
      { name: 'Old Move', muscles: { chest: 1 }, archived: true },
    ];
    render(
      <ExerciseAccordionSheet exercises={exercises} value="" onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: 'Old Move' })).toBeNull();
  });
});
