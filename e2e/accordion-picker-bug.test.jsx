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

  it('expanding an accordion section does not log a set', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForAppLoad();

    // Open picker, select an exercise to fill the form
    const pickerBtn = document.querySelector('.picker-button');
    await user.click(pickerBtn);

    // Expand Chest section and select Bench Press
    const chestHeader = screen.getByText('Chest');
    await user.click(chestHeader);
    const benchItem = document.querySelector('.accordion-item');
    await user.click(benchItem);

    // Fill in weight so the form would succeed if submitted
    const weightInput = document.querySelector('input[type="number"][step="0.5"]');
    await user.clear(weightInput);
    await user.type(weightInput, '200');

    // Count today's sets before interacting with the accordion
    const setsBefore = document.querySelectorAll('.set-row').length;

    // Open picker again and expand a different section — this must NOT submit the form
    const pickerBtnAgain = document.querySelector('.picker-button');
    await user.click(pickerBtnAgain);

    const backHeader = screen.getByText('Back');
    await user.click(backHeader);

    // Close the picker via the close button
    const closeBtn = screen.getByText('✕');
    await user.click(closeBtn);

    // Verify no new set was added
    const setsAfter = document.querySelectorAll('.set-row').length;
    expect(setsAfter).toBe(setsBefore);
  });
});
