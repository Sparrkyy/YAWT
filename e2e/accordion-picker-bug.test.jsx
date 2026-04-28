import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../src/App';

describe('Accordion picker does not submit form', () => {
  beforeEach(() => {
    // Enable the accordion picker for this test suite
    localStorage.setItem('yawt_exercisePicker_mock-user-123', 'true');
  });

  async function waitForAppLoad() {
    await waitFor(() => {
      expect(screen.getByText('Add Set')).toBeInTheDocument();
    });
  }

  it('selecting an exercise via the picker does not log a set', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    // Open picker and select Bench Press (flat list — no sections to expand)
    const pickerBtn = document.querySelector('.picker-button');
    await user.click(pickerBtn);

    const benchItem = screen.getByRole('button', { name: 'Bench Press' });
    await user.click(benchItem);

    // Fill in weight so the form would succeed if submitted
    const weightInput = document.querySelector('input[type="number"][step="0.5"]');
    await user.clear(weightInput);
    await user.type(weightInput, '200');

    const setsBefore = document.querySelectorAll('.set-row').length;

    // Open picker again and close it — must NOT submit the form
    const pickerBtnAgain = document.querySelector('.picker-button');
    await user.click(pickerBtnAgain);

    const closeBtn = screen.getByText('✕');
    await user.click(closeBtn);

    const setsAfter = document.querySelectorAll('.set-row').length;
    expect(setsAfter).toBe(setsBefore);
  });
});
