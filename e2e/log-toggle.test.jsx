import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../src/App';

function getExerciseSelect() {
  return document.querySelector('.log-form select');
}

function getWeightInput() {
  return document.querySelector('input[type="number"][step="0.5"]');
}

describe('Exercise toggle (superset back button)', () => {
  async function waitForAppLoad() {
    await waitFor(() => {
      expect(screen.getByText('Log Set')).toBeInTheDocument();
    });
  }

  it('does not show toggle button before any exercise change', async () => {
    render(<App />);
    await waitForAppLoad();

    expect(screen.queryByRole('button', { name: /Switch to/i })).not.toBeInTheDocument();
  });

  it('toggle button appears after selecting a second exercise', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Bench Press');
    await user.selectOptions(getExerciseSelect(), 'Squat');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Switch to Bench Press' })).toBeInTheDocument();
    });
  });

  it('toggle button swaps back to previous exercise and updates weight', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Bench Press');
    await waitFor(() => expect(getWeightInput().value).toBe('185'));

    await user.selectOptions(getExerciseSelect(), 'Squat');
    await waitFor(() => expect(getWeightInput().value).toBe('275'));

    const toggleBtn = await screen.findByRole('button', { name: 'Switch to Bench Press' });
    await user.click(toggleBtn);

    await waitFor(() => {
      expect(getExerciseSelect().value).toBe('Bench Press');
      expect(getWeightInput().value).toBe('185');
    });
  });

  it('toggle button is re-pressable to swap back to the other exercise', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Bench Press');
    await user.selectOptions(getExerciseSelect(), 'Squat');

    const toggleToBench = await screen.findByRole('button', { name: 'Switch to Bench Press' });
    await user.click(toggleToBench);

    await waitFor(() => expect(getExerciseSelect().value).toBe('Bench Press'));

    const toggleToSquat = await screen.findByRole('button', { name: 'Switch to Squat' });
    await user.click(toggleToSquat);

    await waitFor(() => expect(getExerciseSelect().value).toBe('Squat'));
  });

  it('selecting a third exercise updates the toggle target', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Bench Press');
    await user.selectOptions(getExerciseSelect(), 'Squat');
    await user.selectOptions(getExerciseSelect(), 'Deadlift');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Switch to Squat' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Switch to Bench Press' })).not.toBeInTheDocument();
    });
  });
});
