import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../src/App';

function getExerciseSelect() {
  return document.querySelector('.log-form select');
}

function getWeightInput() {
  return document.querySelector('input[type="number"][step="0.5"]');
}

function getRepsInput() {
  return document.querySelector('input[type="number"][inputmode="numeric"]');
}

describe('Log set flow', () => {
  async function waitForAppLoad() {
    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });
  }

  it('shows today\'s sets on load', async () => {
    render(<App />);
    await waitForAppLoad();

    const setExercises = screen.getAllByText('Bench Press');
    expect(setExercises.length).toBeGreaterThanOrEqual(1);
  });

  it('auto-fills weight when selecting an exercise', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Bench Press');

    // Weight should auto-fill from last set (185 for Ethan)
    await waitFor(() => {
      expect(getWeightInput().value).toBe('185');
    });
  });

  it('submits a new set and it appears in today\'s list', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Overhead Press');

    const weightInput = getWeightInput();
    const repsInput = getRepsInput();
    await user.clear(weightInput);
    await user.type(weightInput, '135');
    await user.type(repsInput, '8');

    await user.click(screen.getByText('Add Set'));

    await waitFor(() => {
      const setRows = screen.getAllByText('Overhead Press');
      expect(setRows.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('switches active user and updates weight auto-fill', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Bench Press');

    await waitFor(() => {
      expect(getWeightInput().value).toBe('185');
    });

    // Switch to Ava
    const avaBtn = screen.getByRole('button', { name: 'Ava' });
    await user.click(avaBtn);

    // Ava's last Bench Press weight should be 95
    await waitFor(() => {
      expect(getWeightInput().value).toBe('95');
    });
  });

  it('shows exercise stats when exercise is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Bench Press');

    await waitFor(() => {
      expect(screen.getByText('Best set (5+ reps)')).toBeInTheDocument();
      expect(screen.getByText('Last set')).toBeInTheDocument();
    });
  });

  it('shows recent notes when selecting an exercise with notes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Bench Press');

    await waitFor(() => {
      const notesSection = document.querySelector('.recent-notes');
      expect(notesSection).toBeInTheDocument();
      const notes = notesSection.querySelectorAll('.recent-note');
      expect(notes).toHaveLength(2);
      expect(notes[0].textContent).toBe('keep elbows tucked');
      expect(notes[1].textContent).toBe('shoulder felt tight');
    });
  });

  it('does not show recent notes for an exercise without notes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Deadlift');

    await waitFor(() => {
      expect(screen.getByText('Best set (5+ reps)')).toBeInTheDocument();
    });

    expect(screen.queryByText('Recent notes')).not.toBeInTheDocument();
  });

  it('shows plan filter chips when plans exist', async () => {
    render(<App />);
    await waitForAppLoad();

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('Pull Day')).toBeInTheDocument();
    expect(screen.getByText('Leg Day')).toBeInTheDocument();
  });
});
