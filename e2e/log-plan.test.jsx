import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../src/App';

function getExerciseSelect() {
  return document.querySelector('.log-form select');
}

describe('Sticky plan selection', () => {
  async function waitForAppLoad() {
    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });
  }

  it('plan chip stays selected after switching to another tab and back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.click(screen.getByRole('button', { name: 'Push Day' }));

    // Navigate away to History tab
    await user.click(screen.getByRole('button', { name: /history/i }));
    await waitFor(() => expect(screen.queryByText('Add Set')).not.toBeInTheDocument());

    // Navigate back to Log tab
    await user.click(screen.getByRole('button', { name: /log/i }));
    await waitForAppLoad();

    // Push Day chip should still be active
    const pushDayBtn = screen.getByRole('button', { name: 'Push Day' });
    expect(pushDayBtn.className).toContain('active');
  });

  it('exercise list remains filtered after returning from another tab', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    await user.click(screen.getByRole('button', { name: 'Push Day' }));

    await user.click(screen.getByRole('button', { name: /history/i }));
    await user.click(screen.getByRole('button', { name: /log/i }));
    await waitForAppLoad();

    // The exercise select should only show Push Day exercises, not all exercises
    const select = getExerciseSelect();
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.value);
    // Squat is not in Push Day — it should not appear
    expect(options).not.toContain('Squat');
  });

  it('flat list renders when plan has 15 or fewer exercises', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    // Any plan with a short list triggers flat mode — Push Day has 2 exercises in mock data
    await user.click(screen.getByRole('button', { name: 'Push Day' }));

    const select = getExerciseSelect();
    expect(select.querySelector('optgroup')).toBeNull();
  });
});
