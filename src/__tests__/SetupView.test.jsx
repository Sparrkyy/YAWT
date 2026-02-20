import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SetupView from '../views/SetupView';

vi.mock('../data/sheetsApi', () => ({
  createNewSheet: vi.fn(),
  validateSheet: vi.fn(),
}));

import { createNewSheet, validateSheet } from '../data/sheetsApi';

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Sheet phase
// ---------------------------------------------------------------------------

describe('SetupView — sheet phase', () => {
  function renderSheet(overrides = {}) {
    return render(
      <SetupView
        setupPhase="sheet"
        onSheetReady={vi.fn()}
        onUsersReady={vi.fn()}
        {...overrides}
      />
    );
  }

  it('renders sheet setup UI', () => {
    renderSheet();
    expect(screen.getByText('Set up your workout sheet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create a new YAWT sheet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Link existing sheet/i })).toBeInTheDocument();
  });

  it('Create → success calls onSheetReady with returned ID', async () => {
    const onSheetReady = vi.fn();
    createNewSheet.mockResolvedValue('new-id');
    renderSheet({ onSheetReady });
    fireEvent.click(screen.getByRole('button', { name: /Create a new YAWT sheet/i }));
    await waitFor(() => expect(onSheetReady).toHaveBeenCalledWith('new-id'));
  });

  it('Create → failure shows error text', async () => {
    createNewSheet.mockRejectedValue(new Error('drive error'));
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Create a new YAWT sheet/i }));
    await waitFor(() =>
      expect(screen.getByText(/Failed to create sheet/i)).toBeInTheDocument()
    );
  });

  it('Create → loading state shows "Creating…" and disables button', async () => {
    createNewSheet.mockReturnValue(new Promise(() => {})); // never resolves
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Create a new YAWT sheet/i }));
    const btn = screen.getByRole('button', { name: /Creating…/i });
    expect(btn).toBeDisabled();
  });

  it('Link button is disabled when input is empty', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /Link existing sheet/i })).toBeDisabled();
  });

  it('Link → success calls onSheetReady with the entered ID', async () => {
    const onSheetReady = vi.fn();
    validateSheet.mockResolvedValue(true);
    renderSheet({ onSheetReady });
    fireEvent.change(screen.getByPlaceholderText(/Paste your Sheet ID/i), {
      target: { value: 'my-sheet-id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Link existing sheet/i }));
    await waitFor(() => expect(onSheetReady).toHaveBeenCalledWith('my-sheet-id'));
  });

  it('Link → validation failure shows error text', async () => {
    validateSheet.mockResolvedValue(false);
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText(/Paste your Sheet ID/i), {
      target: { value: 'bad-id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Link existing sheet/i }));
    await waitFor(() =>
      expect(screen.getByText(/Could not access that sheet/i)).toBeInTheDocument()
    );
  });

  it('Link → network error shows "Failed to validate" error', async () => {
    validateSheet.mockRejectedValue(new Error('network'));
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText(/Paste your Sheet ID/i), {
      target: { value: 'some-id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Link existing sheet/i }));
    await waitFor(() =>
      expect(screen.getByText(/Failed to validate/i)).toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
// Users phase
// ---------------------------------------------------------------------------

describe('SetupView — users phase', () => {
  function renderUsers(overrides = {}) {
    return render(
      <SetupView
        setupPhase="users"
        onSheetReady={vi.fn()}
        onUsersReady={vi.fn()}
        {...overrides}
      />
    );
  }

  it('renders users UI with 2 inputs', () => {
    renderUsers();
    expect(screen.getByText('Who will be tracking workouts here?')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('"Get started" is disabled when all inputs are empty', () => {
    renderUsers();
    expect(screen.getByRole('button', { name: /Get started/i })).toBeDisabled();
  });

  it('calls onUsersReady with trimmed non-empty names', () => {
    const onUsersReady = vi.fn();
    renderUsers({ onUsersReady });
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Ethan' } });
    fireEvent.click(screen.getByRole('button', { name: /Get started/i }));
    expect(onUsersReady).toHaveBeenCalledWith(['Ethan']);
  });

  it('filters out blank inputs before calling onUsersReady', () => {
    const onUsersReady = vi.fn();
    renderUsers({ onUsersReady });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Ethan' } });
    // inputs[1] stays empty
    fireEvent.click(screen.getByRole('button', { name: /Get started/i }));
    expect(onUsersReady).toHaveBeenCalledWith(['Ethan']);
  });

  it('"+ Add another" adds an input; hidden when there are already 4 inputs', () => {
    renderUsers();
    // starts with 2 inputs
    fireEvent.click(screen.getByRole('button', { name: /\+ Add another/i }));
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add another/i }));
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    // button should now be hidden
    expect(screen.queryByRole('button', { name: /\+ Add another/i })).toBeNull();
  });
});
