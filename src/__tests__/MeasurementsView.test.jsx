import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MeasurementsView from '../views/MeasurementsView';

const mockAddMeasurement = vi.fn().mockResolvedValue({});
const mockDeleteMeasurement = vi.fn().mockResolvedValue({});

vi.mock('../data/api', () => ({
  addMeasurement: (...args) => mockAddMeasurement(...args),
  deleteMeasurement: (...args) => mockDeleteMeasurement(...args),
}));

vi.mock('../components/SwipeableRow', () => ({
  default: ({ children, onDelete }) => (
    <div>
      {children}
      <button onClick={() => onDelete({ snapBack: vi.fn() })}>swipe-delete</button>
    </div>
  ),
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

function defaultProps(overrides = {}) {
  return {
    measurements: [],
    onMeasurementsChange: vi.fn(() => Promise.resolve()),
    activeUser: 'Ethan',
    onUserChange: vi.fn(),
    users: ['Ethan', 'Ava'],
    ...overrides,
  };
}

describe('MeasurementsView', () => {
  beforeEach(() => {
    mockAddMeasurement.mockClear();
    mockDeleteMeasurement.mockClear();
  });
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
    fireEvent.change(allInputs[4], { target: { value: '32' } }); // waist

    const submitBtn = screen.getByRole('button', { name: /Log Measurements/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(mockAddMeasurement).toHaveBeenCalledTimes(2));
    expect(onMeasurementsChange).toHaveBeenCalled();
  });

  it('calls onMeasurementsChange after submit', async () => {
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

  it('renders user toggle and calls onUserChange when clicked', () => {
    const onUserChange = vi.fn();
    render(
      <MeasurementsView {...defaultProps({ onUserChange })} measurements={[makeMeasurement()]} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ava' }));
    expect(onUserChange).toHaveBeenCalledWith('Ava');
  });

  it('shows confirm dialog after swipe-delete', () => {
    render(<MeasurementsView {...defaultProps()} measurements={[makeMeasurement()]} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls deleteMeasurement and onMeasurementsChange when delete confirmed', async () => {
    const onMeasurementsChange = vi.fn(() => Promise.resolve());
    const m = makeMeasurement();
    render(<MeasurementsView {...defaultProps({ onMeasurementsChange })} measurements={[m]} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(mockDeleteMeasurement).toHaveBeenCalledWith(m.id));
    expect(onMeasurementsChange).toHaveBeenCalled();
  });

  it('dismisses confirm dialog without deleting when Cancel clicked', () => {
    render(<MeasurementsView {...defaultProps()} measurements={[makeMeasurement()]} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(mockDeleteMeasurement).not.toHaveBeenCalled();
  });

  it('toggles measurement hint when info button is clicked', () => {
    render(<MeasurementsView {...defaultProps()} />);
    const hintBtns = screen.getAllByRole('button', { name: /Measurement guide for/i });
    fireEvent.click(hintBtns[0]);
    // After clicking, at least one hint text should become visible
    const hints = document.querySelectorAll('.measurement-hint');
    expect(hints.length).toBeGreaterThan(0);
  });
});
