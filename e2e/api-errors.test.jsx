import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { worker } from './worker';
import App from '../src/App';

describe('API error dialog', () => {
  it('shows error dialog on initial load failure (GET Sets → 500)', async () => {
    worker.use(
      http.get(/spreadsheets\/[^/]+\/values\/Sets/, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/Sheets GET failed/)).toBeInTheDocument();
    expect(screen.getByText('HTTP status: 500')).toBeInTheDocument();
  });

  it('shows error dialog on add set failure (POST append → 500)', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });

    // Fill out the form
    const exerciseSelect = document.querySelector('.log-form select');
    await user.selectOptions(exerciseSelect, 'Bench Press');
    const weightInput = document.querySelector('input[type="number"][step="0.5"]');
    await user.clear(weightInput);
    await user.type(weightInput, '200');

    // Override append to fail
    worker.use(
      http.post(/spreadsheets\/[^/]+\/values\/.*:append/, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    await user.click(screen.getByText('Add Set'));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/Sheets POST failed/)).toBeInTheDocument();
  });

  it('shows 401 re-auth hint', async () => {
    worker.use(
      http.get(/spreadsheets\/[^/]+\/values\/Sets/, () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/session may have expired/)).toBeInTheDocument();
    expect(screen.getByText('HTTP status: 401')).toBeInTheDocument();
  });

  it('dismisses error dialog on OK click', async () => {
    worker.use(
      http.get(/spreadsheets\/[^/]+\/values\/Sets/, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
