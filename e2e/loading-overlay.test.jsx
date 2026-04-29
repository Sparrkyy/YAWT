import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import App from '../src/App';
import { worker } from './setup';

function getExerciseSelect() {
  return document.querySelector('.log-form select');
}

function getWeightInput() {
  return document.querySelector('input[type="number"][step="0.5"]');
}

describe('Loading overlay', () => {
  async function waitForAppLoad() {
    await waitFor(() => {
      expect(screen.getByText('Log Set')).toBeInTheDocument();
    });
  }

  it('shows loading overlay during add set and hides after', async () => {
    // Add a 200ms delay to the append endpoint so overlay is visible
    worker.use(
      http.post(/sheets\.googleapis\.com\/v4\/spreadsheets\/[^/]+\/values\/.*:append/, async ({ request }) => {
        await delay(200);
        const body = await request.json();
        return HttpResponse.json({
          spreadsheetId: 'mock-sheet-id',
          updates: { updatedRows: body.values?.length ?? 0 },
        });
      }),
    );

    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    const exerciseSelect = getExerciseSelect();
    await user.selectOptions(exerciseSelect, 'Overhead Press');

    const weightInput = getWeightInput();
    await user.clear(weightInput);
    await user.type(weightInput, '135');

    await user.click(screen.getByText('Log Set'));

    // Overlay should appear
    await waitFor(() => {
      expect(document.querySelector('.loading-overlay')).toBeInTheDocument();
    });

    // Overlay should disappear after API call completes + min display time
    await waitFor(() => {
      expect(document.querySelector('.loading-overlay')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows loading overlay during initial data load', async () => {
    worker.resetHandlers();

    worker.use(
      http.get('https://sheets.googleapis.com/v4/spreadsheets/:sheetId/values/Sets!A:I', async () => {
        await delay(2000);
        return HttpResponse.json({ values: [] });
      }),
      http.get('https://sheets.googleapis.com/v4/spreadsheets/:sheetId/values/Exercises!A:D', async () => {
        await delay(2000);
        return HttpResponse.json({ values: [] });
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.loading-overlay')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(document.querySelector('.loading-overlay')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
