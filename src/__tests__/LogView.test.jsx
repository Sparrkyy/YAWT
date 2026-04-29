import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as logUtils from '../data/logUtils';
import LogView from '../views/LogView';

vi.mock('../data/api', () => ({
  addSet: vi.fn(() => Promise.resolve()),
  deleteSet: vi.fn(),
}));

vi.mock('../components/SwipeableRow', () => ({
  default: ({ children, onDelete }) => (
    <div>
      {children}
      <button onClick={() => onDelete({ snapBack: vi.fn() })}>swipe-delete</button>
    </div>
  ),
}));

vi.mock('../components/Fireworks', () => ({
  default: ({ onDismiss, label }) => (
    <div data-testid="fireworks" onClick={onDismiss}>
      {label}
    </div>
  ),
}));

vi.mock('../components/ExercisePickerButton', () => ({
  default: ({ exercises, value, onChange }) => (
    <select data-testid="accordion-picker" value={value} onChange={onChange}>
      {exercises.map((ex) => (
        <option key={ex.name} value={ex.name}>
          {ex.name}
        </option>
      ))}
    </select>
  ),
}));

const exercises = [
  { name: 'Bench Press', muscles: {} },
  { name: 'Squat', muscles: {} },
];

const defaultProps = {
  exercises,
  sets: [],
  onSetsChange: vi.fn(() => Promise.resolve()),
  activeUser: 'Ethan',
  onUserChange: vi.fn(),
  logDraft: { exercise: 'Bench Press', reps: '10', weight: '135', notes: '' },
  setLogDraft: vi.fn(),
  users: ['Ethan', 'Ava'],
  onPlanSelect: vi.fn(),
};

