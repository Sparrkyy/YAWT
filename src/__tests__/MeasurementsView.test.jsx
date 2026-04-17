import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MeasurementsView from '../views/MeasurementsView';

const mockAddMeasurement = vi.fn().mockResolvedValue({});
const mockDeleteMeasurement = vi.fn().mockResolvedValue({});

vi.mock('../data/api', () => ({
  addMeasurement: (...args) => mockAddMeasurement(...args),
  deleteMeasurement: (...args) => mockDeleteMeasurement(...args),
}));

vi.mock('../components/SwipeableRow', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

function makeMeasurement(overrides = {}) {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2026-02-19',
    user: 'Ethan',
    type: 'waist',
    value: 32,
    unit: 'in',
    notes: '',
    createdAt: '2026-02-19T08:00:00.000Z',
    ...overrides,
  };
}

describe('MeasurementsView', () => {
  it('shows empty state when no measurements are logged', () => {
    render(
      <MeasurementsView
        measurements={[]}
        onMeasurementsChange={() => {}}
        activeUser="Ethan"
        onUserChange={() => {}}
        users={['Ethan', 'Ava']}
      />
    );
    expect(screen.getByText('No measurements logged yet.')).toBeInTheDocument();
  });

  it('renders history grouped by date with label and value', () => {
    const measurements = [
      makeMeasurement({ type: 'waist', value: 32, unit: 'in', date: '2026-02-19' }),
      makeMeasurement({ type: 'weight', value: 185, unit: 'lbs', date: '2026-02-19' }),
    ];
    render(
      <MeasurementsView
        measurements={measurements}
        onMeasurementsChange={() => {}}
        activeUser="Ethan"
        onUserChange={() => {}}
        users={['Ethan']}
      />
    );
    // The value+unit strings are unique to the history section
    expect(screen.getByText('32 in')).toBeInTheDocument();
    expect(screen.getByText('185 lbs')).toBeInTheDocument();
    // Labels appear in history rows
    expect(screen.getAllByText('Waist').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Weight').length).toBeGreaterThan(0);
  });

  it('shows most recent date first', () => {
    const measurements = [
      makeMeasurement({ date: '2026-02-10', type: 'waist', value: 33 }),
      makeMeasurement({ date: '2026-02-19', type: 'waist', value: 32 }),
    ];
    render(
      <MeasurementsView
        measurements={measurements}
        onMeasurementsChange={() => {}}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toMatch(/Feb 19/);
    expect(headings[1].textContent).toMatch(/Feb 10/);
  });

  it('calls addMeasurement for each non-empty field on submit', async () => {
    mockAddMeasurement.mockResolvedValue({});
    const onMeasurementsChange = vi.fn().mockResolvedValue();

    render(
      <MeasurementsView
        measurements={[]}
        onMeasurementsChange={onMeasurementsChange}
        activeUser="Ethan"
        onUserChange={() => {}}
        users={['Ethan']}
      />
    );

    // Weight is allInputs[0] (Body group), Waist is allInputs[4] (Upper: neck/shoulders/chest/waist)
    const allInputs = screen.getAllByPlaceholderText('—');
    fireEvent.change(allInputs[0], { target: { value: '185' } }); // weight
    fireEvent.change(allInputs[4], { target: { value: '32' } });  // waist

    const submitBtn = screen.getByRole('button', { name: /Log Measurements/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(mockAddMeasurement).toHaveBeenCalledTimes(2));
    expect(onMeasurementsChange).toHaveBeenCalled();
  });

  it('calls onMeasurementsChange after submit', async () => {
    mockAddMeasurement.mockClear();
    mockAddMeasurement.mockResolvedValue({});
    const onMeasurementsChange = vi.fn().mockResolvedValue();

    render(
      <MeasurementsView
        measurements={[]}
        onMeasurementsChange={onMeasurementsChange}
        activeUser="Ethan"
        onUserChange={() => {}}
      />
    );

    const allInputs = screen.getAllByPlaceholderText('—');
    fireEvent.change(allInputs[0], { target: { value: '185' } });

    fireEvent.click(screen.getByRole('button', { name: /Log Measurements/i }));

    await waitFor(() => expect(onMeasurementsChange).toHaveBeenCalled());
  });
});
