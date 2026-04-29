import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../src/App';

describe('Stats view', () => {
  async function navigateToStats() {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Log Set')).toBeInTheDocument();
    });

    const navButtons = screen.getAllByRole('button');
    const statsNav = navButtons.find(b => b.textContent.trim() === 'Stats' && b.classList.contains('nav-btn'));
    await user.click(statsNav);

    await waitFor(() => {
      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    return user;
  }

  it('renders period selector with all options', async () => {
    await navigateToStats();

    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Last Month')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
  });

  it('shows muscle totals for the selected period', async () => {
    await navigateToStats();

    // With mock data having sets today, muscle totals should appear
    await waitFor(() => {
      const muscleRows = screen.queryAllByText(/sets$/);
      expect(muscleRows.length).toBeGreaterThan(0);
    });
  });

  it('switches period and updates display', async () => {
    const user = await navigateToStats();

    // Switch to This Year — should show all sets
    await user.click(screen.getByText('This Year'));

    await waitFor(() => {
      const muscleRows = screen.queryAllByText(/sets$/);
      expect(muscleRows.length).toBeGreaterThan(0);
    });
  });

  it('has front/back toggle for body diagram', async () => {
    await navigateToStats();

    // Look for the side-toggle buttons by their CSS class
    const sideButtons = document.querySelectorAll('.side-btn');
    expect(sideButtons.length).toBe(2);
    expect(sideButtons[0].textContent.trim()).toBe('Front');
    expect(sideButtons[1].textContent.trim()).toBe('Back');
  });

  it('shows exercise progress section', async () => {
    await navigateToStats();

    expect(screen.getByText('Exercise Progress')).toBeInTheDocument();
  });
});
