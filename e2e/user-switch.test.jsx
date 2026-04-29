import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from '../src/App';
import { MOCK_SETS_ROWS } from './mocks/data';
import { worker } from './worker';

function getExerciseSelect() {
  return document.querySelector('.log-form select');
}

function getWeightInput() {
  return document.querySelector('input[type="number"][step="0.5"]');
}

describe('User switching — exercise preservation', () => {
  async function waitForAppLoad() {
    await waitFor(() => {
      expect(screen.getByText('Log Set')).toBeInTheDocument();
    });
  }

  it('preserves the selected exercise when switching users', async () => {
    // Mock data: Ethan's last today = Squat, Ava's last today = Bench Press.
    // If we select Overhead Press and switch to Ava, the old bug would replace it
    // with Ava's last exercise (Bench Press). The fix keeps Overhead Press.
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Overhead Press');

    await user.click(screen.getByRole('button', { name: 'Ava' }));

    await waitFor(() => {
      expect(getExerciseSelect().value).toBe('Overhead Press');
    });
  });

  it('updates weight to the new user\'s last set for the preserved exercise', async () => {
    // Ethan selects Bench Press (185 lbs). After switching to Ava, the exercise
    // stays at Bench Press but the weight updates to Ava's last (95 lbs).
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Bench Press');
    await waitFor(() => {
      expect(getWeightInput().value).toBe('185');
    });

    await user.click(screen.getByRole('button', { name: 'Ava' }));

    await waitFor(() => {
      expect(getExerciseSelect().value).toBe('Bench Press');
      expect(getWeightInput().value).toBe('95');
    });
  });

  it('clears weight when the new user has no sets for the preserved exercise', async () => {
    // Overhead Press has no sets for either user in mock data → weight should clear.
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.selectOptions(getExerciseSelect(), 'Overhead Press');

    await user.click(screen.getByRole('button', { name: 'Ava' }));

    await waitFor(() => {
      expect(getWeightInput().value).toBe('');
    });
  });

  it('falls back to the new user\'s last exercise today when no exercise is selected', async () => {
    // Override sets so Ethan has NO today-sets (sharedExercise initializes to empty),
    // but Ava has Bench Press today. Switching to Ava should pick up her last exercise.
    worker.use(
      http.get(/spreadsheets\/[^/]+\/values\/Sets/, () => {
        return HttpResponse.json({
          values: [
            MOCK_SETS_ROWS[0], // header
            MOCK_SETS_ROWS[4], // Ethan, Bench Press, yesterday
            MOCK_SETS_ROWS[5], // Ethan, Deadlift, yesterday
            MOCK_SETS_ROWS[3], // Ava, Bench Press, today
            MOCK_SETS_ROWS[6], // Ava, Squat, yesterday
          ],
        });
      }),
    );

    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    // Ethan has no today-sets so no exercise is pre-selected
    expect(getExerciseSelect().value).toBe('');

    await user.click(screen.getByRole('button', { name: 'Ava' }));

    // Falls back to Ava's last exercise today: Bench Press
    await waitFor(() => {
      expect(getExerciseSelect().value).toBe('Bench Press');
      expect(getWeightInput().value).toBe('95');
    });
  });
});
