import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../src/App';

describe('Exercises view', () => {
  async function navigateToExercises() {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });

    const navButtons = screen.getAllByRole('button');
    const exercisesNav = navButtons.find(b => b.textContent.trim() === 'Exercises' && b.classList.contains('nav-btn'));
    await user.click(exercisesNav);

    await waitFor(() => {
      // Wait for the exercises header to appear (the h3, not the nav button)
      expect(document.querySelector('.exercises-header h3')).toBeInTheDocument();
    });

    return user;
  }

  it('renders exercise list with all non-archived exercises', async () => {
    await navigateToExercises();

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Deadlift')).toBeInTheDocument();
    expect(screen.getByText('Overhead Press')).toBeInTheDocument();
    expect(screen.getByText('Barbell Row')).toBeInTheDocument();
    expect(screen.getByText('Pull Up')).toBeInTheDocument();

    // Archived exercise should NOT be visible
    expect(screen.queryByText('Archived Exercise')).not.toBeInTheDocument();
  });

  it('shows + Add button and opens add form', async () => {
    const user = await navigateToExercises();

    const addBtn = screen.getByText('+ Add');
    expect(addBtn).toBeInTheDocument();

    await user.click(addBtn);

    // Form should appear with input and Add button
    expect(screen.getByPlaceholderText('Exercise name')).toBeInTheDocument();
  });

  it('opens exercise edit sheet when clicking an exercise', async () => {
    const user = await navigateToExercises();

    // Click the exercise name within the exercise list
    const exerciseName = screen.getByText('Bench Press');
    const exerciseItem = exerciseName.closest('.exercise-item');
    await user.click(exerciseItem);

    // Edit sheet should open with muscle weightings
    await waitFor(() => {
      // ExerciseEditSheet renders muscle stepper labels
      expect(document.querySelector('.sheet-overlay')).toBeInTheDocument();
    });
  });

  it('shows muscle tags on exercises that have them', async () => {
    await navigateToExercises();

    // Bench Press has chest, triceps, shoulders muscles defined
    const benchName = screen.getByText('Bench Press');
    const benchItem = benchName.closest('.exercise-item');
    expect(benchItem).not.toBeNull();
    const muscleText = within(benchItem).queryByText(/Chest/);
    expect(muscleText).toBeInTheDocument();
  });
});