describe('LogView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exercise select with options', () => {
    render(<LogView {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('renders user buttons', () => {
    render(<LogView {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Ethan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ava' })).toBeInTheDocument();
  });

  it('does not show fireworks on initial render', () => {
    render(<LogView {...defaultProps} />);
    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument();
  });

  it('shows fireworks after a PR save and dismisses on click', async () => {
    vi.spyOn(logUtils, 'isNewPR').mockReturnValue(true);
    render(<LogView {...defaultProps} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Log Set' }).closest('form'));

    await waitFor(() => {
      expect(screen.getByTestId('fireworks')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('fireworks'));
    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument();
  });

  it('does not show fireworks after a non-PR save', async () => {
    vi.spyOn(logUtils, 'isNewPR').mockReturnValue(false);
    vi.spyOn(logUtils, 'isNewBestSetEver').mockReturnValue(false);
    render(<LogView {...defaultProps} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Log Set' }).closest('form'));

    await waitFor(() => {
      expect(defaultProps.onSetsChange).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument();
  });

  it('shows "New Best!" fireworks when isNewBestSetEver returns true', async () => {
    vi.spyOn(logUtils, 'isNewBestSetEver').mockReturnValue(true);
    vi.spyOn(logUtils, 'isNewPR').mockReturnValue(false);
    render(<LogView {...defaultProps} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Log Set' }).closest('form'));

    await waitFor(() => {
      expect(screen.getByTestId('fireworks')).toBeInTheDocument();
    });

    expect(screen.getByTestId('fireworks')).toHaveTextContent('New Best!');
  });

  it('shows "New PR!" fireworks when only isNewPR returns true', async () => {
    vi.spyOn(logUtils, 'isNewBestSetEver').mockReturnValue(false);
    vi.spyOn(logUtils, 'isNewPR').mockReturnValue(true);
    render(<LogView {...defaultProps} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Log Set' }).closest('form'));

    await waitFor(() => {
      expect(screen.getByTestId('fireworks')).toBeInTheDocument();
    });

    expect(screen.getByTestId('fireworks')).toHaveTextContent('New PR!');
  });

  it('pre-fills weight from last set when exercise is selected', () => {
    const sets = [
      {
        id: '1',
        date: '2026-02-01',
        user: 'Ethan',
        exercise: 'Bench Press',
        reps: 5,
        weight: 135,
        notes: '',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];
    const setLogDraft = vi.fn();
    render(
      <LogView
        {...defaultProps}
        sets={sets}
        logDraft={{ exercise: '', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Bench Press' } });

    expect(setLogDraft).toHaveBeenCalled();
    const updater = setLogDraft.mock.calls[0][0];
    expect(updater({ exercise: '', reps: '', weight: '', notes: '' })).toMatchObject({
      weight: '135',
    });
  });

  it('leaves weight empty when no prior sets exist for the exercise', () => {
    const setLogDraft = vi.fn();
    render(
      <LogView
        {...defaultProps}
        sets={[]}
        logDraft={{ exercise: '', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Bench Press' } });

    expect(setLogDraft).toHaveBeenCalled();
    const updater = setLogDraft.mock.calls[0][0];
    expect(updater({ exercise: '', reps: '', weight: '', notes: '' })).toMatchObject({
      weight: '',
    });
  });

  it('calls onUserChange with the new user when user toggle is clicked', () => {
    const onUserChange = vi.fn();
    render(<LogView {...defaultProps} onUserChange={onUserChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ava' }));
    expect(onUserChange).toHaveBeenCalledWith('Ava');
  });

  it('renders plan chips when plans are provided', () => {
    const plans = [{ id: 'p1', name: 'Push Day', exerciseIds: [] }];
    render(<LogView {...defaultProps} plans={plans} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Push Day' })).toBeInTheDocument();
  });

  it('does not render plan chips when plans array is empty', () => {
    render(<LogView {...defaultProps} plans={[]} />);
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
  });

  it('clicking a plan chip calls onPlanSelect with the plan id', () => {
    const onPlanSelect = vi.fn();
    const plans = [{ id: 'p1', name: 'Push Day', exerciseIds: ['ex-1'] }];
    render(<LogView {...defaultProps} plans={plans} onPlanSelect={onPlanSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Push Day' }));
    expect(onPlanSelect).toHaveBeenCalledWith('p1');
  });

  it('filters exercises when activePlanId prop is set', () => {
    const plans = [{ id: 'p1', name: 'Push Day', exerciseIds: ['ex-1'] }];
    const exercises = [
      { id: 'ex-1', name: 'Bench Press', muscles: {} },
      { id: 'ex-2', name: 'Squat', muscles: {} },
    ];
    render(
      <LogView {...defaultProps} plans={plans} exercises={exercises} activePlanId="p1" />
    );
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toContain('Bench Press');
    expect(options.map((o) => o.textContent)).not.toContain('Squat');
  });

  it('clicking All chip calls onPlanSelect with null', () => {
    const onPlanSelect = vi.fn();
    const plans = [{ id: 'p1', name: 'Push Day', exerciseIds: ['ex-1'] }];
    render(
      <LogView {...defaultProps} plans={plans} activePlanId="p1" onPlanSelect={onPlanSelect} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(onPlanSelect).toHaveBeenCalledWith(null);
  });

  it('shows confirm dialog and cancels delete without calling API', async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const todaySet = {
      id: 's1',
      date: today,
      user: 'Ethan',
      exercise: 'Bench Press',
      reps: 5,
      weight: 100,
      notes: '',
      createdAt: new Date().toISOString(),
    };
    render(<LogView {...defaultProps} sets={[todaySet]} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const { deleteSet } = await import('../data/api');
    expect(deleteSet).not.toHaveBeenCalled();
  });

  it('calls deleteSet and onSetsChange when delete is confirmed', async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const todaySet = {
      id: 's1',
      date: today,
      user: 'Ethan',
      exercise: 'Bench Press',
      reps: 5,
      weight: 100,
      notes: '',
      createdAt: new Date().toISOString(),
    };
    const onSetsChange = vi.fn(() => Promise.resolve());
    render(<LogView {...defaultProps} sets={[todaySet]} onSetsChange={onSetsChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'swipe-delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const { deleteSet } = await import('../data/api');
    await waitFor(() => expect(deleteSet).toHaveBeenCalledWith('s1'));
    expect(onSetsChange).toHaveBeenCalled();
  });

  it('clears exercise when selected plan does not include current exercise', () => {
    const setLogDraft = vi.fn();
    const exercises = [
      { id: 'ex-1', name: 'Bench Press', muscles: {} },
      { id: 'ex-2', name: 'Squat', muscles: {} },
    ];
    const plans = [{ id: 'p1', name: 'Leg Day', exerciseIds: ['ex-2'] }];
    render(
      <LogView
        {...defaultProps}
        exercises={exercises}
        plans={plans}
        logDraft={{ exercise: 'Bench Press', reps: '10', weight: '135', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Leg Day' }));
    expect(setLogDraft).toHaveBeenCalled();
  });

  it('calls setLogDraft when notes input changes', () => {
    const setLogDraft = vi.fn();
    render(<LogView {...defaultProps} setLogDraft={setLogDraft} />);
    fireEvent.change(screen.getByPlaceholderText('optional'), { target: { value: 'felt good' } });
    expect(setLogDraft).toHaveBeenCalled();
  });

  it('does not submit when weight is empty', async () => {
    const { addSet } = await import('../data/api');
    render(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Bench Press', reps: '10', weight: '', notes: '' }}
      />
    );
    fireEvent.submit(screen.getByRole('button', { name: 'Log Set' }).closest('form'));
    expect(addSet).not.toHaveBeenCalled();
  });

  it('selects exercise via accordion picker when useAccordionPicker=true', () => {
    const setLogDraft = vi.fn();
    render(
      <LogView
        {...defaultProps}
        useAccordionPicker
        setLogDraft={setLogDraft}
        logDraft={{ exercise: '', reps: '', weight: '', notes: '' }}
      />
    );
    fireEvent.change(screen.getByTestId('accordion-picker'), { target: { value: 'Squat' } });
    expect(setLogDraft).toHaveBeenCalled();
  });

  it('does not show toggle button when only one exercise has been selected', () => {
    render(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Bench Press', reps: '', weight: '', notes: '' }}
      />
    );
    expect(screen.queryByRole('button', { name: /Switch to/i })).not.toBeInTheDocument();
  });

  it('shows toggle button after selecting a second exercise', () => {
    const setLogDraft = vi.fn((fn) => fn({ exercise: 'Bench Press', reps: '', weight: '', notes: '' }));
    const { rerender } = render(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Bench Press', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Squat' } });
    rerender(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Squat', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    expect(screen.getByRole('button', { name: 'Switch to Bench Press' })).toBeInTheDocument();
  });

  it('toggle button swaps back to previous exercise', () => {
    const sets = [
      {
        id: '1',
        date: '2026-02-01',
        user: 'Ethan',
        exercise: 'Bench Press',
        reps: 5,
        weight: 135,
        notes: '',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];
    const setLogDraft = vi.fn((fn) => fn({ exercise: 'Bench Press', reps: '', weight: '', notes: '' }));
    const { rerender } = render(
      <LogView
        {...defaultProps}
        sets={sets}
        logDraft={{ exercise: 'Bench Press', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Squat' } });
    rerender(
      <LogView
        {...defaultProps}
        sets={sets}
        logDraft={{ exercise: 'Squat', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Bench Press' }));
    const lastCall = setLogDraft.mock.calls[setLogDraft.mock.calls.length - 1][0];
    const result = lastCall({ exercise: 'Squat', reps: '', weight: '', notes: '' });
    expect(result.exercise).toBe('Bench Press');
    expect(result.weight).toBe('135');
  });

  it('toggle button is re-pressable to swap forward again', () => {
    const setLogDraft = vi.fn((fn) => fn({ exercise: 'Bench Press', reps: '', weight: '', notes: '' }));
    const { rerender } = render(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Bench Press', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Squat' } });
    rerender(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Squat', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Bench Press' }));
    rerender(
      <LogView
        {...defaultProps}
        logDraft={{ exercise: 'Bench Press', reps: '', weight: '', notes: '' }}
        setLogDraft={setLogDraft}
      />
    );
    expect(screen.getByRole('button', { name: 'Switch to Squat' })).toBeInTheDocument();
  });

  it('shows last set with null reps as weight-only', () => {
    const sets = [
      {
        id: '1',
        date: '2026-02-01',
        user: 'Ethan',
        exercise: 'Bench Press',
        reps: null,
        weight: 100,
        notes: '',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];
    render(<LogView {...defaultProps} sets={sets} />);
    expect(screen.getByText('100 lbs')).toBeInTheDocument();
  });

  it('shows null-reps stat as "weight lbs" for today set', () => {
    const today = new Date().toLocaleDateString('en-CA');
    const todaySet = {
      id: 's2',
      date: today,
      user: 'Ethan',
      exercise: 'Bench Press',
      reps: null,
      weight: 100,
      notes: '',
      createdAt: new Date().toISOString(),
    };
    render(<LogView {...defaultProps} sets={[todaySet]} />);
    expect(screen.getByText('100 lbs')).toBeInTheDocument();
  });

  it('shows notes for today sets', () => {
    const today = new Date().toLocaleDateString('en-CA');
    const todaySet = {
      id: 's3',
      date: today,
      user: 'Ethan',
      exercise: 'Bench Press',
      reps: 5,
      weight: 100,
      notes: 'paused reps',
      createdAt: new Date().toISOString(),
    };
    render(<LogView {...defaultProps} sets={[todaySet]} />);
    expect(screen.getAllByText('paused reps').length).toBeGreaterThan(0);
  });
});
